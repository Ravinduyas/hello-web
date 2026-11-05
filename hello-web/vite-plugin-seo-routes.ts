import type { Plugin } from 'vite';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { SEO_ROUTES } from './src/data/seo';
import { SHOP_SCHEMA_META, schemasForPath } from './src/data/schema';

/**
 * Writes a real HTML file for every static route and every `/blog/:slug` article,
 * each carrying its own `<title>`, meta description, keywords, canonical link,
 * OpenGraph / Twitter preview tags, and Schema.org JSON-LD (`AutoRental`,
 * `BlogPosting`, `FAQPage`, `BreadcrumbList`, `Blog`, and `ItemList`).
 */

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

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

      // Remove the generic template title so each pre-rendered route gets its own.
      const stripped = shell.replace(/\s*<title>[\s\S]*?<\/title>/i, '');
      const siteRoot = origin + base.replace(/\/+$/, '');

      for (const route of SEO_ROUTES) {
        const { path } = route;
        const url = siteRoot + (path === '/' ? '/' : path);
        const image =
          siteRoot + '/' + (route.image ?? '/photos/shop-front.jpg').replace(/^\/+/, '');
        const ogType = route.type ?? 'website';
        const schemas = schemasForPath(siteRoot, path);

        const tags: string[] = [
          `<title>${esc(route.title)}</title>`,
          `<meta name="description" content="${esc(route.description)}" />`,
        ];

        if (route.keywords && route.keywords.length > 0) {
          tags.push(`<meta name="keywords" content="${esc(route.keywords.join(', '))}" />`);
        }

        tags.push(
          `<link rel="canonical" href="${url}" />`,
          `<meta property="og:type" content="${ogType}" />`,
          `<meta property="og:site_name" content="${esc(SHOP_SCHEMA_META.name)}" />`,
          `<meta property="og:locale" content="en_GB" />`,
          `<meta property="og:title" content="${esc(route.title)}" />`,
          `<meta property="og:description" content="${esc(route.description)}" />`,
          `<meta property="og:url" content="${url}" />`,
          `<meta property="og:image" content="${image}" />`,
        );

        if (ogType === 'article' && route.publishedTime) {
          tags.push(
            `<meta property="article:published_time" content="${esc(route.publishedTime)}" />`,
          );
        }
        if (ogType === 'article' && route.section) {
          tags.push(`<meta property="article:section" content="${esc(route.section)}" />`);
        }
        if (ogType === 'article' && route.keywords) {
          for (const kw of route.keywords) {
            tags.push(`<meta property="article:tag" content="${esc(kw)}" />`);
          }
        }

        tags.push(
          `<meta name="twitter:card" content="summary_large_image" />`,
          `<meta name="twitter:title" content="${esc(route.title)}" />`,
          `<meta name="twitter:description" content="${esc(route.description)}" />`,
          `<meta name="twitter:image" content="${image}" />`,
          ...schemas.map(
            s =>
              `<script type="application/ld+json" data-hello-seo="true">${JSON.stringify(s)}</script>`,
          ),
        );

        const head = tags.map(tag => '    ' + tag).join('\n');
        const html = stripped.replace('</head>', `${head}\n  </head>`);

        const file =
          path === '/' ? root : join(outDir, path.replace(/^\//, ''), 'index.html');
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, html);
      }

      this.warn?.(`seo-routes: wrote ${SEO_ROUTES.length} pre-titled HTML files under ${base}`);
    },
  };
}
