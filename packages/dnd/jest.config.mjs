/** @type {import('@jest/types').Config} */
export default {
  coveragePathIgnorePatterns: ['genericTests', 'dist', '(cel|sql)Parser.js'],
  displayName: 'dnd',
  globals: { __RQB_DEV__: true },
  setupFilesAfterEnv: ['../../jestSetup.ts'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['/node[_]modules/(?!react-dnd|dnd-core|@react-dnd)'],
};
