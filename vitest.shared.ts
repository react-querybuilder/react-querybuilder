import path from 'node:path';
import type { ViteUserConfig } from 'vitest/config';

const root = path.resolve(import.meta.dirname);

export default {
  resolve: {
    alias: {
      'react-querybuilder': path.resolve(root, 'packages/react-querybuilder/src'),
      '@react-querybuilder/core': path.resolve(root, 'packages/core/src'),
      '@rqb-testing': path.resolve(root, 'utils/testing'),
      '@rqb-dbquerytestutils': path.resolve(
        root,
        'packages/core/src/utils/formatQuery/dbqueryTestUtils'
      ),
    },
  },
  test: {
    globals: true,
    setupFiles: [path.resolve(root, 'vitestSetup.ts')],
  },
} satisfies ViteUserConfig;
