import vitePluginReact from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ command }) => ({
  define: {
    __RQB_DEV__: command === 'build' ? 'process.env.NODE_ENV !== "production"' : 'true',
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: format => `index.${format}.js`,
      formats: ['es', 'cjs', 'umd'],
      name: 'ReactQueryBuilder',
    },
    rollupOptions: {
      external: ['@react-querybuilder/ctx', 'immer', 'react'],
      output: {
        globals: {
          '@react-querybuilder/ctx': 'ReactQueryBuilderContext',
          immer: 'immer',
          react: 'React',
        },
        exports: 'named',
      },
    },
    sourcemap: true,
  },
  plugins: [tsconfigPaths(), vitePluginReact()],
  server: {
    port: 3100,
  },
}));
