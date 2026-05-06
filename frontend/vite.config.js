import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    // GitHub Pages deploys to /repo-name/ so set base if needed
    // base: '/linkedin-network-intelligence/',  // ← uncomment & set to your repo name

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
      // In production, API calls go to your Render backend URL
      // Set VITE_API_BASE in GitHub Secrets as your Render URL
      __API_BASE__: JSON.stringify(env.VITE_API_BASE || ''),
    },
  }
})
