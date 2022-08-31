import vitePluginReact from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ mode: _mode, command }) => {
  const define = {
    __RQB_DEV__: command === 'build' ? 'false' : 'true',
  };

  return {
    define,
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        fileName: 'index',
        formats: ['es'],
      },
      rollupOptions: {
        external: ['react', 'react-querybuilder', 'react-bulma-components'],
      },
      sourcemap: true,
    },
    plugins: [vitePluginReact()],
    server: {
      port: 3103,
    },
  };
});
