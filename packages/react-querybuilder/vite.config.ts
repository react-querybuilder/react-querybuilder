import vitePluginReact from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vitePluginReact()],
  server: {
    port: 3100,
  },
});
