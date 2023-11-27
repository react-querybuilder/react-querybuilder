import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: { enabled: true, provider: 'istanbul', reporter: 'html' },
    environment: 'jsdom',
    exclude: ['**/sqlite.test.ts'],
    setupFiles: ['../../vitestSetup.mts'],
  },
});
