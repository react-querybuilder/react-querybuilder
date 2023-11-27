import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    coverage: { all: true, enabled: true, provider: 'istanbul', reporter: ['html'] },
    environment: 'jsdom',
    exclude: ['**/sqlite.test.ts'],
    setupFiles: ['../../vitestSetup.mts'],
  },
});
