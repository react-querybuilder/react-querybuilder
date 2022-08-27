import vitePluginReact from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ mode, command }) => {
  const define = {
    __RQB_DEV__: command === 'build' ? 'false' : 'true',
  };

  return {
    define,
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.tsx'),
        fileName: format => `index.${format}.js`,
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: [
          'react',
          'react-querybuilder',
          '@emotion/react',
          '@emotion/styled',
          '@mui/icons-material',
          '@mui/material',
        ],
      },
      sourcemap: true,
    },
    plugins: [vitePluginReact()],
    server: {
      port: 3105,
    },
  };
});
