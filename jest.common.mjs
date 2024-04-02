/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  coveragePathIgnorePatterns: ['/genericTests/', '/dist/', 'TestUtils.ts'],
  // This path is relative to the /packages/* folders
  setupFilesAfterEnv: ['../../jestSetup.ts'],
  testEnvironment: 'jsdom',
};
