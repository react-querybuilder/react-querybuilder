import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    minify: false,
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/utils/parseJsonLogic/index.ts'),
      fileName: () => 'parseJsonLogic.js',
      formats: ['cjs'],
    },
  },
  plugins: [tsconfigPaths()],
});
