import common from '../../jest.common.mjs';

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  ...common,
  displayName: 're',
  testPathIgnorePatterns: [...(common.testPathIgnorePatterns ?? []), 'dbquery'],
};
