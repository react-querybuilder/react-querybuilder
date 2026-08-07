/**
 * Generates the Phase 0.5 conformance fixture set.
 *
 * ## Not published
 *
 * The output is committed to this repo but deliberately not distributed — not through core's
 * `dist`, and not as its own package. A package under `packages/*` would be swept into lerna's
 * fixed versioning and `forcePublish`, `version.ts`, the website's TypeDoc `entryPoints`,
 * `pkg-pr-new`, and `decatalog`, and would be republished every release despite changing on its
 * own schedule. More to the point, nothing can consume it yet: the first port repo does not
 * exist. Choosing a distribution channel is a Phase 1 decision, made when there is a real
 * consumer to shape it.
 *
 * What *is* live today is the drift check (`bun conformance:check`, wired into `bun checkall`),
 * which is also the Phase 0.3 regression guard: this module imports the core substrate exports by
 * name, so dropping one from `index.ts` breaks generation here rather than in a port months on.
 *
 * ## Output
 *
 * Four files under `fixtures/`, split by concern so that a change to (say) classname derivation
 * produces a diff localized to one file:
 *
 * - `classnames.json` — the `class` attribute of every element, per scenario × query.
 * - `accessible-descriptions.json` — the `title` of every rule group, per scenario × query.
 * - `actions.json` — the query after each curated mutation sequence, plus abort/refusal results.
 * - `index.json` — manifest: schema version, generator provenance, file list.
 *
 * `classnames` and `accessible-descriptions` are produced by *rendering React to static markup*
 * and reading the attributes back out, not by calling core's `derive*ClassNames` helpers with
 * recorded inputs. The latter would be near-tautological: a port that calls the same core helpers
 * would pass by construction, verifying nothing about how it wired them up.
 *
 * `actions` is produced through `QueryManager`, which is the substrate the port plan designates
 * for non-React ports, and which `conformance.test.ts` already pins to the query tools and to
 * `createQueryActions`.
 *
 * Run with `bun conformance:generate`. The output is committed; `bun conformance:check`
 * regenerates into a temp dir and diffs, so behavior changes surface as a reviewable diff.
 */

import { mkdir, readdir, rm } from 'node:fs/promises';
import * as path from 'node:path';
import { format } from 'oxfmt';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryBuilder } from '../../packages/react-querybuilder/src/index';
import {
  createIdGenerator,
  queries,
  runViaQueryManager,
  sequences,
} from '../testing/queryFixtures';
import { extractFromMarkup } from './extract';
import { scenarios } from './scenarios';

/**
 * Bump on any breaking change to the *shape* of these files, so ports can reject a set they do
 * not understand rather than silently mis-reading it.
 */
export const SCHEMA_VERSION = 1;

const rootDir = path.resolve(import.meta.dirname, '../..');
const defaultOutDir = path.join(import.meta.dirname, 'fixtures');

/**
 * Stamped into every file. The fixtures describe core's rendered and mutated behavior, so core's
 * version is the meaningful provenance even though the files ship with neither core nor npm.
 */
const corePackageVersion = async (): Promise<string> =>
  (await Bun.file(path.join(rootDir, 'packages/core/package.json')).json()).version;

// #region Rendered surface

interface RenderedCase {
  scenario: string;
  query: string;
  classNames: Awaited<ReturnType<typeof extractFromMarkup>>['classNames'];
}

interface DescriptionCase {
  scenario: string;
  query: string;
  accessibleDescriptions: Awaited<ReturnType<typeof extractFromMarkup>>['accessibleDescriptions'];
}

/**
 * Renders every scenario × query pair once and splits the result into the two concern-specific
 * shapes. Rendering is the expensive part, so it is deliberately not done twice.
 */
