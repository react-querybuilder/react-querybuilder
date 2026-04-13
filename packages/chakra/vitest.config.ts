import { mergeConfig, defineProject } from 'vitest/config';
import shared from '../../vitest.shared';

export default mergeConfig(
  shared,
  defineProject({
    test: {
      environment: 'jsdom',
      coverage: {
        exclude: ['**/src/snippets/**'],
      },
    },
  })
);
