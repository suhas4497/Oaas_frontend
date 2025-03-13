import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://app.vssps.visualstudio.com', // For fetching organizations
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/org': {
        target: 'https://dev.azure.com', // For fetching repos inside an organization
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/org/, ''),
      },
      '/oaas/v1/api': {
        target: 'http://localhost:8080', // Backend API
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/oaas\/v1\/api/, ''),
      },
    },
  },
})
