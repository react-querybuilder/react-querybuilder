import vitePluginReact from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  define: {
    __RQB_DEV__: command === 'build' ? 'false' : 'true',
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: format => `index.${format}.js`,
      formats: ['es', 'cjs', 'umd'],
      name: 'ReactQueryBuilderContext',
    },
    rollupOptions: {
      external: ['immer', 'react', 'react-querybuilder'],
      output: {
        globals: {
          immer: 'immer',
          react: 'React',
          'react-querybuilder': 'ReactQueryBuilder',
        },
        exports: 'named',
      },
    },
    sourcemap: true,
  },
  plugins: [vitePluginReact()],
  server: {
    port: 3107,
  },
}));
