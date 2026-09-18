import type { UserConfig } from 'vite';
import { mergeConfig } from 'vitest/config';
import shared from '../../utils/testing/vitest.shared.mjs';

const config: UserConfig = mergeConfig(shared, {
  test: {
    environment: 'jsdom',
    // Inline antd/@ant-design/rc-* so Vite (not Node) resolves their imports.
    // Patterns are tested against resolved absolute paths, so they must not be `^`-anchored.
    server: {
      deps: {
        inline: [/antd\//, /@ant-design\//, /\/rc-/],
      },
    },
  },
});

export default config;
