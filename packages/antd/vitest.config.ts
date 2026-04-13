import { mergeConfig, defineProject } from 'vitest/config';
import shared from '../../vitest.shared';

export default mergeConfig(
  shared,
  defineProject({
    test: {
      environment: 'jsdom',
      deps: {
        optimizer: {
          web: {
            include: ['antd', /^@ant-design/, /^rc-/],
          },
        },
      },
      coverage: {
        exclude: ['**/dayjs/**'],
      },
    },
  })
);
