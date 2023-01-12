import vitePluginReact from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  define: {
    __RQB_DEV__: command === 'build' ? 'process.env.NODE_ENV !== "production"' : 'true',
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: format => `index.${format}.js`,
      formats: ['umd', 'cjs', 'es'],
      name: 'ReactQueryBuilder',
    },
    rollupOptions: {
      external: ['@react-querybuilder/ctx', 'clsx', 'immer', 'react'],
      output: {
        globals: {
          '@react-querybuilder/ctx': 'ReactQueryBuilderContext',
          clsx: 'clsx',
          immer: 'immer',
          react: 'React',
        },
        exports: 'named',
      },
    },
    sourcemap: true,
  },
  plugins: [
    vitePluginReact(),
    visualizer({ filename: 'build-stats.html', gzipSize: true, title: 'Build stats' }),
  ],
  server: {
    port: 3100,
  },
}));
