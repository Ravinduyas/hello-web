import type { Plugin } from 'vite';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { BLOG_POSTS, getBlogPostByPath, type BlogPost } from './src/data/blog';
import { CONTACT } from './src/data/contact';
import { bikes } from './src/data/fleet';
import { ALL_ROUTE_PATHS } from './src/data/routes';
import { seoFor } from './src/data/seo';

/**
 * Writes a real HTML file for every route (including `/blog/<slug>`), with
 * route-specific head tags, structured data (AutoRental, Blog, BlogPosting,
 * BreadcrumbList, FAQPage), and a semantic `<noscript>` fallback for non-JS
 * crawlers.
 */

const SHOP = {
  name: 'Hello Rent',
  legalLabel: 'Hello Rent - Scooter & Tuktuk Rental',
  phone: '+94767073388',
  town: 'Weligama',
  region: 'Southern Province',
  country: 'LK',
  opens: '07:00',
  closes: '21:00',
  latitude: 5.973686,
  longitude: 80.432791,
  street: '',
};

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Converts inline `[label](/path)` and `**bold**` syntax into safe static HTML for `<noscript>`. */
function richToHtml(text: string, origin: string): string {
  return esc(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, href: string) => {
      const fullHref = href.startsWith('/') ? `${origin}${href}` : href;
      return `<a href="${fullHref}">${label}</a>`;
    });
}

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
    alternateName: SHOP.legalLabel,
    description:
      'Scooter rental, manual bike rent, and self-drive tuk-tuk rental in Weligama, Southern Province, Sri Lanka.',
    url: origin + '/',
    telephone: SHOP.phone,
    image: origin + '/photos/shop-front.jpg',
    hasMap: CONTACT.directionsUrl,
    priceRange: '€€',
    address,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SHOP.latitude,
      longitude: SHOP.longitude,
    },
    areaServed: [SHOP.town, 'Mirissa', 'Midigama', 'Ahangama', 'Galle', 'Matara', 'Sri Lanka'],
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
        image: origin + bike.image.replace(/^\/+/, '/'),
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

function blogHubSchema(origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Hello Rent — Weligama & Sri Lanka Riding Guides',
    description:
      'Practical guides on Weligama scooter rental, bike rent in Weligama, and renting a scooter or self-drive tuk-tuk in Sri Lanka.',
    url: origin + '/blog',
    publisher: {
      '@type': 'AutoRental',
      name: SHOP.name,
      alternateName: SHOP.legalLabel,
      url: origin + '/',
    },
    blogPost: BLOG_POSTS.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: origin + post.path,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      description: post.metaDescription,
      keywords: post.keywords.join(', '),
    })),
  };
}

function blogPostSchemas(origin: string, post: BlogPost) {
  const url = origin + post.path;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.metaDescription,
      image: origin + post.heroImage,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      keywords: post.keywords.join(', '),
      author: {
        '@type': 'Organization',
        name: SHOP.legalLabel,
        url: origin + '/about',
      },
      publisher: {
        '@type': 'AutoRental',
        name: SHOP.name,
        alternateName: SHOP.legalLabel,
        url: origin + '/',
        logo: {
          '@type': 'ImageObject',
          url: origin + '/brand/logo.jpg',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: origin + '/' },
        { '@type': 'ListItem', position: 2, name: 'Riding Guides', item: origin + '/blog' },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ];
}

function renderBlogHubNoscript(origin: string): string {
  const items = BLOG_POSTS.map(
    post =>
      `<li><a href="${origin}${post.path}"><strong>${esc(post.title)}</strong></a> — ${esc(post.excerpt)}</li>`,
  ).join('');
  return (
    `<noscript><main>` +
    `<h1>Weligama &amp; Sri Lanka Scooter, Bike &amp; Tuk-Tuk Rental Guides — Hello Rent</h1>` +
    `<p>Local guides written by Bhagya (“Lucky”) &amp; Sandra at Hello Rent - Scooter &amp; Tuktuk Rental in Weligama, Sri Lanka.</p>` +
    `<ul>${items}</ul>` +
    `<p><a href="${origin}/fleet">View Fleet &amp; Daily Prices</a> · <a href="${origin}/book-now">Book a Scooter or Tuk-Tuk in Weligama</a> · <a href="${origin}/driving-permit">Sri Lankan Driving Permit Guide</a></p>` +
    `</main></noscript>`
  );
}

