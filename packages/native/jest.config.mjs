// @ts-check
import common from '../../jest.common.mjs';

const { coveragePathIgnorePatterns, globals, moduleNameMapper } = common;

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  preset: 'react-native',
  coveragePathIgnorePatterns,
  displayName: 'native',
  globals,
  setupFilesAfterEnv: ['./jestSetup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|react-redux|@react-native(-community|-picker)?)/)',
  ],
  moduleNameMapper,
};
