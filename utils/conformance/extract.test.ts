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

      const fromContainer = extractFromContainer(document.body);
      const fromMarkup = await extractFromMarkup(html);

      expect(fromContainer).toEqual(fromMarkup);

      // `toEqual` ignores key insertion order, but the fixtures are JSON and ports assert deep
      // equality against them — so the order is part of the contract, not an implementation
      // detail. Compared as JSON, which is order-sensitive.
      expect(JSON.stringify(fromContainer)).toBe(JSON.stringify(fromMarkup));
    });
  }
});

describe('text channel', () => {
  test('records own direct text nodes verbatim, not descendant text', async () => {
    const html =
      '<div class="outer"> a <span class="inner">b</span> c </div><p class="empty"><b class="k">x</b></p>';
    const { document } = new JSDOM(html).window;

    const expected = [
      { tag: 'div', className: 'outer', text: ' a  c ' },
      { tag: 'span', className: 'inner', text: 'b' },
      { tag: 'p', className: 'empty', text: '' },
      { tag: 'b', className: 'k', text: 'x' },
    ];

    expect((await extractFromMarkup(html)).classNames).toEqual(expected);
    expect(extractFromContainer(document.body).classNames).toEqual(expected);
  });

  test('decodes character references to match DOM text-node semantics', async () => {
    const html = '<div class="c">a &amp; b &lt;c&gt; &quot;d&quot; &#x27;e&#x27; &#38;</div>';
    const { document } = new JSDOM(html).window;

    expect((await extractFromMarkup(html)).classNames[0].text).toBe(`a & b <c> "d" 'e' &`);
    expect(extractFromContainer(document.body).classNames[0].text).toBe(
      (await extractFromMarkup(html)).classNames[0].text
    );
  });
});
