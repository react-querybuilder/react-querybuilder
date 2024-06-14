import vitePluginReact from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vitePluginReact()],
  resolve: {
    alias: {
      'react-querybuilder': path.resolve(import.meta.dir, '../react-querybuilder/src'),
      '@rqb-devapp': path.resolve(import.meta.dir, '../../utils/devapp'),
      '@rqb-utils': path.resolve(import.meta.dir, '../react-querybuilder/src/utils'),
    },
  },
  server: {
    port: 3102,
  },
});
