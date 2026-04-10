import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3003,
    host:'0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://jobhunter_api:5046',
        changeOrigin: true,
      },
    },
  },
});
