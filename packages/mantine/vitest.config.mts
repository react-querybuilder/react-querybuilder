import { mergeConfig } from 'vitest/config';
import shared from '../../vitest.shared.mts';

export default mergeConfig(shared, {
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitestSetup.ts'],
  },
});
