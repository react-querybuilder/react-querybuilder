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

/**
 * Adds `react-querybuilder` to a build's external dependencies, preserving whatever `deps`
 * configuration the build already had. Applied to the fully merged config (rather than spread
 * over it) so that `deps` coming from either `commonBuildOptions` or the incoming `options` is
 * extended instead of replaced.
 */
const sharesMainBundle = (config: UserConfig): UserConfig => {
  const { neverBundle } = config.deps ?? {};

  // `true` (bundle nothing) and predicate functions cannot be extended with an extra entry
  // without changing their meaning. Fail the build rather than silently dropping either them or
  // `react-querybuilder`—a miss here gives the entry point its own copy of the Redux store and
  // React contexts, which stays invisible until the published bundles are loaded together.
  if (neverBundle === true || typeof neverBundle === 'function') {
    throw new TypeError(
      'sharesMainBundle cannot add `react-querybuilder` to a non-list `deps.neverBundle`'
    );
  }

  return {
    ...config,
    deps: { ...config.deps, neverBundle: [...[neverBundle ?? []].flat(), 'react-querybuilder'] },
  };
};

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
    sharesMainBundle({
      ...commonBuildOptions,
      ...options,
      entry: 'src/async.ts',
    }),
    sharesMainBundle({
      ...commonBuildOptions,
      ...options,
      format: 'cjs',
      entry: 'src/async.ts',
    }),
    sharesMainBundle({
      ...commonBuildOptions,
      ...options,
      entry: { history: 'src/history/index.ts' },
    }),
    sharesMainBundle({
      ...commonBuildOptions,
      ...options,
      format: 'cjs',
      entry: { history: 'src/history/index.ts' },
    }),
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
