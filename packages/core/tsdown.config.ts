import { mkdir } from 'node:fs/promises';
import { defineConfig } from 'tsdown';
import { tsdownCommonConfig } from '../../utils/tsdown.common';

export default defineConfig(async options => {
  const buildConfig = await tsdownCommonConfig(import.meta.dir)(options);

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
      platform: 'neutral',
      format: 'cjs',
      onSuccess: async () => {
        // Write /debug/package.json for node10 resolution
        await mkdir('debug', { recursive: true });
        await Bun.write(
          'debug/package.json',
          JSON.stringify({ main: '../dist/cjs/debug.js', types: '../dist/cjs/debug.d.ts' }, null, 2)
        );
        // Write the other {util}/package.json's for node10 resolution
        await Promise.all(
          Object.keys(utilEntryPoints).map(async util => {
            await mkdir(util, { recursive: true });
            await Bun.write(
              `${util}/package.json`,
              JSON.stringify({ main: `../dist/${util}.js`, types: `../dist/${util}.d.ts` }, null, 2)
            );
          })
        );
      },
    },
  ];
});
