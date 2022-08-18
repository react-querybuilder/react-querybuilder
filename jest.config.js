/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  projects: [
    'packages/react-querybuilder',
    'packages/dnd',
    'packages/antd',
    'packages/bootstrap',
    'packages/bulma',
    'packages/chakra',
    'packages/material',
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  transformIgnorePatterns: ['/node_modules/(?!react-dnd|dnd-core|@react-dnd)'],
};
