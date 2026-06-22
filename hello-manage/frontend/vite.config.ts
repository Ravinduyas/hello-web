import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const root = fileURLToPath(new URL('.', import.meta.url));

// Standalone admin app. Shares the repo-root node_modules (Node resolves upward),
// so it needs no install of its own.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, '');
  const apiTarget = `http://localhost:${env.API_PORT || '4000'}`;
  return {
    root,
    plugins: [react(), tailwindcss()],
    server: {
      port: Number(env.ADMIN_PORT) || 5174,
      host: '0.0.0.0',
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
  };
});
