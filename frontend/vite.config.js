import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// /api is proxied to the Express server in development, so the browser talks to
// one origin and the report download link works without CORS.
// Follows PORT from backend/.env so the proxy and the API never disagree.
const backendPort = loadEnv('', '../backend', '').PORT || 5000;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: { '/api': process.env.VITE_API_PROXY || `http://localhost:${backendPort}` },
  },
});
