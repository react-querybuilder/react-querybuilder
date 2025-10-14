import common from '../../jest.common.mjs';

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  ...common,
  displayName: 'drizzle',
  setupFilesAfterEnv: [
    ...(process.env.RQB_DRIZZLE_COVERAGE ? [] : (common.setupFilesAfterEnv ?? [])),
  ],
  testPathIgnorePatterns: [
    ...(common.testPathIgnorePatterns ?? []),
    // Ignore everything if we're not specifically testing for coverage because for
    // Jest, Drizzle tests have to be run with the `--experimental-vm-modules` flag.
    process.env.RQB_DRIZZLE_COVERAGE ? 'drizzle.sqlite' : 'drizzle',
  ],
};
