import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/hooks/**/*.ts',
        'src/services/**/*.ts',
        'src/components/Weather*.tsx',
        'src/components/SourceAttribution.tsx',
        'src/views/**/*.tsx',
      ],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
