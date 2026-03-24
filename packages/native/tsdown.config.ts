import { defineConfig } from 'tsdown';
import { tsdownCommonConfig } from '../../utils/tsdown.common';

export default defineConfig(async options => {
  const buildConfig = await tsdownCommonConfig(import.meta.dirname)(options);

  return buildConfig.map(config =>
    Object.assign(config, {
      deps: {
        ...config.deps,
        neverBundle: ['react-native', ...(config.deps!.neverBundle as string[])],
      },
    })
  );
});
