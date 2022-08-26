/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  coveragePathIgnorePatterns: ['genericTests', 'dist', '(cel|sql)Parser.js'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['../../jestSetup.ts'],
  transformIgnorePatterns: ['/node_modules/(?!react-dnd|dnd-core|@react-dnd)'],
  globals: { __RQB_DEV__: true },
};
