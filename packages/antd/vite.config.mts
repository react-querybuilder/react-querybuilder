import vitePluginReact from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import postcssScopedDonut from '../../utils/devapp/postcss-scoped-donut';

export default defineConfig({
  plugins: [vitePluginReact({ babel: { plugins: [['react-compiler', { target: '18' }]] } })],
  resolve: {
    alias: {
      'react-querybuilder': path.resolve(import.meta.dir, '../react-querybuilder/src'),
      '@rqb-devapp': path.resolve(import.meta.dir, '../../utils/devapp'),
      '@rqb-parsecel': path.resolve(import.meta.dir, '../react-querybuilder/src/utils/parseCEL'),
      '@rqb-parsejsonata': path.resolve(
        import.meta.dir,
        '../react-querybuilder/src/utils/parseJSONata'
      ),
      '@rqb-parsejsonlogic': path.resolve(
        import.meta.dir,
        '../react-querybuilder/src/utils/parseJsonLogic'
      ),
      '@rqb-parsemongodb': path.resolve(
        import.meta.dir,
        '../react-querybuilder/src/utils/parseMongoDB'
      ),
      '@rqb-parsespel': path.resolve(import.meta.dir, '../react-querybuilder/src/utils/parseSpEL'),
      '@rqb-parsesql': path.resolve(import.meta.dir, '../react-querybuilder/src/utils/parseSQL'),
      '@rqb-utils': path.resolve(import.meta.dir, '../react-querybuilder/src/utils'),
    },
  },
  css: { postcss: { plugins: [postcssScopedDonut] } },
  server: {
    port: 3101,
  },
});
