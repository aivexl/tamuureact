import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'apps/web/src/**/*.{test,spec}.{ts,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'tests/chat/**'
    ],
    setupFiles: ['./apps/web/src/test/setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
    },
  },
});
