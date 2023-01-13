/** @type {import('@jest/types').Config} */
export default {
  coveragePathIgnorePatterns: ['genericTests', 'dist', '(cel|sql)Parser.js'],
  displayName: 'material',
  globals: { __RQB_DEV__: true },
  setupFilesAfterEnv: ['../../jestSetup.ts'],
  testEnvironment: 'jsdom',
};
