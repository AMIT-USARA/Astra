import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// /api is proxied to the Express server in development, so the browser talks to
// one origin and the report download link works without CORS.
// Follows PORT from backend/.env so the proxy and the API never disagree.
const backendPort = loadEnv('', '../backend', '').PORT || 5000;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'charts';
          if (id.includes('node_modules/react-router')) return 'router';
          if (id.includes('node_modules/lucide-react')) return 'icons';
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: { '/api': process.env.VITE_API_PROXY || `http://localhost:${backendPort}` },
  },
});
