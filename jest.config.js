/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  projects: [
    'packages/antd',
    'packages/bootstrap',
    'packages/bulma',
    'packages/chakra',
    'packages/ctx',
    'packages/dnd',
    'packages/material',
    'packages/react-querybuilder',
    'packages/ts',
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
