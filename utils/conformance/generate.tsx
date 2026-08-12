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
 * Five files under `fixtures/`, split by concern so that a change to (say) classname derivation
 * produces a diff localized to one file:
 *
 * - `classnames.json` — the `class` attribute of every element, plus that element's own text
 *   nodes, per scenario × query, *before* any effect has run.
 * - `classnames-post-flush.json` — the same surface *after* effects have flushed.
 * - `accessible-descriptions.json` — the `title` of every rule group, per scenario × query.
 * - `actions.json` — the query after each curated mutation sequence, plus abort/refusal results.
 * - `index.json` — manifest: schema version, generator provenance, file list.
 *
 * `classnames*` and `accessible-descriptions` are produced by *rendering React* and reading the
 * attributes back out, not by calling core's `derive*ClassNames` helpers with recorded inputs.
 * The latter would be near-tautological: a port that calls the same core helpers would pass by
 * construction, verifying nothing about how it wired them up.
 *
 * `actions` is produced through `QueryManager`, which is the substrate the port plan designates
 * for non-React ports, and which `conformance.test.ts` already pins to the query tools and to
 * `createQueryActions`.
 *
 * ## The two class-surface layers, and why they are wired differently
 *
 * The static layer renders with `renderToStaticMarkup` and a *controlled* `query` prop, so no
 * effect has run. That is the layer an SSR-only port is held to.
 *
 * The post-flush layer renders under jsdom with `react-dom/client` + `act()`, and — deliberately
 * — an *uncontrolled* `defaultQuery` with no `onQueryChange`. With a controlled `query` prop and
 * a no-op `onQueryChange`, the prop-sync effect in `useQueryBuilderSchema` dispatches `queryProp`
 * back over any effect-driven change on the next tick, making the post-flush surface identical to
 * the static one *by construction* and the whole layer vacuous. Ports must reproduce the
 * uncontrolled wiring; the fixture's `description` says so too.
 *
 * Each post-flush case carries `differsFromStatic`, a deep-equality comparison against the
 * corresponding `classnames.json` case, so ports can assert in both directions: `false` cases
 * must equal their static counterpart, `true` cases must match the recorded array.
 *
 * ### Recorded finding: `differsFromStatic` is currently `false` everywhere
 *
 * It is not merely false by coincidence — a mount-and-flush render *cannot* observe the
 * value-editor reset, and the reason is not the controlled/uncontrolled distinction above.
 * React runs child effects before parent effects, so for the `multiValue` scenario's rules `[6]`
 * and `[7]`:
 *
 * 1. `ValueEditor`'s reset effect (child) correctly computes `reset: true` and dispatches the
 *    collapsed value.
 * 2. The mount-query-change effect (`QueryBuilder.useQueryBuilderSchema.ts`, parent) then
 *    dispatches the whole `rootGroup`, clobbering it. `enableMountQueryChange: false` does not
 *    help: it suppresses only the `onQueryChange` callback, not the dispatch.
 * 3. The next render sees the *same* `value` reference from the original query, so the reset
 *    effect's dependencies are unchanged and it never re-runs.
 *
 * The reset is therefore only reachable through a subsequent operator change — `actions.json`
 * territory, not a render layer. Verified by probe: no-op'ing the reset effect changes nothing in
 * this file, and the post-flush DOM differs from the static markup only in `<option selected>`
 * serialization, an SSR-vs-client artifact rather than an effect artifact.
 *
 * This file is kept anyway, because that is the guarantee it was built to record. All three ports
 * independently invented a "post-flush surface is unchanged" assertion with nothing upstream
 * authorizing it; the `differsFromStatic === false` direction now authorizes it byte for byte.
 * The consequence to be aware of: this layer cannot currently fail independently of
 * `classnames.json`. Making it independently falsifiable means either fixing the effect ordering
 * upstream or extending the extracted surface further — the `text` channel added in
 * `schemaVersion` 3 extended it but did not close this: the value-editor reset changes an input's
 * `value` property, which is not a text node, so `differsFromStatic` is still `false` everywhere.
 *
 * There is deliberately **no** post-flush accessible-descriptions layer. The description is a rule
 * group's `title`, produced by the accessible description generator from `path` alone — it never
 * reads `value`, so the layer would be N cases of guaranteed-identical output. Do not re-litigate.
 *
 * ## Render mode
 *
 * `generator.renderMode` is recorded *per file*, since the two class-surface layers no longer
 * agree. `actions.json` and `index.json` omit it: neither renders anything.
 *
 * Generation is option A of the plan — jsdom inside this module — so `conformance:check` remains a
 * single Bun process with no Vitest boot.
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
import { extractFromContainer, extractFromMarkup } from './extract';
import { scenarios } from './scenarios';

/**
 * Bump on any breaking change to the *shape* of these files, so ports can reject a set they do
 * not understand rather than silently mis-reading it.
 *
 * - 3: every `classNames` entry gained a `text` field (own direct text nodes, verbatim).
 */
export const SCHEMA_VERSION = 3;

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

/** A post-flush case: the static shape plus the generator-computed comparison flag. */
interface PostFlushCase extends RenderedCase {
  /** Deep-inequality against the corresponding `classnames.json` case. */
  differsFromStatic: boolean;
}

/** Every scenario × query pair, flattened so rendering can be done in one pass. */
const buildPairs = () =>
  scenarios.flatMap(scenario => {
    const cases: [string, unknown][] = scenario.query
      ? [['inline', scenario.query]]
      : (scenario.queries ?? []).map(name => [name, queries[name]]);

    return cases.map(([queryName, query]) => ({ scenario, queryName, query }));
  });

/**
 * Renders every scenario × query pair once and splits the result into the two concern-specific
 * shapes. Rendering is the expensive part, so it is deliberately not done twice.
 */
