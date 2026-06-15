import { defineConfig } from 'vitest/config';

export default defineConfig(
  import('vitest-native').then(({ reactNative }) => ({
    plugins: [reactNative({ engine: 'mock' })],
    oxc: {
      jsx: {
        runtime: 'automatic',
        importSource: 'react',
      } as const,
    },
    test: {
      globals: true,
      testTimeout: 30_000,
      alias: {
        'react-querybuilder': '../../packages/react-querybuilder/src',
        '@react-querybuilder/core': '../../packages/core/src',
        '@rqb-testing': '../../utils/testing',
        '@rqb-dbquerytestutils': '../../packages/core/src/utils/formatQuery/dbqueryTestUtils',
      },
    },
  }))
);
