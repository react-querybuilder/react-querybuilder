/**
 * Proves `extractFromMarkup` and `extractFromContainer` agree on every scenario × query pair.
 * This guards the `extract.ts` split itself: it is what lets ports keep using a DOM walker
 * (`extractFromContainer`) against fixtures generated with `HTMLRewriter` (`extractFromMarkup`).
 *
 * ## Why `bun test` and not vitest
 *
 * `extractFromMarkup` uses `HTMLRewriter`, a Bun runtime global. Vitest here runs under Node
 * (the `vitest` CLI has a node shebang) with `pool: 'threads'`, so the global is absent in test
 * workers. Rather than polyfill it — which would test the polyfill, not the parser that actually
 * generated the fixtures — this file runs in the Bun-runtime pass that `bun run test` already
 * performs first (`test:bun`). It is excluded from vitest's projects to avoid double collection.
 *
 * The DOM side uses `jsdom` directly rather than a vitest environment, since nothing here needs
 * React DOM — only a spec-compliant parse of a markup string.
 */

import { describe, expect, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryBuilder } from '../../packages/react-querybuilder/src/index';
import { queries } from '../testing/queryFixtures';
import { extractFromContainer, extractFromMarkup } from './extract';
import { scenarios } from './scenarios';

/** Flattened the same way `generate.tsx`'s `renderAll` flattens it, so coverage is identical. */
const pairs = scenarios.flatMap(scenario => {
  const cases: [string, unknown][] = scenario.query
    ? [['inline', scenario.query]]
    : (scenario.queries ?? []).map(name => [name, queries[name]]);

  return cases.map(([queryName, query]) => ({ scenario, queryName, query }));
});

describe('extractFromMarkup vs extractFromContainer', () => {
  for (const { scenario, queryName, query } of pairs) {
    test(`${scenario.name} / ${queryName}`, async () => {
      const html = renderToStaticMarkup(
        React.createElement(QueryBuilder as React.ComponentType<Record<string, unknown>>, {
          ...scenario.props,
          query,
          onQueryChange: () => {},
        })
      );

      // The container must *wrap* the rendered tree, not be its root: `querySelectorAll('*')`
      // excludes the node it is called on, whereas `HTMLRewriter` sees the root element. This
      // mirrors how ports pass Testing Library's `container`.
      const { document } = new JSDOM(html).window;

      expect(extractFromContainer(document.body)).toEqual(await extractFromMarkup(html));
    });
  }
});
