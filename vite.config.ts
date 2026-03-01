// vite.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/mta-alerts': {
        target: 'https://api-endpoint.mta.info',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mta-alerts/, '/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Host', 'api-endpoint.mta.info');
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0');
            proxyReq.setHeader('Accept', '*/*');
          });
        },
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setupTests.ts',
  },
});