/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  coveragePathIgnorePatterns: ['genericTests', '(cel|sql)Parser.js'],
  moduleNameMapper: {
    '^ruleGroupsIC$': '<rootDir>/src/types/ruleGroupsIC.ts',
  },
  setupFilesAfterEnv: ['../../jestSetup.ts'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['/node_modules/(?!react-dnd|dnd-core|@react-dnd)'],
  globals: { __RQB_DEV__: true },
};
