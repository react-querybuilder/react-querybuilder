import common from '../../jest.common.mjs';

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  ...common,
  coveragePathIgnorePatterns: [...common.coveragePathIgnorePatterns, 'src/snippets'],
  displayName: 'chakra',
};
