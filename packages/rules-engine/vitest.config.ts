import { mergeConfig, defineProject } from 'vitest/config';
import shared from '../../vitest.shared';

export default mergeConfig(
  shared,
  defineProject({
    test: {
      environment: 'node',
      exclude: ['**/formatRulesEngine/dbquery.*.test.ts'],
    },
  })
);
