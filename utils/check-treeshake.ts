/**
 * Asserts that the published ESM builds of `react-querybuilder` and `@react-querybuilder/core`
 * tree-shake: bundling a narrow import must not drag in unrelated modules (Redux, components,
 * parsers, etc.).
 *
 * Each scenario is bundled from the built `dist` (resolved through the workspace symlinks) with
 * two bundlers:
 *
 * - rolldown: module-level assertions via `chunk.moduleIds`
 * - Bun.build: minified size only, as a cross-check against a second tree-shaker
 *
 * `react`/`react-dom` are external; everything else (RTK, react-redux, immer, ...) is bundled so
 * leaks show up.
 *
 * Run via `bun ./utils/check-treeshake.ts` (after building core and react-querybuilder).
 * Pass `--verbose` to list surviving modules.
 */
/* oxlint-disable no-await-in-loop -- sequential for readable output */
import { mkdir, rm } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { rolldown } from 'rolldown';

const root = join(import.meta.dirname, '..');
const tmpDir = join(import.meta.dirname, '.treeshake-tmp');
const verbose = process.argv.includes('--verbose');
const external = ['react', 'react-dom', 'react/jsx-runtime'];

interface Scenario {
  name: string;
  code: string;
  /** Module id patterns that must not survive */
  forbid: RegExp[];
  /** Module id patterns that must survive (sanity check that the scenario does anything) */
  require?: RegExp[];
}

const rtk = /node_modules\/(@reduxjs\/toolkit|redux|react-redux|reselect|redux-thunk)\//;
const rqbComponents = /packages\/react-querybuilder\/dist\/components\//;
const rqbRedux = /packages\/react-querybuilder\/dist\/redux\//;
const coreQueryManager = /packages\/core\/dist\/utils\/QueryManager\.mjs$/;
// `formatQuery/utils` holds small shared helpers (e.g. `processMatchMode`); not the formatter
const coreFormatQuery = /packages\/core\/dist\/utils\/formatQuery\/(?!utils\.mjs$)/;
const coreParsers =
  /packages\/core\/dist\/utils\/parse(CEL|Cypher|Gremlin|JSONata|JsonLogic|MongoDB|SPARQL|SpEL|SQL)\//;
const immer = /node_modules\/immer\//;
const chevrotain = /node_modules\/chevrotain\//;

const scenarios: Scenario[] = [
  {
    name: 'core: clsx',
    code: `export { clsx } from '@react-querybuilder/core';`,
    forbid: [coreQueryManager, coreFormatQuery, coreParsers, immer],
  },
  {
    name: 'core: isRuleGroup',
    code: `export { isRuleGroup } from '@react-querybuilder/core';`,
    forbid: [coreQueryManager, coreFormatQuery, coreParsers, immer],
    require: [/packages\/core\/dist\/utils\/isRuleGroup\.mjs$/],
  },
  {
    name: 'core: formatQuery',
    code: `export { formatQuery } from '@react-querybuilder/core';`,
    forbid: [coreQueryManager, coreParsers, chevrotain],
    require: [coreFormatQuery],
  },
  {
    name: 'core: add (query tools)',
    code: `export { add } from '@react-querybuilder/core';`,
    forbid: [coreQueryManager, coreFormatQuery, coreParsers],
    require: [immer],
  },
  {
    name: 'core/formatQuery subpath',
    code: `export { formatQuery } from '@react-querybuilder/core/formatQuery';`,
    forbid: [coreQueryManager, coreParsers],
  },
  {
    name: 'rqb: formatQuery (re-exported from core)',
    code: `export { formatQuery } from 'react-querybuilder';`,
    forbid: [rtk, rqbComponents, rqbRedux, coreQueryManager, coreParsers],
  },
  {
    name: 'rqb: toOptions',
    code: `export { toOptions } from 'react-querybuilder';`,
    forbid: [rtk, rqbComponents, rqbRedux],
  },
  {
    name: 'rqb: mergeTranslations',
    code: `export { mergeTranslations } from 'react-querybuilder';`,
    forbid: [rtk, rqbComponents, rqbRedux],
  },
  {
    name: 'rqb: ValueSelector',
    code: `export { ValueSelector } from 'react-querybuilder';`,
    forbid: [rtk, rqbRedux, /dist\/components\/(Rule|RuleGroup|QueryBuilder)\w*\.mjs$/],
  },
  {
    name: 'rqb: QueryBuilder (baseline)',
    code: `export { QueryBuilder } from 'react-querybuilder';`,
    forbid: [coreParsers],
    require: [rtk, rqbComponents],
  },
];

const bundleRolldown = async (entry: string) => {
  const bundle = await rolldown({ input: entry, external, logLevel: 'silent' });
  const { output } = await bundle.generate({ format: 'esm', minify: true });
  await bundle.close();
  const chunks = output.filter(o => o.type === 'chunk');
  return {
    size: chunks.reduce((n, c) => n + c.code.length, 0),
    moduleIds: chunks.flatMap(c => c.moduleIds).map(id => relative(root, id)),
  };
};

const bundleBun = async (entry: string) => {
  const result = await Bun.build({
    entrypoints: [entry],
    external,
    minify: true,
    target: 'browser',
  });
  if (!result.success) throw new AggregateError(result.logs, 'Bun.build failed');
  let size = 0;
  for (const o of result.outputs) size += (await o.text()).length;
  return size;
};

const kb = (n: number) => `${(n / 1024).toFixed(1)}kB`.padStart(8);

await rm(tmpDir, { recursive: true, force: true });
await mkdir(tmpDir, { recursive: true });

let failed = false;

try {
  for (const [i, s] of scenarios.entries()) {
    const entry = join(tmpDir, `entry${i}.mjs`);
    await Bun.write(entry, s.code);

    const [rd, bunSize] = await Promise.all([bundleRolldown(entry), bundleBun(entry)]);
    const ids = rd.moduleIds.filter(id => !id.startsWith(relative(root, tmpDir)));

    const problems = [
      ...s.forbid.flatMap(re => ids.filter(id => re.test(id)).map(id => `unexpected ${id}`)),
      ...(s.require ?? [])
        .filter(re => !ids.some(id => re.test(id)))
        .map(re => `missing module matching ${re}`),
    ];

    const status = problems.length ? 'FAIL' : 'ok  ';
    console.log(`${status} ${kb(rd.size)} rolldown ${kb(bunSize)} bun  ${s.name}`);
    for (const p of problems) console.log(`       ${p}`);
    if (verbose) for (const id of ids) console.log(`       · ${id}`);
    failed ||= problems.length > 0;
  }
} finally {
  await rm(tmpDir, { recursive: true, force: true });
}

if (failed) {
  console.error('\nTree-shaking regressions detected (see FAIL lines above).');
  process.exit(1);
}
