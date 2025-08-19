import { defineConfig } from 'tsdown';
import { tsdownCommonConfig } from '../../utils/tsdown.common';

export default defineConfig(async options => {
  const buildConfig = await tsdownCommonConfig(import.meta.dir)(options);

  return buildConfig.map(config => ({
    ...config,
    external: ['react-native'],
  }));
});
