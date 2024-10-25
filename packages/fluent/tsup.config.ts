import { defineConfig } from 'tsup';
import { tsupCommonConfig } from '../../utils/tsup.common';

export default defineConfig(tsupCommonConfig(import.meta.dir));
