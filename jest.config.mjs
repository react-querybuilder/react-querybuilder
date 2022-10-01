/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  projects: ['packages/*'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
