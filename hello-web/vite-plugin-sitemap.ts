import type { Plugin } from 'vite';
import { ROUTE_PATHS } from './src/data/routes';

/**
 * Writes sitemap.xml and robots.txt into the build from the shared route list.
 *
 * They are generated rather than kept in public/ because both need absolute
 * URLs, and the site's address is not known until it is built — the same source
 * serves a GitHub Pages sub-path and an Amplify domain root. A checked-in
 * sitemap would be wrong for one of them.
 */
export default function sitemap(options: { siteUrl: string }): Plugin {
  const origin = options.siteUrl.replace(/\/+$/, '');

  // Vite's resolved base, not the configured one: it is what the built asset
  // URLs use, and Vite has normalised it to end in a slash however BASE_PATH
  // was written. Joined so exactly one slash falls between each part.
  let base = '/';
  const urlFor = (path: string) => `${origin}${base}${path.replace(/^\//, '')}`;

  return {
    name: 'hello-sitemap',
    // Only meaningful for a real build; `vite dev` serves from source.
    apply: 'build',

    configResolved(config) {
      base = config.base;
    },

    generateBundle() {
      /*
       * No <lastmod>, <changefreq> or <priority>.
       *
       * Google ignores the last two outright, and trusts lastmod only where the
       * dates are demonstrably real. The honest date for a page is the last time
       * its content changed, which this build does not know — stamping every
       * page with the build time would be a claim we cannot back, and a sitemap
       * that cries wolf about freshness is discounted for good.
       */
      const urls = ROUTE_PATHS.map(path => `  <url><loc>${urlFor(path)}</loc></url>`).join('\n');

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          `${urls}\n` +
          '</urlset>\n',
      });

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${urlFor('/sitemap.xml')}\n`,
      });
    },
  };
}
