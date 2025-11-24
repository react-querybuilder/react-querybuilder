import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    exclude: [
      '**/dbquery.*',
      'src/utils/generateID.nodeCrypto.test.ts', // Node crypto test has environment issues
    ],
    coverage: {
      provider: 'v8',
      exclude: [
        '**/*dbquery*',
        '**/*TestUtils.ts',
        'dist/**',
        'src/utils/generateID.nodeCrypto.test.ts',
        'src/utils/parseCEL/celParser.ts',
        'src/utils/parseSQL/sqlParser.ts',
      ],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  },
});
