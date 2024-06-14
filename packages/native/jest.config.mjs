import testingLibraryReactNativeJestPreset from '@testing-library/react-native/jest-preset/index.js';
import common from '../../jest.common.mjs';

const { coveragePathIgnorePatterns, globals, moduleNameMapper } = common;

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  preset: '@testing-library/react-native',
  coveragePathIgnorePatterns,
  displayName: 'native',
  globals,
  setupFilesAfterEnv: [...(testingLibraryReactNativeJestPreset.setupFiles ?? []), './jestSetup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|react-redux|@react-native(-community|-picker)?)/)',
  ],
  moduleNameMapper,
};
