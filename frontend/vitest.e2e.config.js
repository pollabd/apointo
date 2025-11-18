import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:5000/api'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.e2e.js',
    include: ['src/__tests__/e2e.integration.test.jsx'],
    exclude: ['node_modules'], 
    css: true,
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 20000,
  },
})
