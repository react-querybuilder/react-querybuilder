import vitePluginReact from '@vitejs/plugin-react';
import path from 'node:path';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vite';
import postcssScopedDonut from './devapp/postcss-scoped-donut';

const coreSrc = '../core/src';
const rqbSrc = '../react-querybuilder/src';

export const getCommonViteConfig = ({
  port = 3100,
  scopedDonut = true,
}: { port?: number; scopedDonut?: boolean } = {}): UserConfig =>
  defineConfig({
    plugins: [vitePluginReact()],
    resolve: {
      alias: {
        'react-querybuilder': path.resolve(`${rqbSrc}`),
        '@react-querybuilder/core': path.resolve(`${coreSrc}`),
        '@rqb-devapp': path.resolve(`../../utils/devapp`),
        '@rqb-parsecel': path.resolve(`${coreSrc}/utils/parseCEL`),
        '@rqb-parsejsonata': path.resolve(`${coreSrc}/utils/parseJSONata`),
        '@rqb-parsejsonlogic': path.resolve(`${coreSrc}/utils/parseJsonLogic`),
        '@rqb-parsemongodb': path.resolve(`${coreSrc}/utils/parseMongoDB`),
        '@rqb-parsespel': path.resolve(`${coreSrc}/utils/parseSpEL`),
        '@rqb-parsesql': path.resolve(`${coreSrc}/utils/parseSQL`),
        '@rqb-utils': path.resolve(`${coreSrc}/utils`),
      },
    },
    css: {
      // preprocessorOptions: { scss: { api: 'legacy' } },
      postcss: { plugins: scopedDonut ? [postcssScopedDonut] : [] },
    },
    server: { port },
  });
