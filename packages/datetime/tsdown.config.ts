import { mkdir } from 'node:fs/promises';
import { defineConfig } from 'tsdown';
import { getCjsIndexWriter, tsdownCommonConfig } from '../../utils/tsdown.common';

const apiLibs = ['dayjs', 'date-fns', 'jsdate', 'luxon'] as const;

export default defineConfig(async options => {
  const buildConfig = await tsdownCommonConfig(import.meta.dir)(options);

  for (const bc of buildConfig) {
    const entryKey = Object.keys(bc.entry!)[0];

    for (const apiLib of apiLibs) {
      (bc.entry as Record<string, string>)[`${entryKey}.${apiLib}`] = (
        bc.entry as Record<string, string>
      )[entryKey].replace('.ts', `.${apiLib}.ts`);
    }

    if (bc === buildConfig.at(-1)) {
      const onSuccess = bc.onSuccess as () => Promise<void>;
      bc.onSuccess = async () => {
        // Call original `onSuccess` first to write the non-debug index
        await onSuccess();
        await Promise.all(
          apiLibs.map(async apiLib => {
            await getCjsIndexWriter('react-querybuilder_datetime', apiLib)();
            await mkdir(apiLib, { recursive: true });
            await Bun.write(
              `${apiLib}/package.json`,
              JSON.stringify(
                { main: `../dist/cjs/${apiLib}.js`, types: `../dist/cjs/${apiLib}.d.ts` },
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
});
