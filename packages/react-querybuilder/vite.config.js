// vite.config.js
const path = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'ReactQueryBuilder',
      fileName: (format) => `react-querybuilder.${format}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'react-dnd', 'react-dnd-html5-backend', 'immer'],
      output: {
        exports: 'named'
      }
    }
  }
});
