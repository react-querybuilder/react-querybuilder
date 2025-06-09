import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { getCommonViteConfig } from '../../utils/vite.common';

export default defineConfig({
  ...getCommonViteConfig({ port: 3111, scopedDonut: false }),
  plugins: [tailwindcss()],
});
