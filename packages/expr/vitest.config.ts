import { mergeConfig } from 'vitest/config';
import shared from '../../vitest.shared';

export default mergeConfig(shared, {
  test: {
    environment: 'node',
    environmentMatchGlobs: [['**/*.test.tsx', 'jsdom']],
    // `dbquery.*` integration tests run under `bun test` (they use `bun:sqlite` etc.)
    exclude: ['**/__tests__/dbquery.*.test.ts'],
  },
});
