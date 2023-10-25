/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  coveragePathIgnorePatterns: [
    'genericTests',
    'dist',
    '(cel|sql)Parser.js',
    'redux/Subscription.ts',
  ],
  globals: { __RQB_DEV__: true },
  // This path is relative to the /packages/* folders
  setupFilesAfterEnv: ['../../jestSetup.ts'],
  testEnvironment: 'jsdom',
};
