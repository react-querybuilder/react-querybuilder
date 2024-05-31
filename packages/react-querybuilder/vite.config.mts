import vitePluginReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    vitePluginReact({
      babel: {
        plugins: [
          [
            'babel-plugin-react-compiler',
            {
              runtimeModule: 'react-compiler-runtime',
            },
          ],
        ],
      },
    }),
  ],
  server: {
    port: 3100,
  },
});
