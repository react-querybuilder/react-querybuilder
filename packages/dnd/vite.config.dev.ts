import vitePluginReact from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    __RQB_DEV__: 'true',
    'process.env': {},
  },
  plugins: [vitePluginReact()],
  server: {
    port: 3106,
  },
  resolve: {
    alias: {
      'react-querybuilder': resolve(__dirname, '../react-querybuilder'),
    },
  },
});
