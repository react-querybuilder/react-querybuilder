/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  coveragePathIgnorePatterns: ['genericTests'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['../../jestSetup.ts'],
};
