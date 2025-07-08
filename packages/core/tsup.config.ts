import { mkdir } from 'node:fs/promises';
import { defineConfig } from 'tsup';
import { tsupCommonConfig } from '../../utils/tsup.common';

export default defineConfig(async options => {
  const buildConfig = await tsupCommonConfig(import.meta.dir)(options);

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
        // Write the {util}/package.json's for node10 resolution
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
