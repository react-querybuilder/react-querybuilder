import vitePluginReact from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { name } from './package.json';

export default defineConfig(({ command }) => ({
  define: {
    __RQB_DEV__: command === 'build' ? 'process?.env?.NODE_ENV !== "production"' : 'true',
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: format => `index.${format === 'es' ? 'm' : format === 'cjs' ? 'c' : 'umd.'}js`,
      formats: ['umd', 'cjs', 'es'],
      name: 'ReactQueryBuilder',
    },
    rollupOptions: {
      external: ['@react-querybuilder/ctx', 'immer', 'react', 'react/jsx-runtime'],
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
  plugins: [
    vitePluginReact(),
    visualizer(_opts => ({
      // filename: `build-stats.${_opts.format}.html`,
      filename: `build-stats.html`,
      gzipSize: true,
      title: `Build stats (${name})`,
    })),
  ],
  server: {
    port: 3100,
  },
}));