const renderAll = async () => {
  /** Every scenario × query pair, flattened so rendering can be done in one pass. */
  const pairs = scenarios.flatMap(scenario => {
    const cases: [string, unknown][] = scenario.query
      ? [['inline', scenario.query]]
      : (scenario.queries ?? []).map(name => [name, queries[name]]);

    return cases.map(([queryName, query]) => ({ scenario, queryName, query }));
  });

  const extracted = await Promise.all(
    pairs.map(({ scenario, query }) =>
      extractFromMarkup(
        renderToStaticMarkup(
          React.createElement(QueryBuilder as React.ComponentType<Record<string, unknown>>, {
            ...scenario.props,
            query,
            onQueryChange: () => {},
          })
        )
      )
    )
  );

  const classNameCases: RenderedCase[] = [];
  const descriptionCases: DescriptionCase[] = [];

  for (const [i, { scenario, queryName }] of pairs.entries()) {
    const { classNames, accessibleDescriptions } = extracted[i];
    classNameCases.push({ scenario: scenario.name, query: queryName, classNames });
    descriptionCases.push({ scenario: scenario.name, query: queryName, accessibleDescriptions });
  }

  return { classNameCases, descriptionCases };
};

// #endregion

// #region Mutation results

/**
 * Replays every curated sequence through `QueryManager` with a deterministic ID generator, so the
 * recorded `id`s are comparable across implementations rather than merely structurally
 * equivalent.
 */
const runAllSequences = () =>
  sequences.map(({ name, fixture, ops, options = {} }) => {
    const { query, aborts, allAborts, refused } = runViaQueryManager(ops, queries[fixture], {
      ...options,
      idGenerator: createIdGenerator(),
    });

    return {
      name,
      fixture,
      ops,
      options,
      expected: { query, aborts, allAborts, refused },
    };
  });

// #endregion

/**
 * Writes formatted JSON.
 *
 * The output *must* go through `oxfmt`, not just `JSON.stringify`. `bun fmt` formats the
 * committed fixtures wherever they live; without this the formatter and the generator would
 * disagree forever and `conformance:check` would fail immediately after every `bun fmt`.
 */
const writeJson = async (file: string, data: unknown) => {
  const { code } = await format(path.basename(file), JSON.stringify(data, null, 2));
  await Bun.write(file, code);
};

export const generate = async (outDir: string = defaultOutDir): Promise<string[]> => {
  await mkdir(outDir, { recursive: true });

  // Remove stale files so a renamed or dropped scenario cannot linger in the committed output.
  const existing = await readdir(outDir);
  await Promise.all(existing.filter(e => e.endsWith('.json')).map(e => rm(path.join(outDir, e))));

  const version = await corePackageVersion();
  const meta = {
    schemaVersion: SCHEMA_VERSION,
    generator: {
      package: '@react-querybuilder/core',
      version,
      source: 'utils/conformance/generate.tsx',
      renderMode: 'renderToStaticMarkup',
    },
  };

  const { classNameCases, descriptionCases } = await renderAll();
  const actionCases = runAllSequences();

  const files: Record<string, unknown> = {
    'classnames.json': {
      ...meta,
      description:
        'The verbatim `class` attribute of every element with one, in document order, per ' +
        'scenario and query. Rendered via renderToStaticMarkup, so no effects have run.',
      scenarios: scenarios.map(({ name, description, props }) => ({
        name,
        description,
        props: JSON.parse(JSON.stringify(props, (_k, v) => (typeof v === 'function' ? null : v))),
      })),
      cases: classNameCases,
    },
    'accessible-descriptions.json': {
      ...meta,
      description:
        'The `title` attribute of every rule group, which is where the accessible description ' +
        'generator output surfaces.',
      cases: descriptionCases,
    },
    'actions.json': {
      ...meta,
      description:
        'Each curated mutation sequence replayed through QueryManager with a deterministic id ' +
        'generator, with the resulting query, per-op abort reasons, and refusal flags.',
      cases: actionCases,
    },
  };

  await Promise.all(
    Object.entries(files).map(([name, data]) => writeJson(path.join(outDir, name), data))
  );

  await writeJson(path.join(outDir, 'index.json'), {
    ...meta,
    files: Object.keys(files),
    counts: {
      scenarios: scenarios.length,
      renderedCases: classNameCases.length,
      actionSequences: actionCases.length,
    },
  });

  return [...Object.keys(files), 'index.json'];
};

if (import.meta.main) {
  const written = await generate();
  console.log(`Wrote ${written.length} conformance fixture files to utils/conformance/fixtures`);
}
