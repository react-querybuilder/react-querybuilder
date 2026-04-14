import { mergeConfig } from 'vitest/config';
import shared from '../../vitest.shared';

export default mergeConfig(shared, {
  test: {
    environment: 'node',
    exclude: [
      '**/formatQuery/__tests__/dbquery.*.test.ts',
      '**/generateID.nodeCrypto.test.ts',
      '**/generateID.node.test.ts',
    ],
  },
});
