import vitePluginReact from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
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
      name: 'ReactQueryBuilderDnD',
    },
    rollupOptions: {
      external: [
        '@react-querybuilder/ctx',
        'immer',
        'react',
        'react-dnd',
        'react-dnd-html5-backend',
        'react-querybuilder',
      ],
      output: {
        globals: {
          '@react-querybuilder/ctx': 'ReactQueryBuilderContext',
          immer: 'immer',
          react: 'React',
          'react-dnd': 'ReactDnD',
          'react-dnd-html5-backend': 'ReactDnDHTML5Backend',
          'react-querybuilder': 'ReactQueryBuilder',
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
    port: 3106,
  },
}));
