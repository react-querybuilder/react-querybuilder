import { defaults } from 'jest-config';

// These options are imported into the Jest config of each package, so
// `<rootDir>` refers to the respective /packages/* folder, e.g.
// /packages/antd, /packages/material, etc., not the root of the repo.

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  // TODO: remove rules-engine exclusion
  testMatch: [...defaults.testMatch, '!**/packages/rules-engine/**'],
  coveragePathIgnorePatterns: [
    '/utils/testing/',
    '/dist/',
    'TestUtils.ts',
    // TODO: remove rules-engine exclusion
    '/packages/rules-engine',
  ],
  setupFilesAfterEnv: ['<rootDir>/../../jestSetup.ts'],
  testEnvironment: '<rootDir>/../../utils/fixJSDOMEnvironment.ts',
  testEnvironmentOptions: { globalsCleanup: 'on' },
  // Keep these in sync with /tsconfig.json#compilerOptions#paths.
  moduleNameMapper: {
    '^react-querybuilder$': '<rootDir>/../../packages/react-querybuilder/src',
    '^@react-querybuilder/core$': '<rootDir>/../../packages/core/src',
    '^@rqb-testing$': '<rootDir>/../../utils/testing',
    '^@rqb-dbquerytestutils$':
      '<rootDir>/../../packages/core/src/utils/formatQuery/dbqueryTestUtils',
  },
};
