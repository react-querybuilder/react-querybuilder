import { mkdir } from 'node:fs/promises';
import { format } from 'oxfmt';
import type { UserConfigExport } from 'tsdown';
import { defineConfig } from 'tsdown';
import { getCjsIndexWriter, tsdownCommonConfig } from '../../utils/tsdown.common';

// React entry points exposed under subpaths (e.g. `@react-querybuilder/expr/ui`).
// The package root stays React-free (imports only `@react-querybuilder/core`) so its
// processors run in non-React/server environments; all React code lives behind these
// subpaths. Mirrors the `@react-querybuilder/datetime` split (see EXPRESSIONS_PLAN.md §8).
// A lib is only wired into the build once its source barrel (`src/index.<lib>.ts`) exists,
// which keeps the non-React build green until the React layer lands in M4.
const uiLibs = ['ui'] as const;

export default defineConfig(async options => {
  const buildConfig = await tsdownCommonConfig(import.meta.dirname)(options);

  const presentUiLibs = (
    await Promise.all(
      uiLibs.map(async lib =>
        (await Bun.file(`${import.meta.dirname}/src/index.${lib}.ts`).exists()) ? lib : undefined
      )
    )
  ).filter((lib): lib is (typeof uiLibs)[number] => lib !== undefined);

  for (const bc of buildConfig) {
    const entryKey = Object.keys(bc.entry!)[0];

    for (const uiLib of presentUiLibs) {
      (bc.entry as Record<string, string>)[`${entryKey}.${uiLib}`] = (
        bc.entry as Record<string, string>
      )[entryKey].replace('.ts', `.${uiLib}.ts`);
    }

    if (bc === buildConfig.at(-1) && presentUiLibs.length > 0) {
      const onSuccess = bc.onSuccess as () => Promise<void>;
      bc.onSuccess = async () => {
        // Call original `onSuccess` first to write the root CJS index
        await onSuccess();
        await Promise.all(
          presentUiLibs.map(async uiLib => {
            await getCjsIndexWriter('react-querybuilder_expr', uiLib)();
            await mkdir(uiLib, { recursive: true });
            await Bun.write(
              `${uiLib}/package.json`,
              (
                await format(
                  'package.json',
                  JSON.stringify(
                    { main: `../dist/cjs/${uiLib}.js`, types: `../dist/cjs/${uiLib}.d.ts` },
                    null,
                    2
                  )
                )
              ).code
            );
          })
        );
      };
    }
  }

  return buildConfig;
}) as UserConfigExport;
