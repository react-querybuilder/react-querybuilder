import vitePluginReact from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vitePluginReact()],
  resolve: {
    alias: {
      'react-querybuilder': path.resolve(import.meta.dir, '.'),
      '@dev': path.resolve(import.meta.dir, '../../utils/dev'),
    },
  },
  server: {
    port: 3100,
  },
});
