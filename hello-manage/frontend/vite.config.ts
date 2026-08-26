import { fileURLToPath } from 'node:url';
import { createLogger, defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const root = fileURLToPath(new URL('.', import.meta.url));

/**
 * Vite prints a stack trace for every proxied request that cannot connect. The
 * admin is useless without its backend, so one dropped call becomes a wall of
 * identical traces — a login retry alone produced five. The handler below says
 * what is wrong once; this keeps Vite from repeating it. Other errors log
 * normally.
 */
const logger = createLogger();
const parentError = logger.error;
logger.error = (msg, options) => {
  if (msg.includes('http proxy error')) return;
  parentError(msg, options);
};

// Standalone admin app with its own package.json and node_modules, installed
// and run from this folder.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, '');
  const apiTarget = `http://localhost:${env.API_PORT || '4000'}`;
  return {
    root,
    customLogger: logger,
    plugins: [react(), tailwindcss()],
    server: {
      port: Number(env.ADMIN_PORT) || 5174,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          // Unlike the public site, the admin has nothing to fall back on — so
          // this answers with a message the UI can show the operator, rather
          // than dropping the socket and leaving them a generic fetch failure.
          configure: proxy => {
            let warned = false;
            proxy.on('error', (_err, _req, res) => {
              if (!warned) {
                warned = true;
                console.log(
                  `  ➜  Backend not running on ${apiTarget}. ` +
                    `Start it with "npm run backend" in hello-manage.`,
                );
              }
              if (res && 'writeHead' in res && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    error: 'The Hello Manage backend is not running. Start it and try again.',
                  }),
                );
              }
            });
          },
        },
      },
    },
  };
});
