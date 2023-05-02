import { writeFile } from 'fs/promises';
import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

export default defineConfig(options => {
  const commonOptions: Options = {
    entry: {
      'react-querybuilder_bulma': 'src/index.ts',
    },
    sourcemap: true,
    ...options,
  };

  const productionOptions: Options = {
    minify: true,
    replaceNodeEnv: true,
  };

  const opts: Options[] = [
    // ESM, standard bundler dev, embedded `process` references
    {
      ...commonOptions,
      format: ['esm'],
      dts: true,
      clean: true,
      sourcemap: true,
    },
    // ESM, Webpack 4 support. Target ES2017 syntax to compile away optional chaining and spreads
    {
      ...commonOptions,
      entry: {
        'react-querybuilder_bulma.legacy-esm': 'src/index.ts',
      },
      // ESBuild outputs `'.mjs'` by default for the 'esm' format. Force '.js'
      outExtension: () => ({ js: '.js' }),
      target: 'es2017',
      format: ['esm'],
      sourcemap: true,
    },
    // ESM for use in browsers. Minified, with `process` compiled away
    {
      ...commonOptions,
      ...productionOptions,
      entry: {
        'react-querybuilder_bulma.production': 'src/index.ts',
      },
      format: ['esm'],
      outExtension: () => ({ js: '.mjs' }),
    },
    // CJS development
    {
      ...commonOptions,
      entry: {
        'react-querybuilder_bulma.cjs.development': 'src/index.ts',
      },
      format: 'cjs',
      outDir: './dist/cjs/',
    },
    // CJS production
    {
      ...commonOptions,
      ...productionOptions,
      entry: {
        'react-querybuilder_bulma.cjs.production': 'src/index.ts',
      },
      format: 'cjs',
      outDir: './dist/cjs/',
      onSuccess: async () => {
        // Write the CJS index file
        await writeFile(
          'dist/cjs/index.js',
          `'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./react-querybuilder_bulma.cjs.production.js');
} else {
  module.exports = require('./react-querybuilder_bulma.cjs.development.js');
}
`
        );
      },
    },
  ];

  return opts;
});
