import { mergeConfig, defineProject } from 'vitest/config';
import shared from '../../vitest.shared';

export default mergeConfig(
  shared,
  defineProject({
    test: {
      environment: 'node',
      coverage: {
        exclude: ['**/celParser.ts', '**/sqlParser.ts'],
      },
      exclude: [
        '**/formatQuery/__tests__/dbquery.*.test.ts',
        '**/generateID.nodeCrypto.test.ts',
        '**/generateID.node.test.ts',
      ],
    },
  })
);
