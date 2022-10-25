import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: false,
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/utils/parseMongoDB/index.ts'),
      fileName: () => 'parseMongoDB.js',
      formats: ['cjs'],
    },
  },
});
