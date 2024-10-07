import common from '../../jest.common.mjs';

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  ...common,
  displayName: 'dnd',
  coveragePathIgnorePatterns: [...common.coveragePathIgnorePatterns, 'dropEffectListener'],
  transformIgnorePatterns: ['/node[_]modules/(?!react-dnd|dnd-core|@react-dnd)'],
  setupFilesAfterEnv: [...common.setupFilesAfterEnv, './jestSetup.ts'],
};
