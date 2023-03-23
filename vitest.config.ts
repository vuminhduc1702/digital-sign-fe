/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    include: ['./src/**/*.test.{ts,tsx}'],
    globals: true,
    environment: 'jsdom',
    // setupFiles: ['./test/setup-test-env.ts'],
    // globalSetup: ['./test/global-setup.ts'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      all: true,
    },
  },
})
