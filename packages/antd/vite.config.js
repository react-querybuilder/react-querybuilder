import vitePluginReact from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  define: {
    __RQB_DEV__: command === 'build' ? 'false' : 'true',
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: format => `index.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        '@ant-design/icons',
        'antd',
        'date-fns',
        'dayjs',
        'moment',
        'react',
        'react-querybuilder',
      ],
    },
    sourcemap: true,
  },
  plugins: [vitePluginReact()],
  server: {
    port: 3101,
  },
}));
