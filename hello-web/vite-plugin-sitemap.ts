import type { Plugin } from 'vite';
import { ALL_PUBLIC_PATHS } from './src/data/routes';

/**
 * Writes sitemap.xml and robots.txt into the build from the shared route list
 * (both core pages and every `/blog/:slug` article).
 *
 * Generated at build time rather than kept in public/ because both need absolute
 * URLs, and the site's address depends on SITE_URL and BASE_PATH.
 */
export default function sitemap(options: { siteUrl: string }): Plugin {
  const origin = options.siteUrl.replace(/\/+$/, '');

  let base = '/';
  const urlFor = (path: string) => `${origin}${base}${path.replace(/^\//, '')}`;

  return {
    name: 'hello-sitemap',
    apply: 'build',

    configResolved(config) {
      base = config.base;
    },

    generateBundle() {
      const urls = ALL_PUBLIC_PATHS.map(path => `  <url><loc>${urlFor(path)}</loc></url>`).join('\n');

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
