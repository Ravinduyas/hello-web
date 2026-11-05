import type { Plugin } from 'vite';
import { getBlogPostByPath } from './src/data/blog';
import { ALL_ROUTE_PATHS } from './src/data/routes';

/**
 * Writes sitemap.xml and robots.txt into the build from the shared route list
 * (core pages plus every `/blog/<slug>` guide).
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
      const urls = ALL_ROUTE_PATHS.map(path => {
        const post = getBlogPostByPath(path);
        const lastmod = post ? `<lastmod>${post.updatedAt}</lastmod>` : '';
        return `  <url><loc>${urlFor(path)}</loc>${lastmod}</url>`;
      }).join('\n');

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
