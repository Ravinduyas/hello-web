import type { Plugin } from 'vite';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ROUTE_PATHS } from './src/data/routes';
import { PAGE_SEO } from './src/data/seo';
import { bikes } from './src/data/fleet';

/**
 * Writes a real HTML file for every route, with that route's own metadata.
 *
 * Two problems, one fix. The host answered every path but `/` with a redirect to
 * a trailing slash and then a 404, because a single-page app ships exactly one
 * HTML file and nothing existed at `/fleet/`. And every page that did load
 * carried the same title, no description, no canonical and no preview card.
 *
 * Emitting `fleet/index.html` — a copy of the shell with its own head — makes
 * the path exist on any static host without a rewrite rule, and gives crawlers
 * and WhatsApp something true to read. The body is still rendered by React in
 * the browser; this is not server rendering, and the audit's finding about
 * crawlable body text stands until that is done.
 */

const SHOP = {
  name: 'Hello Rent',
  phone: '+94767073388',
  town: 'Weligama',
  region: 'Southern Province',
  country: 'LK',
  opens: '07:00',
  closes: '21:00',
  // TODO: the street address is not published anywhere on the site. Fill this
  // in and it flows into LocalBusiness schema, which is what map packs read.
  street: '',
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function localBusinessSchema(origin: string) {
  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressLocality: SHOP.town,
    addressRegion: SHOP.region,
    addressCountry: SHOP.country,
  };
  if (SHOP.street) address.streetAddress = SHOP.street;

  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: SHOP.name,
    url: origin + '/',
    telephone: SHOP.phone,
    image: origin + '/photos/shop-front.jpg',
    priceRange: '€€',
    address,
    areaServed: [SHOP.town, 'Mirissa', 'Midigama', 'Ahangama', 'Matara'],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: SHOP.opens,
      closes: SHOP.closes,
    },
  };
}

/** The fleet as an offer list — models, daily rates, availability. */
function fleetSchema(origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Hello Rent fleet',
    itemListElement: bikes.slice(0, 25).map((bike, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: bike.title,
        category: bike.category,
        image: origin + bike.image,
        offers: {
          '@type': 'Offer',
          price: bike.pricePerDay,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          url: origin + '/book-now',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: bike.pricePerDay,
            priceCurrency: 'EUR',
            unitCode: 'DAY',
          },
        },
      },
    })),
  };
}

export default function seoRoutes(options: { siteUrl: string }): Plugin {
  const origin = options.siteUrl.replace(/\/+$/, '');
  let outDir = 'dist';
  let base = '/';

  return {
    name: 'hello-seo-routes',
    apply: 'build',

    configResolved(config) {
      outDir = config.build.outDir;
      base = config.base;
    },

    closeBundle() {
      const root = join(outDir, 'index.html');
      let shell: string;
      try {
        shell = readFileSync(root, 'utf8');
      } catch {
        return; // nothing built (library mode, or a failed build)
      }

      // The template carries one hard-coded title for the whole site; each page
      // supplies its own below, so the original has to go first.
      const stripped = shell.replace(/\s*<title>[\s\S]*?<\/title>/i, '');

      for (const path of ROUTE_PATHS) {
        const seo = PAGE_SEO[path];
        const url = origin + (path === '/' ? '/' : path);
        const image = origin + (seo.image ?? '/photos/shop-front.jpg');

        const schemas: unknown[] = [localBusinessSchema(origin)];
        if (path === '/fleet') schemas.push(fleetSchema(origin));

        const head = [
          `<title>${esc(seo.title)}</title>`,
          `<meta name="description" content="${esc(seo.description)}" />`,
          `<link rel="canonical" href="${url}" />`,
          `<meta property="og:type" content="website" />`,
          `<meta property="og:site_name" content="${SHOP.name}" />`,
          `<meta property="og:locale" content="en_GB" />`,
          `<meta property="og:title" content="${esc(seo.title)}" />`,
          `<meta property="og:description" content="${esc(seo.description)}" />`,
          `<meta property="og:url" content="${url}" />`,
          `<meta property="og:image" content="${image}" />`,
          `<meta name="twitter:card" content="summary_large_image" />`,
          `<meta name="twitter:title" content="${esc(seo.title)}" />`,
          `<meta name="twitter:description" content="${esc(seo.description)}" />`,
          `<meta name="twitter:image" content="${image}" />`,
          ...schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`),
        ]
          .map(tag => '    ' + tag)
          .join('\n');

        const html = stripped.replace('</head>', `${head}\n  </head>`);

        // '/' overwrites the shell itself; every other route becomes a
        // directory with its own index.html, which is the file a static host
        // looks for when it redirects /fleet to /fleet/.
        const file = path === '/' ? root : join(outDir, path.replace(/^\//, ''), 'index.html');
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, html);
      }

      this.warn?.(`seo-routes: wrote ${ROUTE_PATHS.length} pre-titled HTML files under ${base}`);
    },
  };
}
