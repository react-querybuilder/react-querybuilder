import common from '../../jest.common.mjs';

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  ...common,
  displayName: 'rqb',
  testPathIgnorePatterns: [
    ...(common.testPathIgnorePatterns ?? []),
    '/dbquery\\.',
    '/\\w+TestUtils\\.ts',
  ],
};
