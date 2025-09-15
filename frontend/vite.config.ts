import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/auth': 'http://localhost:3001',
      '/portfolio': 'http://localhost:3002',
      '/market': 'http://localhost:3003',
    },
  },
  preview: {
    port: 3000,
    host: true,
  },
})
