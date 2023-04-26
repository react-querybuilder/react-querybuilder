import vitePluginReact from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { name } from './package.json';

const packageAbbr = name.replace('@react-querybuilder/', '');

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: format => `index.${format === 'es' ? 'm' : 'c'}js`,
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        'react-querybuilder',
        '@fluentui/react-components',
      ],
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
    }),
  ],
  server: {
    port: 3110,
  },
});
