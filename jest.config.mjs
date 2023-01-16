/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  projects: [
    'packages/antd',
    'packages/bootstrap',
    'packages/bulma',
    'packages/chakra',
    'packages/dnd',
    'packages/material',
    'packages/react-querybuilder',
  ],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
