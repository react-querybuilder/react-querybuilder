import { defineConfig } from 'tsup';
import { getCjsIndexWriter, tsupCommonConfig } from '../../utils/tsup.common';

export default defineConfig(async options => {
  const buildConfig = await tsupCommonConfig(import.meta.dir)(options);

  for (const bc of buildConfig) {
    const entryKey = Object.keys(bc.entry!)[0];
    bc.entry![`${entryKey}.dayjs`] = bc.entry![entryKey].replace('.ts', '.dayjs.ts');
    bc.entry![`${entryKey}.date-fns`] = bc.entry![entryKey].replace('.ts', '.date-fns.ts');

    if (bc === buildConfig.at(-1)) {
      const onSuccess = bc.onSuccess as () => Promise<void>;
      bc.onSuccess = async () => {
        // Call original `onSuccess` first to write the non-debug index
        await onSuccess();
        for await (const util of ['dayjs', 'date-fns']) {
          getCjsIndexWriter('react-querybuilder_datetime', util)();
        }
      };
    }
  }

  return buildConfig;
});
