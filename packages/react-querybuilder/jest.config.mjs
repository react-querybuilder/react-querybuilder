/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  coveragePathIgnorePatterns: ['genericTests', '(cel|sql)Parser.js'],
  moduleNameMapper: {
    '^ruleGroupsIC$': '<rootDir>/src/types/ruleGroupsIC',
  },
  setupFilesAfterEnv: ['../../jestSetup.ts'],
  testEnvironment: 'jsdom',
  globals: { __RQB_DEV__: true },
};
