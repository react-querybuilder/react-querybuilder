import vitePluginReact from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ mode, command }) => {
  const fileName = format => {
    return `index.${format}.js`;
    // Use this line instead if we ever want to do a "development"-mode build:
    // return `index.${format}${mode === 'production' ? '' : '.development'}.js`;
  };
  const define = {
    __RQB_DEV__: command === 'build' ? 'false' : 'true',
  };

  return {
    define,
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        fileName,
        formats: ['es', 'cjs', 'umd'],
        name: 'ReactQueryBuilderContext',
      },
      rollupOptions: {
        external: ['immer', 'react', 'react-querybuilder'],
        output: {
          globals: {
            immer: 'immer',
            react: 'React',
            'react-querybuilder': 'ReactQueryBuilder',
          },
          exports: 'named',
        },
      },
      sourcemap: true,
    },
    plugins: [vitePluginReact()],
    server: {
      port: 3107,
    },
  };
});
