import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['**/sqlite.test.ts'],
    setupFiles: ['../../vitestSetup.mts'],
  },
});
