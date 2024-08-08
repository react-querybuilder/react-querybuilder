import common from '../../jest.common.mjs';

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  ...common,
  displayName: 'rqb',
  coveragePathIgnorePatterns: [
    ...(common.coveragePathIgnorePatterns ?? []),
    'celParser.js',
    'sqlParser.js',
    'clsx.ts',
  ],
  testPathIgnorePatterns: [...(common.testPathIgnorePatterns ?? []), 'dbquery'],
};
