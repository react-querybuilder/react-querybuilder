/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  setupFilesAfterEnv: ['<rootDir>src/setupTests.ts'],
  coveragePathIgnorePatterns: ['sqlParser.js'],
  testEnvironment: 'jsdom'
};
