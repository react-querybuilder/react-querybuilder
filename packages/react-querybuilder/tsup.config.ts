import AnalyzerPlugin from 'esbuild-analyzer';
import { mkdir } from 'node:fs/promises';
import { defineConfig } from 'tsup';
import { tsupCommonConfig, getCjsIndexWriter } from '../../utils/tsup.common';

export default defineConfig(async options => {
  const buildConfig = await tsupCommonConfig(import.meta.dir)(options);

  buildConfig[0].esbuildPlugins!.push(AnalyzerPlugin({ outfile: './build-analysis.html' }));
  buildConfig[2].esbuildPlugins!.push(
    AnalyzerPlugin({ outfile: './build-analysis.production.html' })
  );

  for (const bc of buildConfig) {
    const entryKey = Object.keys(bc.entry!)[0];
    bc.entry![`${entryKey}.debug`] = bc.entry![entryKey].replace('.ts', '.debug.ts');

    if (bc === buildConfig.at(-1)) {
      const onSuccess = bc.onSuccess as () => Promise<void>;
      bc.onSuccess = async () => {
        // Call original `onSuccess` first to write the non-debug index
        await onSuccess();
        await getCjsIndexWriter('react-querybuilder', 'debug')();
      };
    }
  }

  const utilEntryPoints = {
    formatQuery: 'src/utils/formatQuery/index.ts',
    parseCEL: 'src/utils/parseCEL/index.ts',
    parseJSONata: 'src/utils/parseJSONata/index.ts',
    parseJsonLogic: 'src/utils/parseJsonLogic/index.ts',
    parseMongoDB: 'src/utils/parseMongoDB/index.ts',
    parseSpEL: 'src/utils/parseSpEL/index.ts',
    parseSQL: 'src/utils/parseSQL/index.ts',
    transformQuery: 'src/utils/transformQuery.ts',
  } as const;

  return [
    ...buildConfig,
    {
      ...options,
      entry: utilEntryPoints,
      sourcemap: true,
      format: 'cjs',
      onSuccess: async () => {
        // Write /debug/package.json for node10 resolution
        await mkdir('debug', { recursive: true });
        await Bun.write(
          'debug/package.json',
          JSON.stringify(
            { main: '../dist/cjs/debug.js', types: '../dist/types/index.debug.d.ts' },
            null,
            2
          )
        );
        // Write the other {util}/package.json's for node10 resolution
        await Promise.all(
          Object.keys(utilEntryPoints).map(async util => {
            await mkdir(util, { recursive: true });
            await Bun.write(
              `${util}/package.json`,
              JSON.stringify(
                {
                  main: `../dist/${util}.js`,
                  types: `../dist/types/utils/${util}${util === 'transformQuery' ? '' : '/index'}.d.ts`,
                },
                null,
                2
              )
            );
          })
        );
      },
    },
  ];
});
