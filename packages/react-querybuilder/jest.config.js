/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  displayName: 'rqb',
  coveragePathIgnorePatterns: ['genericTests', '(cel|sql)Parser.js'],
  setupFilesAfterEnv: ['../../jestSetup.ts'],
  testEnvironment: 'jsdom',
  globals: { __RQB_DEV__: true },
};
