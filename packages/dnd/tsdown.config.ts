import { mkdir } from 'node:fs/promises';
import type { UserConfigExport } from 'tsdown';
import { defineConfig } from 'tsdown';
import { getCjsIndexWriter, tsdownCommonConfig } from '../../utils/tsdown.common';

const adapters = ['react-dnd', 'dnd-kit', 'pragmatic-dnd'] as const;

export default defineConfig(async options => {
  const buildConfig = await tsdownCommonConfig(import.meta.dirname)(options);

  for (const bc of buildConfig) {
    const entryKey = Object.keys(bc.entry!)[0];

    for (const adapter of adapters) {
      (bc.entry as Record<string, string>)[`${entryKey}.${adapter}`] = `./src/${adapter}.ts`;
    }

    if (bc === buildConfig.at(-1)) {
      const onSuccess = bc.onSuccess as () => Promise<void>;
      bc.onSuccess = async () => {
        await onSuccess();
        await Promise.all(
          adapters.map(async adapter => {
            await getCjsIndexWriter('react-querybuilder_dnd', adapter)();
            await mkdir(adapter, { recursive: true });
            await Bun.write(
              `${adapter}/package.json`,
              JSON.stringify(
                { main: `../dist/cjs/${adapter}.js`, types: `../dist/cjs/${adapter}.d.ts` },
                null,
                2
              )
            );
          })
        );
      };
    }
  }

  return buildConfig;
}) as UserConfigExport;
