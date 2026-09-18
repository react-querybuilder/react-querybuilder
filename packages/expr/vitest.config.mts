import type { UserConfig } from 'vite';
import { mergeConfig } from 'vitest/config';
import shared from '../../utils/testing/vitest.shared.mjs';

const config: UserConfig = mergeConfig(shared, {
  test: {
    environment: 'node',
    environmentMatchGlobs: [['**/*.test.tsx', 'jsdom']],
  },
});

export default config;
