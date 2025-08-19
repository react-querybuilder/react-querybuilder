import vitePluginReact from '@vitejs/plugin-react';
import path from 'node:path';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vite';
import postcssScopedDonut from './devapp/postcss-scoped-donut';

const rqbSrc = '../react-querybuilder/src';

export const getCommonViteConfig = ({
  port = 3100,
  scopedDonut = true,
}: { port?: number; scopedDonut?: boolean } = {}) =>
  defineConfig({
    plugins: [vitePluginReact()],
    resolve: {
      alias: {
        'react-querybuilder': path.resolve(`${rqbSrc}`),
        '@rqb-devapp': path.resolve(`../../utils/devapp`),
        '@rqb-parsecel': path.resolve(`${rqbSrc}/utils/parseCEL`),
        '@rqb-parsejsonata': path.resolve(`${rqbSrc}/utils/parseJSONata`),
        '@rqb-parsejsonlogic': path.resolve(`${rqbSrc}/utils/parseJsonLogic`),
        '@rqb-parsemongodb': path.resolve(`${rqbSrc}/utils/parseMongoDB`),
        '@rqb-parsespel': path.resolve(`${rqbSrc}/utils/parseSpEL`),
        '@rqb-parsesql': path.resolve(`${rqbSrc}/utils/parseSQL`),
        '@rqb-utils': path.resolve(`${rqbSrc}/utils`),
      },
    },
    css: {
      // preprocessorOptions: { scss: { api: 'legacy' } },
      postcss: { plugins: scopedDonut ? [postcssScopedDonut] : [] },
    },
    server: { port },
  }) satisfies UserConfig as UserConfig;
