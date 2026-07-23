import path from 'node:path';
import type { ViteUserConfig } from 'vitest/config';

const root = path.resolve(import.meta.dirname);

export default {
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: 'react',
    },
  },
  resolve: {
    alias: {
      'react-querybuilder': path.resolve(root, 'packages/react-querybuilder/src'),
      '@react-querybuilder/core/parseJsonLogic': path.resolve(
        root,
        'packages/core/src/utils/parseJsonLogic'
      ),
      '@react-querybuilder/core/parseSQL': path.resolve(root, 'packages/core/src/utils/parseSQL'),
      '@react-querybuilder/core': path.resolve(root, 'packages/core/src'),
      '@rqb-testing': path.resolve(root, 'utils/testing'),
      '@rqb-dbpool': path.resolve(root, 'utils/testing/pglite'),
      '@rqb-dbmongo': path.resolve(root, 'utils/testing/mongo'),
      '@rqb-dbquerytestutils': path.resolve(
        root,
        'packages/core/src/utils/formatQuery/dbqueryTestUtils'
      ),
    },
  },
  test: {
    globals: true,
    setupFiles: [path.resolve(root, 'vitestSetup.ts')],
    pool: 'threads',
    projects: [
      {
        test: {
          name: 'Isolated',
          isolate: true,
          include: ['packages/{antd,dnd}/src/**/*.test.ts{,x}'],
        },
      },
      {
        test: {
          name: 'Non-isolated',
          isolate: false,
          exclude: ['packages/{antd,dnd}/src/**/*.test.ts{,x}'],
        },
      },
    ],
  },
} satisfies ViteUserConfig;
