/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  coveragePathIgnorePatterns: ['genericTests', 'sqlParser.js'],
  moduleNameMapper: {
    '^ruleGroupsIC$': '<rootDir>/src/types/ruleGroupsIC.ts',
  },
  setupFilesAfterEnv: ['../../jestSetup.ts'],
  testEnvironment: 'jsdom',
};
