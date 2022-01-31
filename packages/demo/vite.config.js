import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/react-querybuilder/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ie11: resolve(__dirname, 'ie11.html'),
        umd: resolve(__dirname, 'umd.html'),
      },
    },
  },
  css: { preprocessorOptions: { css: { charset: false }, scss: { charset: false } } },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  plugins: [
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
  ],
});
