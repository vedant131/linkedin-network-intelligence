import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // GitHub Pages base path
  base: '/linkedin-network-intelligence/',

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },

  define: {
    // process.env reads system env vars (set by GitHub Actions secrets)
    // loadEnv only reads .env files — won't work in CI
    __API_BASE__: JSON.stringify(process.env.VITE_API_BASE || ''),
  },
})
