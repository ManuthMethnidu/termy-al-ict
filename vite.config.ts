import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        privacy: path.resolve(__dirname, 'privacy/index.html'),
        terms: path.resolve(__dirname, 'terms/index.html'),
        'privacy-policy': path.resolve(__dirname, 'privacy-policy/index.html'),
        'terms-of-service': path.resolve(__dirname, 'terms-of-service/index.html'),
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
