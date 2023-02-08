import common from '../../jest.common.mjs';

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  ...common,
  displayName: 'dnd',
  transformIgnorePatterns: ['/node[_]modules/(?!react-dnd|dnd-core|@react-dnd)'],
};
