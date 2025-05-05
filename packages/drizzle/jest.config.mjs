import common from '../../jest.common.mjs';

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  ...common,
  displayName: 'drizzle',
  testPathIgnorePatterns: [
    ...(common.testPathIgnorePatterns ?? []),
    // Ignore everything if we're not specifically testing drizzle for coverage.
    process.env.RQB_DRIZZLE_COVERAGE ? 'drizzle.sqlite' : 'drizzle',
  ],
};
