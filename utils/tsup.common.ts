import { writeFile } from 'node:fs/promises';
import type { Options } from 'tsup';
import { generateDTS } from './generateDTS';
import { ReactCompilerEsbuildPlugin } from './react-compiler/esbuild-plugin-react-compiler';
import path from 'node:path';

export const tsupCommonConfig = (sourceDir: string) =>
  (async options => {
    const pkgName = `react-querybuilder${sourceDir.endsWith('react-querybuilder') ? '' : `_${sourceDir.split('/').pop()}`}`;
    const x = (await Bun.file(path.join(sourceDir + '/src/index.tsx')).exists()) ? 'x' : '';
    const entryPoint = `src/index.ts${x}`;

    const commonOptions = {
      entry: { [pkgName]: entryPoint },
      sourcemap: true,
      esbuildPlugins: [ReactCompilerEsbuildPlugin({ filter: /\.tsx?$/, sourceMaps: true })],
      ...options,
    } satisfies Options;

    const productionOptions = {
      minify: true,
      replaceNodeEnv: true,
    } satisfies Options;

    const opts: Options[] = [
      // ESM, standard bundler dev, embedded `process` references
      {
        ...commonOptions,
        format: ['esm'],
        clean: true,
        onSuccess: () => generateDTS(sourceDir),
      },
      // ESM, Webpack 4 support. Target ES2017 syntax to compile away optional chaining and spreads
      {
        ...commonOptions,
        entry: { [`${pkgName}.legacy-esm`]: entryPoint },
        // ESBuild outputs `'.mjs'` by default for the 'esm' format. Force '.js'
        outExtension: () => ({ js: '.js' }),
        target: 'es2017',
        format: ['esm'],
      },
      // ESM for use in browsers. Minified, with `process` compiled away
      {
        ...commonOptions,
        ...productionOptions,
        entry: { [`${pkgName}.production`]: entryPoint },
        format: ['esm'],
        outExtension: () => ({ js: '.mjs' }),
      },
      // CJS development
      {
        ...commonOptions,
        entry: { [`${pkgName}.cjs.development`]: entryPoint },
        format: 'cjs',
        outDir: './dist/cjs/',
      },
      // CJS production
      {
        ...commonOptions,
        ...productionOptions,
        entry: { [`${pkgName}.cjs.production`]: entryPoint },
        format: 'cjs',
        outDir: './dist/cjs/',
        onSuccess: async () => {
          // Write the CJS index file
          await writeFile(
            'dist/cjs/index.js',
            `'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./${pkgName}.cjs.production.js');
} else {
  module.exports = require('./${pkgName}.cjs.development.js');
}
`
          );
        },
      },
    ];

    return opts;
  }) as (options: Options) => Promise<Options[]>;
