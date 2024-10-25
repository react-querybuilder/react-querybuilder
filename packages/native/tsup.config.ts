import { defineConfig } from 'tsup';
import { tsupCommonConfig } from '../../utils/tsup.common';

export default defineConfig(async options => {
  const buildConfig = await tsupCommonConfig(import.meta.dir)(options);

  return buildConfig.map(config => ({
    ...config,
    external: ['react-native'],
  }));
});
