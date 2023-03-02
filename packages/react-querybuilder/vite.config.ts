import vitePluginReact from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { name } from './package.json';

export default defineConfig(({ command, mode }) => ({
  define: {
    __RQB_DEV__: command === 'build' && mode === 'production' ? 'false' : 'true',
  },
  build: {
    emptyOutDir: mode === 'production',
    minify: mode === 'production',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: format =>
        `index${mode === 'production' ? '' : '.development'}.${format === 'es' ? 'm' : 'c'}js`,
      formats: ['cjs', 'es'],
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
    target: 'es2020',
  },
  plugins: [
    vitePluginReact(),
    visualizer(_opts => ({
      // filename: `build-stats.${_opts.format}.html`,
      filename: `build-stats.html`,
      gzipSize: true,
      brotliSize: true,
      title: `Build stats (${name})`,
    })),
  ],
  server: {
    port: 3100,
  },
}));
