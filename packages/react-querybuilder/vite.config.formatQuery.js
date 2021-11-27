import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/utils/formatQuery.ts'),
      fileName: () => 'formatQuery.js',
      formats: ['cjs']
    }
  }
});
