/** @type {import('@jest/types').Config.CoverageThresholdValue} */
const fullCoverage = { branches: 100, functions: 100, lines: 100, statements: 100 };
/** @type {import('@jest/types').Config.CoverageThresholdValue} */
const zeroCoverage = { branches: 0, functions: 0, lines: 0, statements: 0 };

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  // We have to run the Drizzle tests separately for now because they have
  // to be run with the `--experimental-vm-modules` flag.
  ...(process.env.RQB_DRIZZLE_COVERAGE
    ? {
        coverageReporters: [],
        coverageThreshold: { 'packages/drizzle': fullCoverage, global: zeroCoverage },
      }
    : { coverageThreshold: { global: fullCoverage } }),
  projects: ['packages/*'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
