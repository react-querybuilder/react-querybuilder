import common from '../../jest.common.mjs';

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  ...common,
  displayName: 'datetime',
  testPathIgnorePatterns: [
    ...(common.testPathIgnorePatterns ?? []),
    'dbquery.cel',
    'dbquery.postgres',
    'dbquery.sqlite',
  ],
};
