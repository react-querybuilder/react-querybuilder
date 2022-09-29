/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  projects: [
    'packages/antd',
    'packages/bootstrap',
    'packages/bulma',
    'packages/chakra',
    'packages/ctx',
    'packages/dnd',
    'packages/format-query',
    'packages/material',
    'packages/parse',
    'packages/react-querybuilder',
    'packages/ts',
    'packages/util',
  ],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
