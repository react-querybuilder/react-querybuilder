import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    __RQB_DEV__: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      '100': true,
      clean: true,
      exclude: [
        ...(configDefaults.coverage.exclude ?? []),
        'genericTests',
        'celParser.js',
        'sqlParser.js',
      ],
    },
    css: false,
  },
});
