import { mergeConfig } from 'vitest/config';
import shared from '../../vitest.shared';

export default mergeConfig(shared, {
  test: {
    environment: 'jsdom',
    deps: {
      optimizer: {
        web: {
          include: [/^@mui\//, /^@emotion\//],
        },
      },
    },
  },
});
