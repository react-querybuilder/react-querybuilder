import path from 'node:path';
import type { UserConfig } from 'vite';
import type { ViteUserConfig } from 'vitest/config';

const root = path.resolve(`${import.meta.dirname}/../../`);
const coreUtils = path.resolve(root, 'packages/core/src/utils');

const config: UserConfig = {
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: 'react',
    },
  },
  resolve: {
    alias: {
      'react-querybuilder': path.join(root, 'packages/react-querybuilder/src'),
      '@react-querybuilder/core/parseCEL': path.join(coreUtils, 'parseCEL'),
      '@react-querybuilder/core/parseJSONata': path.join(coreUtils, 'parseJSONata'),
      '@react-querybuilder/core/parseJsonLogic': path.join(coreUtils, 'parseJsonLogic'),
      '@react-querybuilder/core/parseMongoDB': path.join(coreUtils, 'parseMongoDB'),
      '@react-querybuilder/core/parseSpEL': path.join(coreUtils, 'parseSpEL'),
      '@react-querybuilder/core/parseSQL': path.join(coreUtils, 'parseSQL'),
      '@react-querybuilder/core': path.join(root, 'packages/core/src'),
      '@rqb-testing': import.meta.dirname,
      '@rqb-dbpool': path.join(import.meta.dirname, 'pglite'),
      '@rqb-dbmongo': path.join(import.meta.dirname, 'mongo'),
      '@rqb-dbquerytestutils': path.join(coreUtils, 'formatQuery/dbqueryTestUtils'),
    },
  },
  test: {
    globals: true,
    setupFiles: [path.join(import.meta.dirname, 'vitestSetup.mts')],
    pool: 'threads',
    exclude: ['**/dbquery.*.test.ts'],
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

export default config;
