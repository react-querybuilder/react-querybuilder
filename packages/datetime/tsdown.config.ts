import { defineConfig } from 'tsdown';
import { getCjsIndexWriter, tsdownCommonConfig } from '../../utils/tsdown.common';

const apiLibs = ['dayjs', 'date-fns', 'jsdate', 'luxon'];

export default defineConfig(async options => {
  const buildConfig = await tsdownCommonConfig(import.meta.dir)(options);

  for (const bc of buildConfig) {
    const entryKey = Object.keys(bc.entry!)[0];

    for (const apiLib of apiLibs) {
      bc.entry![`${entryKey}.${apiLib}`] = bc.entry![entryKey].replace('.ts', `.${apiLib}.ts`);
    }

    if (bc === buildConfig.at(-1)) {
      const onSuccess = bc.onSuccess as () => Promise<void>;
      bc.onSuccess = async () => {
        // Call original `onSuccess` first to write the non-debug index
        await onSuccess();
        for await (const apiLib of apiLibs) {
          getCjsIndexWriter('react-querybuilder_datetime', apiLib)();
        }
      };
    }
  }

  return buildConfig;
});
