import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  mode: 'development',
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: format => `index.${format}.dev.js`,
      formats: ['es', 'cjs', 'umd'],
      name: 'ReactQueryBuilder',
    },
    rollupOptions: {
      external: ['immer', 'react', 'react-dnd', 'react-dnd-html5-backend'],
      output: {
        globals: {
          immer: 'immer',
          react: 'React',
          'react-dnd': 'ReactDnD',
          'react-dnd-html5-backend': 'ReactDnDHTML5Backend',
        },
        exports: 'named',
      },
    },
    sourcemap: true,
  },
  plugins: [tsconfigPaths()],
});
