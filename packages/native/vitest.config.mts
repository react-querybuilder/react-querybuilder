import react from '@vitejs/plugin-react-swc';
import reactNative from 'vitest-react-native';
import { mergeConfig } from 'vitest/config';
import commonConfig from '../../vitestCommon.mjs';

export default mergeConfig(commonConfig, {
  plugins: [reactNative(), react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['../../vitestSetup.mts'],
  },
});
