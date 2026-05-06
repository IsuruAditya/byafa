/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Separate vitest config — keeps vite.config.ts clean for production builds.
// Vitest picks this file up automatically when running `vitest`.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/features/**', 'src/store/**', 'src/components/**'],
      exclude: ['src/test/**', 'src/**/*.d.ts'],
      thresholds: {
        lines: 60,
        functions: 60,
      },
    },
  },
})
