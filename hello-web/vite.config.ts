import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const root = fileURLToPath(new URL('.', import.meta.url));

// Standalone public website. Self-contained: own package.json, node_modules,
// and .env all live in this folder.
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, root, '');
  // GitHub Pages serves a project site under /<repo>/, so the build needs that
  // prefix on every asset URL. Dev stays at '/'. Override with BASE_PATH if the
  // repo is renamed or the site moves to a custom domain (then use '/').
  const base = env.BASE_PATH || (command === 'build' ? '/hello-web/' : '/');
  return {
    root,
    base,
    plugins: [react(), tailwindcss()],
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
        },
      },
    },
  };
});
