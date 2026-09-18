import type { UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { getCommonViteConfig } from '../../utils/vite.common';

const config: UserConfig = defineConfig(getCommonViteConfig({ port: 3112 }));

export default config;
