import vitePluginReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vitePluginReact()],
  server: { port: 3000 },
});
