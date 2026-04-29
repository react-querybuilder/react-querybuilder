import type { UserConfigExport } from 'tsdown';
import { defineConfig } from 'tsdown';
import { tsdownCommonConfig } from '../../utils/tsdown.common';

export default defineConfig(async options => {
  const buildConfig = await tsdownCommonConfig(import.meta.dirname)(options);

  return [...buildConfig];
}) as UserConfigExport;
