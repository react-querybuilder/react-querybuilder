import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { getCommonViteConfig } from '../../utils/vite.common';

const config: UserConfig = defineConfig({
  ...getCommonViteConfig({ port: 3111, scopedDonut: false }),
  plugins: [tailwindcss()],
});

export default config;
