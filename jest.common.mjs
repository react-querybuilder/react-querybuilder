// These options are imported into the Jest config of each package, so
// `<rootDir>` refers to the respective /packages/* folder, e.g.
// /packages/antd, /packages/material, etc., not the root of the repo.

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  coveragePathIgnorePatterns: [
    '/utils/testing/',
    '/dist/',
    'TestUtils.ts',
    // TODO: remove rules-engine coverage exclusion
    '/packages/rules-engine/src/components',
  ],
  // Fix for "The current testing environment is not configured to support act(...)"
  // warnings from Ant Design's rc-components (trigger, motion). These components
  // schedule microtasks that fire state updates after @testing-library/react's
  // act() wrapper restores IS_REACT_ACT_ENVIRONMENT to its previous value.
  //
  // React checks `typeof IS_REACT_ACT_ENVIRONMENT` as a bare variable, but Jest
  // runs modules in a sandboxed VM context where Node's globalThis isn't visible.
  // `sandboxInjectedGlobals` injects the variable into Jest's module sandbox.
  //
  // See: https://github.com/testing-library/react-testing-library/issues/1061
  globals: { IS_REACT_ACT_ENVIRONMENT: true },
  sandboxInjectedGlobals: ['IS_REACT_ACT_ENVIRONMENT'],
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
