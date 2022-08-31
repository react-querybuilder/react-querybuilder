import vitePluginReact from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ mode: _mode, command }) => {
  const define = {
    __RQB_DEV__: command === 'build' ? 'process.env.NODE_ENV !== "production"' : 'true',
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
        external: ['immer', 'react', 'react/jsx-runtime'],
      },
      sourcemap: true,
    },
    plugins: [tsconfigPaths(), vitePluginReact()],
    // optimizeDeps: {
    //   include: ['react/jsx-runtime'],
    // },
    server: {
      port: 3100,
    },
  };
});
