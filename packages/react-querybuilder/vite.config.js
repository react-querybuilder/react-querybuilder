import vitePluginReact from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ mode, command }) => {
  const fileName = format => {
    return `index.${format}.js`;
    // Use this line instead if we ever want to do a "development"-mode build:
    // return `index.${format}${mode === 'production' ? '' : '.development'}.js`;
  };
  const plugins = [tsconfigPaths()];
  if (command === 'serve') {
    plugins.push(vitePluginReact());
  }

  return {
    define: { __DEV__: 'process.env.NODE_ENV !== "production"' },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        fileName,
        formats: ['es', 'cjs', 'umd'],
        name: 'ReactQueryBuilder',
      },
      rollupOptions: {
        external: ['immer', 'react', 'react-dnd', 'react-dnd-html5-backend'],
        output: {
          globals: {
            immer: 'immer',
            react: 'React',
            'react-dnd': 'ReactDnD',
            'react-dnd-html5-backend': 'ReactDnDHTML5Backend',
          },
          exports: 'named',
        },
      },
      sourcemap: true,
    },
    plugins,
    server: {
      port: 3100,
    },
  };
});
