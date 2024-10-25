import AnalyzerPlugin from 'esbuild-analyzer';
import { mkdir } from 'node:fs/promises';
import { defineConfig } from 'tsup';
import { tsupCommonConfig } from '../../utils/tsup.common';

export default defineConfig(async options => {
  const buildConfig = await tsupCommonConfig(import.meta.dir)(options);

  buildConfig[0].esbuildPlugins!.push(AnalyzerPlugin({ outfile: './build-analysis.html' }));
  buildConfig[2].esbuildPlugins!.push(
    AnalyzerPlugin({ outfile: './build-analysis.production.html' })
  );

  const cjsEntryPoints = {
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
      entry: cjsEntryPoints,
      sourcemap: true,
      format: 'cjs',
      onSuccess: async () => {
        await Promise.all(
          Object.keys(cjsEntryPoints).map(async util => {
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
