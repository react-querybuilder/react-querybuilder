import common from '../../jest.common.mjs';

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  ...common,
  displayName: 'core',
  coveragePathIgnorePatterns: [
    ...common.coveragePathIgnorePatterns,
    'celParser.ts',
    'sqlParser.ts',
  ],
  testPathIgnorePatterns: [...(common.testPathIgnorePatterns ?? []), 'dbquery'],
};
