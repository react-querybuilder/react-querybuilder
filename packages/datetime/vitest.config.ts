import { mergeConfig, defineProject } from 'vitest/config';
import shared from '../../vitest.shared';

export default mergeConfig(
  shared,
  defineProject({
    test: {
      environment: 'node',
      environmentMatchGlobs: [['**/*.test.tsx', 'jsdom']],
      exclude: ['**/__tests__/dbquery.*.test.ts'],
    },
  })
);
