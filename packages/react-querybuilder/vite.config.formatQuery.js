import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/utils/formatQuery/index.ts'),
      fileName: () => 'formatQuery.js',
      formats: ['cjs'],
    },
  },
  plugins: [tsconfigPaths()],
});
