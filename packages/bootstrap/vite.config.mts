import type { UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { getCommonViteConfig } from '../../utils/vite.common';

const config: UserConfig = defineConfig(getCommonViteConfig({ port: 3102 }));

export default config;
