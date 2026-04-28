import { mkdir } from 'node:fs/promises';
import type { UserConfigExport } from 'tsdown';
import { defineConfig } from 'tsdown';
import { commonBuildOptions, tsdownCommonConfig } from '../../utils/tsdown.common';

export default defineConfig(async options => {
  const buildConfig = await tsdownCommonConfig(import.meta.dirname)(options);

  const utilEntryPoints = {
    parseCypher: 'src/utils/parseCypher/index.ts',
    parseGremlin: 'src/utils/parseGremlin/index.ts',
    parseSPARQL: 'src/utils/parseSPARQL/index.ts',
  } as const;

  return [
    ...buildConfig,
    {
      ...commonBuildOptions,
      ...options,
      entry: utilEntryPoints,
    },
    {
      ...commonBuildOptions,
      ...options,
      entry: utilEntryPoints,
      format: 'cjs',
      onSuccess: async () => {
        // Write {util}/package.json for node10 resolution
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
}) as UserConfigExport;
