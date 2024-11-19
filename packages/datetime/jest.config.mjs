import common from '../../jest.common.mjs';

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  ...common,
  displayName: 'datetime',
  testPathIgnorePatterns: [
    ...(common.testPathIgnorePatterns ?? []),
    'dbquery.postgres',
    'dbquery.sqlite',
  ],
};
