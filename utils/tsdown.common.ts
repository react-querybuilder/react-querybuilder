import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { visualizer } from 'rollup-plugin-visualizer';
import type { UserConfig } from 'tsdown';

export const getCjsIndexWriter = (pkgName: string, altPath?: string) => async (): Promise<void> => {
  const ap = altPath ? `.${altPath}` : '';
  const prodfilename = `${pkgName}.cjs.production${ap}.js`;
  const devfilename = `${pkgName}.cjs.development${ap}.js`;
  const indexFilename = altPath ?? 'index';

  await Promise.all([
    writeFile(
      `dist/cjs/${indexFilename}.js`,
      `'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./${prodfilename}');
} else {
  module.exports = require('./${devfilename}');
}
`
    ),
    writeFile(`dist/cjs/${indexFilename}.d.ts`, `export * from './${devfilename}';`),
  ]);
};

export const commonBuildOptions: UserConfig = {
  sourcemap: true,
  platform: 'neutral',
  dts: { oxc: true, resolve: ['type-fest'] },
};

export const tsdownCommonConfig = (sourceDir: string) =>
  (async options => {
    const pkgName = `react-querybuilder${sourceDir.endsWith('react-querybuilder') ? '' : `_${sourceDir.split('/').at(-1)}`}`;
    const x = (await Bun.file(path.join(sourceDir + '/src/index.tsx')).exists()) ? 'x' : '';
    const entryPoint = `src/index.ts${x}`;

    const commonOptions = {
      entry: { [pkgName]: entryPoint },
      ...commonBuildOptions,
      ...options,
    } satisfies UserConfig;

    const productionOptions = {
      minify: true,
      define: { NODE_ENV: 'production' },
    } satisfies UserConfig;

    const opts: UserConfig[] = [
      // ESM, standard bundler dev, embedded `process` references
      {
        ...commonOptions,
        format: 'esm',
        clean: true,
        plugins: (['sunburst', 'treemap', 'flamegraph'] as const).map(template =>
          visualizer({
            template,
            filename: `./build-analysis.${template}.html`,
            brotliSize: true,
            gzipSize: true,
            title: `${sourceDir.split('/').at(-1)} Bundle Size (${template})`,
          })
        ),
      },
      // ESM, Webpack 4 support. Target ES2017 syntax to compile away optional chaining and spreads
      {
        ...commonOptions,
        entry: { [`${pkgName}.legacy-esm`]: entryPoint },
        // ESBuild outputs `'.mjs'` by default for the 'esm' format. Force '.js'
        outExtensions: () => ({ js: '.js' }),
        target: 'es2017',
        format: 'esm',
      },
      // ESM for use in browsers. Minified, with `process` compiled away
      {
        ...commonOptions,
        ...productionOptions,
        entry: { [`${pkgName}.production`]: entryPoint },
        format: 'esm',
        outExtensions: () => ({ js: '.mjs' }),
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
  }) as (options: UserConfig) => Promise<UserConfig[]>;
