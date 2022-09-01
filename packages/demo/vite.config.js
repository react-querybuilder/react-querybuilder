import legacy from '@vitejs/plugin-legacy';
import vitePluginReact from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ mode: _mode, command }) => {
  const define = {
    __RQB_DEV__: command === 'build' ? 'false' : 'true',
  };

  return {
    base: '/react-querybuilder/',
    define,
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          ie11: resolve(__dirname, 'ie11.html'),
          umd: resolve(__dirname, 'umd.html'),
        },
        external: ['ruleGroupsIC'],
      },
      sourcemap: false,
    },
    css: { preprocessorOptions: { css: { charset: false }, scss: { charset: false } } },
    plugins: [
      vitePluginReact(),
      legacy({
        targets: ['ie >= 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      }),
    ],
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
  };
});
