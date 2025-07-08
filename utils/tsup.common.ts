import { writeFile } from 'node:fs/promises';
import type { Options } from 'tsup';
import { generateDTS } from './generateDTS';
import { ReactCompilerEsbuildPlugin } from './react-compiler/esbuild-plugin-react-compiler';
import path from 'node:path';

export const getCjsIndexWriter = (pkgName: string, altPath?: string) => async (): Promise<void> => {
  await writeFile(
    `dist/cjs/${altPath ?? 'index'}.js`,
    `'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./${pkgName}.cjs.production${altPath ? `.${altPath}` : ''}.js');
} else {
  module.exports = require('./${pkgName}.cjs.development${altPath ? `.${altPath}` : ''}.js');
}
`
  );
};

export const tsupCommonConfig =
  (sourceDir: string): ((options: Options) => Promise<Options[]>) =>
  async options => {
    const pkgName = `react-querybuilder${sourceDir.endsWith('react-querybuilder') ? '' : `_${sourceDir.split('/').pop()}`}`;
    const x = (await Bun.file(path.join(sourceDir + '/src/index.tsx')).exists()) ? 'x' : '';
    const entryPoint = `src/index.ts${x}`;

    const commonOptions = {
      entry: { [pkgName]: entryPoint },
      sourcemap: true,
      esbuildPlugins:
        process.env.RQB_SKIP_REACT_COMPILER || sourceDir.endsWith('/core')
          ? []
          : [ReactCompilerEsbuildPlugin({ filter: /\.tsx?$/, sourceMaps: true })],
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
        format: 'esm',
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
        format: 'esm',
      },
      // ESM for use in browsers. Minified, with `process` compiled away
      {
        ...commonOptions,
        ...productionOptions,
        entry: { [`${pkgName}.production`]: entryPoint },
        format: 'esm',
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
        onSuccess: getCjsIndexWriter(pkgName),
      },
    ];

    return opts;
  };
