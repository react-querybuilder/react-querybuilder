/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  coveragePathIgnorePatterns: ['genericTests', '(cel|sql)Parser.js'],
  displayName: 'rqb',
  globals: { __RQB_DEV__: true },
  setupFilesAfterEnv: ['../../jestSetup.ts'],
  testEnvironment: 'jsdom',
};
