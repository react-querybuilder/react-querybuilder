import vitePluginReact from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-querybuilder': path.resolve(import.meta.dir, '../react-querybuilder/src'),
      '@rqb-utils': path.resolve(import.meta.dir, '../react-querybuilder/src/utils'),
    },
  },
  plugins: [vitePluginReact()],
  server: {
    port: 3108,
  },
});
