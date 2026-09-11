import { fileURLToPath } from 'node:url';
import { createLogger, defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from './vite-plugin-sitemap';
import seoRoutes from './vite-plugin-seo-routes';

const root = fileURLToPath(new URL('.', import.meta.url));

// Standalone public website. Self-contained: own package.json, node_modules,
// and .env all live in this folder.
/**
 * Vite logs its own stack trace for every failed proxy request, on top of the
 * handler below. A backend that isn't running is an expected state here — the
 * site falls back to the bundled fleet — so the trace is noise that buries real
 * errors. Everything else logs as usual.
 */
const logger = createLogger();
const parentError = logger.error;
logger.error = (msg, options) => {
  if (msg.includes('http proxy error')) return;
  parentError(msg, options);
};

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, root, '');
  // The site answers at the root of its own domain, so assets do too. It used
  // to default to the GitHub Pages sub-path /hello-web/, which is the opposite
  // of where it now lives; a project-site deploy needs BASE_PATH=/hello-web/
  // set explicitly.
  const base = env.BASE_PATH || '/';
  // Where the site actually answers, for the absolute URLs a sitemap and a
  // robots.txt must carry. The default is the live domain: an unset SITE_URL
  // used to hand crawlers a github.io address, and on Amplify the branch URL,
  // neither of which is the site anyone should be indexing.
  const siteUrl = env.SITE_URL || 'https://hellorentsrilanka.com';
  if (command === 'build' && !env.SITE_URL) {
    console.log(
      `  ➜  SITE_URL not set — sitemap.xml points at ${siteUrl}${base}. ` +
        'Set SITE_URL to the live domain to fix it.',
    );
  }

  return {
    root,
    base,
    customLogger: logger,
    plugins: [react(), tailwindcss(), sitemap({ siteUrl }), seoRoutes({ siteUrl })],
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Forward API calls to the Hello Manage backend during local dev.
      proxy: {
        '/api': {
          target: `http://localhost:${env.API_PORT || '4000'}`,
          changeOrigin: true,
          // The site works without the admin backend — it falls back to the
          // bundled fleet. So a backend that isn't running is a normal state,
          // not a crash: answer 503 and log one line instead of a stack trace
          // per request.
          configure: proxy => {
            let warned = false;
            proxy.on('error', (err, _req, res) => {
              if (!warned) {
                warned = true;
                const port = env.API_PORT || '4000';
                console.log(
                  `  ➜  Hello Manage backend not running on :${port} — using the bundled fleet. ` +
                    `Start it with "npm run dev" in hello-manage.`,
                );
              }
              if (res && 'writeHead' in res && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'backend offline' }));
              }
              void err;
            });
          },
        },
      },
    },
  };
});
