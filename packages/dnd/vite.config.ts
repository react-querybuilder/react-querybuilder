import vitePluginReact from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import type { AliasOptions, PluginOption } from 'vite';
import { defineConfig } from 'vite';
import { name } from './package.json';

const packageAbbr = name.replace('@react-querybuilder/', '');

export default defineConfig(({ command, mode }) => {
  const aliasOptions: AliasOptions =
    command === 'build'
      ? {}
      : { 'react-querybuilder': path.resolve(__dirname, '../react-querybuilder') };

  return {
    build: {
      emptyOutDir: mode === 'production',
      minify: mode === 'production',
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        fileName: format =>
          `index${mode === 'production' ? '' : '.development'}.${format === 'es' ? 'm' : 'c'}js`,
        formats: ['cjs', 'es'],
        name: 'ReactQueryBuilderDnD',
      },
      rollupOptions: {
        external: [
          'immer',
          'react',
          'react/jsx-runtime',
          'react-dnd',
          'react-dnd-html5-backend',
          'react-querybuilder',
        ],
        output: {
          globals: {
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
      target: 'es2020',
    },
    plugins: [
      vitePluginReact(),
      visualizer({
        filename: 'build-stats.html',
        gzipSize: true,
        brotliSize: true,
        title: `Build stats (${packageAbbr})`,
      }) as PluginOption,
    ],
    server: {
      port: 3106,
    },
    resolve: {
      alias: aliasOptions,
    },
  };
});
