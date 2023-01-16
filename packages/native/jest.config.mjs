import testingLibraryReactNativeJestPreset from '@testing-library/react-native/jest-preset/index.js';

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  preset: '@testing-library/react-native',
  coveragePathIgnorePatterns: [],
  displayName: 'native',
  globals: { __RQB_DEV__: true },
  setupFilesAfterEnv: testingLibraryReactNativeJestPreset.setupFiles,
};
