import { defineConfig } from 'tsdown';
import { tsdownCommonConfig } from '../../utils/tsdown.common';

export default defineConfig(tsdownCommonConfig(import.meta.dir));