function renderBlogPostNoscript(origin: string, post: BlogPost): string {
  const takeaways = post.keyTakeaways.map(t => `<li>${esc(t)}</li>`).join('');
  const sections = post.sections
    .map(sec => {
      const paras = sec.paragraphs.map(p => `<p>${richToHtml(p, origin)}</p>`).join('');
      const bullets = sec.bullets
        ? `<ul>${sec.bullets.map(b => `<li><strong>${esc(b.label)}:</strong> ${esc(b.text)}</li>`).join('')}</ul>`
        : '';
      return `<section id="${esc(sec.id)}"><h2>${esc(sec.heading)}</h2>${paras}${bullets}</section>`;
    })
    .join('');
  const faqs = post.faqs
    .map(f => `<div><h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p></div>`)
    .join('');

  return (
    `<noscript><article>` +
    `<nav><a href="${origin}/">Home</a> / <a href="${origin}/blog">Blog</a></nav>` +
    `<h1>${esc(post.title)}</h1>` +
    `<p>${esc(post.excerpt)}</p>` +
    `<h2>Key Takeaways</h2><ul>${takeaways}</ul>` +
    sections +
    `<section><h2>Frequently Asked Questions</h2>${faqs}</section>` +
    `<p>Published by <a href="${origin}/">${esc(SHOP.legalLabel)}</a> in Weligama, Sri Lanka. <a href="${origin}/fleet">Browse fleet</a> or <a href="${origin}/book-now">book online</a>.</p>` +
    `</article></noscript>`
  );
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
        return;
      }

      const stripped = shell.replace(/\s*<title>[\s\S]*?<\/title>/i, '');

      for (const path of ALL_ROUTE_PATHS) {
        const seo = seoFor(path);
        const post = getBlogPostByPath(path);
        const url = origin + (path === '/' ? '/' : path);
        const image = origin + (seo.image ?? '/photos/shop-front.jpg');
        const ogType = seo.ogType ?? 'website';

        const staticSchemas: unknown[] = [localBusinessSchema(origin)];
        if (path === '/fleet') staticSchemas.push(fleetSchema(origin));
        if (path === '/blog') staticSchemas.push(blogHubSchema(origin));

        const dynamicSchemas = post ? blogPostSchemas(origin, post) : [];

        const headTags: string[] = [
          `<title>${esc(seo.title)}</title>`,
          `<meta name="description" content="${esc(seo.description)}" />`,
        ];

        if (seo.keywords && seo.keywords.length > 0) {
          headTags.push(`<meta name="keywords" content="${esc(seo.keywords.join(', '))}" />`);
        }

        headTags.push(
          `<link rel="canonical" href="${url}" />`,
          `<meta property="og:type" content="${ogType}" />`,
          `<meta property="og:site_name" content="${SHOP.name}" />`,
          `<meta property="og:locale" content="en_GB" />`,
          `<meta property="og:title" content="${esc(seo.title)}" />`,
          `<meta property="og:description" content="${esc(seo.description)}" />`,
          `<meta property="og:url" content="${url}" />`,
          `<meta property="og:image" content="${image}" />`,
        );

        if (seo.publishedAt) {
          headTags.push(`<meta property="article:published_time" content="${seo.publishedAt}" />`);
        }
        if (seo.updatedAt) {
          headTags.push(`<meta property="article:modified_time" content="${seo.updatedAt}" />`);
        }

        headTags.push(
          `<meta name="twitter:card" content="summary_large_image" />`,
          `<meta name="twitter:title" content="${esc(seo.title)}" />`,
          `<meta name="twitter:description" content="${esc(seo.description)}" />`,
          `<meta name="twitter:image" content="${image}" />`,
          ...staticSchemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`),
          ...dynamicSchemas.map(
            s => `<script type="application/ld+json" data-dynamic-seo="true">${JSON.stringify(s)}</script>`,
          ),
        );

        const head = headTags.map(tag => '    ' + tag).join('\n');
        let html = stripped.replace('</head>', `${head}\n  </head>`);

        if (post) {
          html = html.replace(
            '<div id="root"></div>',
            `<div id="root"></div>\n    ${renderBlogPostNoscript(origin, post)}`,
          );
        } else if (path === '/blog') {
          html = html.replace(
            '<div id="root"></div>',
            `<div id="root"></div>\n    ${renderBlogHubNoscript(origin)}`,
          );
        }

        const file = path === '/' ? root : join(outDir, path.replace(/^\//, ''), 'index.html');
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, html);
      }

      this.warn?.(`seo-routes: wrote ${ALL_ROUTE_PATHS.length} pre-titled HTML files under ${base}`);
    },
  };
}
