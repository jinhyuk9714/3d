import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/3d/',
  build: {
    chunkSizeWarningLimit: 1_000,
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    exclude: ['tests/**', 'node_modules/**', 'dist/**'],
    setupFiles: './src/test/setup.ts',
  },
})
