import { defineConfig } from 'vitest/config';

export default defineConfig(async () => {
  const { reactNative } = await import('vitest-native');
  return {
    plugins: [reactNative()],
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
  };
});
