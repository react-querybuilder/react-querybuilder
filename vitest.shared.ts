import path from 'node:path';
import { defineConfig } from 'vitest/config';

const root = path.resolve(import.meta.dirname);

export default defineConfig({
  resolve: {
    alias: {
      'react-querybuilder': path.resolve(root, 'packages/react-querybuilder/src'),
      '@react-querybuilder/core': path.resolve(root, 'packages/core/src'),
      '@rqb-testing': path.resolve(root, 'utils/testing'),
      '@rqb-dbquerytestutils': path.resolve(
        root,
        'packages/core/src/utils/formatQuery/dbqueryTestUtils'
      ),
    },
  },
  test: {
    globals: true,
    setupFiles: [path.resolve(root, 'vitestSetup.ts')],
    coverage: {
      provider: 'v8',
      exclude: [
        '**/utils/testing/**',
        '**/dist/**',
        '**/TestUtils.ts',
        '**/packages/rules-engine/src/components/**',
      ],
      thresholds: { branches: 100, functions: 100, lines: 100, statements: 100 },
    },
  },
});
