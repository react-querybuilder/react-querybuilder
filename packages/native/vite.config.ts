import vitePluginReact from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
  plugins: [vitePluginReact()],
  server: {
    port: 3108,
  },
});
