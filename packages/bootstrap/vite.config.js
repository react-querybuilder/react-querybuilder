import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: format => `index.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-querybuilder'],
    },
    sourcemap: true,
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
});
