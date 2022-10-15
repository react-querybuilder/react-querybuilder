import vitePluginReact from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: format => `index.${format}.js`,
      formats: ['es', 'cjs'],
    },
    sourcemap: true,
  },
  plugins: [vitePluginReact()],
  server: {
    port: 3108,
  },
});
