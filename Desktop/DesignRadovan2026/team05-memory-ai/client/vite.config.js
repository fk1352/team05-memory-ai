import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Send /api calls to the Express server (PORT=5000 in .env.example)
  server: { proxy: { '/api': 'http://localhost:5000' } },
})