const renderAll = async () => {
  const pairs = buildPairs();

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

/**
 * Renders every pair again under jsdom with effects flushed, and records the resulting class
 * surface plus whether it differs from the static one.
 *
 * Uncontrolled on purpose — see the header docblock.
 */
const renderAllPostFlush = async (staticCases: RenderedCase[]): Promise<PostFlushCase[]> => {
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM('<!doctype html><html><body></body></html>');

  // Must be installed *before* `react-dom/client` is first evaluated, hence the dynamic imports
  // below. `navigator` is read-only on `globalThis` under Bun, so it needs `defineProperty`.
  const globals = globalThis as Record<string, unknown>;
  globals.window = dom.window;
  globals.document = dom.window.document;
  globals.IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(globalThis, 'navigator', {
    value: dom.window.navigator,
    configurable: true,
  });

  const { createRoot } = await import('react-dom/client');
  const { act } = await import('react');

  const cases: PostFlushCase[] = [];

  // Sequential, not `Promise.all`: `act()` and the jsdom document are global state, and the mount
  // registry in `useQueryBuilderSchema` is keyed on `qbId` — leaked mounts trip the collision
  // fallback and silently change the rendered query. Each root is unmounted before the next.
  // Hence the `no-await-in-loop` suppressions below: parallelizing is the bug, not the fix.
  for (const [i, { scenario, queryName, query }] of buildPairs().entries()) {
    const container = dom.window.document.createElement('div');
    dom.window.document.body.append(container);

    const root = createRoot(container);
    // oxlint-disable-next-line no-await-in-loop
    await act(async () => {
      root.render(
        React.createElement(QueryBuilder as React.ComponentType<Record<string, unknown>>, {
          ...scenario.props,
          defaultQuery: query,
        })
      );
    });
    // A reset write schedules another render; a second empty act() drains it.
    // oxlint-disable-next-line no-await-in-loop
    await act(async () => {});

    const { classNames } = extractFromContainer(container);

    // oxlint-disable-next-line no-await-in-loop
    await act(async () => {
      root.unmount();
    });
    container.remove();

    cases.push({
      scenario: scenario.name,
      query: queryName,
      differsFromStatic: JSON.stringify(classNames) !== JSON.stringify(staticCases[i].classNames),
      classNames,
    });
  }

  return cases;
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

/**
 * The `text` field's contract, stated inside the shipped fixtures themselves rather than only in
 * this repo — a port reading the tarball has no other copy of it.
 */
const textRule =
  "Each entry's `text` is the concatenation of that element's OWN direct text-node children, " +
  'verbatim: no trimming, no whitespace collapsing, no descendant text, character references ' +
  'decoded. Elements with no direct text nodes carry `""` rather than omitting the key. ' +
  'Reproduce it with a DOM walk over `childNodes` filtered to text nodes; `textContent` is NOT ' +
  'equivalent. Key order within an entry is `tag`, `testID`?, `path`?, `className`, `text`.';

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
    },
  };

  /** `renderMode` is per-file now; the two class-surface layers no longer agree on it. */
  const renderedMeta = (renderMode: string) => ({
    ...meta,
    generator: { ...meta.generator, renderMode },
  });

  const { classNameCases, descriptionCases } = await renderAll();
  const postFlushCases = await renderAllPostFlush(classNameCases);
  const actionCases = runAllSequences();

  const files: Record<string, unknown> = {
    'classnames.json': {
      ...renderedMeta('renderToStaticMarkup'),
      description:
        'The verbatim `class` attribute of every element with one, in document order, per ' +
        `scenario and query. Rendered via renderToStaticMarkup, so no effects have run. ${textRule}`,
      scenarios: scenarios.map(({ name, description, props }) => ({
        name,
        description,
        props: JSON.parse(JSON.stringify(props, (_k, v) => (typeof v === 'function' ? null : v))),
      })),
      cases: classNameCases,
    },
    'classnames-post-flush.json': {
      ...renderedMeta('react-dom/client + act (jsdom)'),
      description:
        'The class surface after effects have flushed. Rendered UNCONTROLLED (`defaultQuery`, ' +
        'no `onQueryChange`) so that effect-driven query changes — notably the value-editor ' +
        'reset — actually land instead of being reverted by the controlled-prop sync effect. ' +
        'Ports must reproduce the uncontrolled wiring. `differsFromStatic` is a deep comparison ' +
        'against the corresponding `classnames.json` case: `false` cases must equal their static ' +
        'counterpart, `true` cases must match the recorded array. There is no post-flush ' +
        'accessible-descriptions layer: the description derives from `path` alone. FINDING: ' +
        '`differsFromStatic` is currently `false` for every case, and necessarily so. React runs ' +
        "child effects before parent effects, so ValueEditor's reset effect dispatches its " +
        'collapsed value and the mount-query-change effect then re-dispatches the whole root ' +
        'group over it; the next render sees an unchanged `value` reference, so the reset effect ' +
        'never re-runs. A mount-and-flush render therefore cannot observe the value-editor reset ' +
        '— it is reachable only through a subsequent operator change. This layer records the ' +
        '"post-flush surface is unchanged" guarantee that ports had been asserting without ' +
        `upstream authorization; it does not currently fail independently of \`classnames.json\`. ${textRule}`,
      cases: postFlushCases,
    },
    'accessible-descriptions.json': {
      ...renderedMeta('renderToStaticMarkup'),
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
      postFlushCases: postFlushCases.length,
      actionSequences: actionCases.length,
    },
  });

  return [...Object.keys(files), 'index.json'];
};

if (import.meta.main) {
  const written = await generate();
  console.log(`Wrote ${written.length} conformance fixture files to utils/conformance/fixtures`);
}
