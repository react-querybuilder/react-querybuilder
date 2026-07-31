import { mkdir } from 'node:fs/promises';
import { format } from 'oxfmt';
import type { UserConfig, UserConfigExport } from 'tsdown';
import { defineConfig } from 'tsdown';
import {
  commonBuildOptions,
  getCjsIndexWriter,
  tsdownCommonConfig,
} from '../../utils/tsdown.common';

const writeNode10pkg = async (entryPointNames: string[]) => {
  // Write /debug/package.json for node10 resolution
  await mkdir('debug', { recursive: true });
  await Bun.write(
    'debug/package.json',
    (
      await format(
        'package.json',
        JSON.stringify({ main: '../dist/cjs/debug.js', types: '../dist/cjs/debug.d.ts' }, null, 2)
      )
    ).code
  );
  // Write the other {util}/package.json's for node10 resolution
  await Promise.all(
    entryPointNames.map(async util => {
      await mkdir(util, { recursive: true });
      await Bun.write(
        `${util}/package.json`,
        (
          await format(
            'package.json',
            JSON.stringify({ main: `../dist/${util}.js`, types: `../dist/${util}.d.ts` }, null, 2)
          )
        ).code
      );
    })
  );
};

const sharesMainBundle = {
  deps: {
    ...commonBuildOptions.deps,
    neverBundle: [
      ...(Array.isArray(commonBuildOptions.deps?.neverBundle)
        ? commonBuildOptions.deps.neverBundle
        : []),
      'react-querybuilder',
    ],
  },
} satisfies Pick<UserConfig, 'deps'>;

export default defineConfig(async options => {
  const buildConfig = await tsdownCommonConfig(import.meta.dirname)(options);

  for (const bc of buildConfig) {
    const entryKey = Object.keys(bc.entry!)[0];
    // oxlint-disable-next-line no-explicit-any
    (bc.entry as any)[`${entryKey}.debug`] = (bc.entry as any)[entryKey].replace(
      '.ts',
      '.debug.ts'
    );

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
    formatQuery: 'src/fwd/formatQuery.ts',
    parseCEL: 'src/fwd/parseCEL.ts',
    parseCypher: 'src/fwd/parseCypher.ts',
    parseGremlin: 'src/fwd/parseGremlin.ts',
    parseJSONata: 'src/fwd/parseJSONata.ts',
    parseJsonLogic: 'src/fwd/parseJsonLogic.ts',
    parseMongoDB: 'src/fwd/parseMongoDB.ts',
    parseSPARQL: 'src/fwd/parseSPARQL.ts',
    parseSpEL: 'src/fwd/parseSpEL.ts',
    parseSQL: 'src/fwd/parseSQL.ts',
    transformQuery: 'src/fwd/transformQuery.ts',
  } as const;

  return [
    ...buildConfig,
    // These entry points augment the main bundle's singletons—the Redux store, the React
    // contexts, and the `dispatchQuery` registry—rather than standing alone, so `react-
    // querybuilder` must stay external. Bundling it would give each entry point its own copy of
    // every singleton: a provider in one bundle would populate a context that the other bundle
    // never reads, and a slice injected into one store would never see actions dispatched to the
    // other.
    {
      ...commonBuildOptions,
      ...options,
      ...sharesMainBundle,
      entry: 'src/async.ts',
    },
    {
      ...commonBuildOptions,
      ...options,
      ...sharesMainBundle,
      format: 'cjs',
      entry: 'src/async.ts',
    },
    {
      ...commonBuildOptions,
      ...options,
      ...sharesMainBundle,
      entry: { history: 'src/history/index.ts' },
    },
    {
      ...commonBuildOptions,
      ...options,
      ...sharesMainBundle,
      format: 'cjs',
      entry: { history: 'src/history/index.ts' },
    },
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
      onSuccess: () => writeNode10pkg(['async', 'history', ...Object.keys(utilEntryPoints)]),
    },
  ];
}) as UserConfigExport;
