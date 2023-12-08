import common from '../../jest.common.mjs';

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  ...common,
  // TODO: remove this when we achieve 100% coverage
  coveragePathIgnorePatterns: [...common.coveragePathIgnorePatterns, 'TremorValueEditor'],
  displayName: 'tremor',
};
