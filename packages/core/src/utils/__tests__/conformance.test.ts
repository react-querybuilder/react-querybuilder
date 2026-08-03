/**
 * Cross-implementation conformance.
 *
 * `<QueryBuilder>` drives `createQueryActions` (via `useQueryBuilderSchema`) over a Redux store,
 * while `QueryManager` — the designated substrate for non-React ports — owns its own state and
 * calls the query tools directly. Both are supposed to implement one spec. Nothing asserted that
 * until this file: every sequence below is applied through all three implementations and the
 * results are compared.
 *
 * Deliberately `.ts` with no React imports, so it runs under **both** `bun test:bun` and Vitest.
 * The fixtures are imported by relative path rather than through `@rqb-testing`, whose barrel
 * pulls in React; see the docblock in `queryFixtures.ts`.
 */

import type { Op, RunOptions, Sequence } from '../../../../../utils/testing/queryFixtures';
import {
  actionsSupport,
  badID,
  badPath,
  createIdGenerator,
  queries,
  runViaActions,
  runViaQueryManager,
  runViaQueryTools,
  sequences,
  stripIDs,
} from '../../../../../utils/testing/queryFixtures';
import type { AbortReason } from '../queryTools';

/**
 * Runs one sequence through all three implementations, giving each its own ID generator seeded
 * identically so IDs are comparable rather than merely structurally equivalent.
 */
const runAll = (ops: Op[], fixture: keyof typeof queries, options: RunOptions = {}) => {
  const query = queries[fixture];
  return {
    manager: runViaQueryManager(ops, query, { ...options, idGenerator: createIdGenerator() }),
    tools: runViaQueryTools(ops, query, { ...options, idGenerator: createIdGenerator() }),
    actions: actionsSupport(ops)
      ? runViaActions(ops, query, { ...options, idGenerator: createIdGenerator() })
      : null,
  };
};

describe('QueryManager conforms to the query tools', () => {
  for (const { name, fixture, ops, options } of sequences) {
    describe(name, () => {
      it('produces the same query', () => {
        const { manager, tools } = runAll(ops, fixture, options);
        expect(stripIDs(manager.query)).toEqual(stripIDs(tools.query));
      });

      it('generates the same ids', () => {
        const { manager, tools } = runAll(ops, fixture, options);
        expect(manager.query).toEqual(tools.query);
      });

      it('aborts for the same reasons', () => {
        const { manager, tools } = runAll(ops, fixture, options);
        expect(manager.aborts).toEqual(tools.aborts);
        expect(manager.refused).toEqual(tools.refused);
      });
    });
  }
});

/**
 * The action handlers collapse every abort into an `undefined` return, so only some abort
 * reasons map onto a refusal one-for-one. `target-not-found` and friends are reported by the
 * query tools but produce an *unchanged query* from the actions rather than a refusal, and the
 * query equality assertion covers those.
 *
 * `null` (no abort) must always mean "not refused"; the three guard reasons must always mean
 * "refused"; everything else is unconstrained here.
 */
const expectedRefusal = (reason: AbortReason | null): boolean | null => {
  switch (reason) {
    case 'target-disabled':
    case 'parent-disabled':
    case 'max-levels-exceeded': {
      return true;
    }
    case null: {
      return false;
    }
    default: {
      return null;
    }
  }
};

describe('createQueryActions conforms to the query tools', () => {
  for (const { name, fixture, ops, options } of sequences.filter(s => actionsSupport(s.ops))) {
    describe(name, () => {
      it('produces the same query', () => {
        const { tools, actions } = runAll(ops, fixture, options);
        expect(stripIDs(actions!.query)).toEqual(stripIDs(tools.query));
      });

      it('never changes the query for a refused operation', () => {
        // Each operation is applied to its own prefix run so a refusal is attributable to it.
        const changedWhileRefused = ops
          .map((_op, i) => {
            const before = runViaActions(ops.slice(0, i), queries[fixture], {
              ...options,
              idGenerator: createIdGenerator(),
            });
            const after = runViaActions(ops.slice(0, i + 1), queries[fixture], {
              ...options,
              idGenerator: createIdGenerator(),
            });
            const unchanged =
              JSON.stringify(stripIDs(after.query)) === JSON.stringify(stripIDs(before.query));
            return after.refused[i] && !unchanged ? i : -1;
          })
          .filter(i => i >= 0);

        expect(changedWhileRefused).toEqual([]);
      });
    });
  }
});

describe('createQueryActions refuses exactly the operations the guards refuse', () => {
  for (const { name, fixture, ops, options } of sequences.filter(s => actionsSupport(s.ops))) {
    it(name, () => {
      const { tools, actions } = runAll(ops, fixture, options);

      // Positions whose reason does not constrain the refusal signal are elided from both sides.
      const expected = tools.aborts.map(expectedRefusal);
      const actual = expected.map((e, i) => (e === null ? null : actions!.refused[i]));

      expect(actual).toEqual(expected);
    });
  }
});

describe('disabled gating is identical across implementations', () => {
  const matrix: RunOptions[] = [
    { respectDisabled: true, queryDisabled: false },
    { respectDisabled: true, queryDisabled: true },
    { respectDisabled: false, queryDisabled: false },
    { respectDisabled: false, queryDisabled: true },
  ];

  // Only the sequences that actually involve disabled nodes, plus a structural control.
  const gatingSequences: Sequence[] = sequences.filter(
    s =>
      s.fixture === 'withDisabled' ||
      s.fixture === 'withoutDisabled' ||
      s.fixture === 'rootDisabled' ||
      s.fixture === 'nested'
  );

  for (const { name, fixture, ops, options } of gatingSequences) {
    for (const guards of matrix) {
      const label = `respectDisabled=${guards.respectDisabled} queryDisabled=${guards.queryDisabled}`;

      it(`${name} — ${label}`, () => {
        const merged = { ...options, ...guards };
        const { manager, tools, actions } = runAll(ops, fixture, merged);

        expect(stripIDs(manager.query)).toEqual(stripIDs(tools.query));
        expect(manager.aborts).toEqual(tools.aborts);
        expect(manager.refused).toEqual(tools.refused);

        // Every gating sequence avoids `insert`, so the actions interpreter always runs.
        expect(stripIDs(actions!.query)).toEqual(stripIDs(tools.query));
      });
    }
  }

  it('blocks every mutation when the whole query is disabled', () => {
    const ops: Op[] = [
      { kind: 'add', ruleOrGroup: { field: 'f9', operator: '=', value: 'v9' }, parent: [] },
      { kind: 'update', prop: 'value', value: 'x', target: [0] },
      { kind: 'update', prop: 'disabled', value: true, target: [0] },
      { kind: 'remove', target: [0] },
      { kind: 'move', from: [0], to: [1] },
      { kind: 'group', from: [0], to: [1] },
    ];
    const { manager, tools, actions } = runAll(ops, 'flat', { queryDisabled: true });

    expect(stripIDs(manager.query)).toEqual(stripIDs(queries.flat));
    expect(stripIDs(tools.query)).toEqual(stripIDs(queries.flat));
    expect(stripIDs(actions!.query)).toEqual(stripIDs(queries.flat));
    expect(manager.refused).toEqual([true, true, true, true, true, true]);
    expect(actions!.refused).toEqual([true, true, true, true, true, true]);
  });
});

describe('path targeting and id targeting agree', () => {
  // Every fixture is built by `pathsAsIDs`, so before any mutation `id === JSON.stringify(path)`
  // and the two targeting styles must be interchangeable. `queryTools.test.ts` already proves
  // this for single operations on static fixtures; these run it on *mutated* queries.
  const byPath: Op[] = [
    { kind: 'add', ruleOrGroup: { field: 'f9', operator: '=', value: 'v9' }, parent: [1, 1] },
    { kind: 'update', prop: 'combinator', value: 'or', target: [1] },
    { kind: 'remove', target: [0] },
  ];
  const byID: Op[] = [
    { kind: 'add', ruleOrGroup: { field: 'f9', operator: '=', value: 'v9' }, parent: '[1,1]' },
    { kind: 'update', prop: 'combinator', value: 'or', target: '[1]' },
    { kind: 'remove', target: '[0]' },
  ];

  it('yields the same result through QueryManager', () => {
    const a = runViaQueryManager(byPath, queries.nested, { idGenerator: createIdGenerator() });
    const b = runViaQueryManager(byID, queries.nested, { idGenerator: createIdGenerator() });
    expect(b.query).toEqual(a.query);
    expect(b.aborts).toEqual(a.aborts);
  });

  it('yields the same result through the query tools', () => {
    const a = runViaQueryTools(byPath, queries.nested, { idGenerator: createIdGenerator() });
    const b = runViaQueryTools(byID, queries.nested, { idGenerator: createIdGenerator() });
    expect(b.query).toEqual(a.query);
    expect(b.aborts).toEqual(a.aborts);
  });

  it('agrees across implementations', () => {
    const manager = runViaQueryManager(byID, queries.nested, { idGenerator: createIdGenerator() });
    const tools = runViaQueryTools(byID, queries.nested, { idGenerator: createIdGenerator() });
    const actions = runViaActions(byID, queries.nested, { idGenerator: createIdGenerator() });
    expect(stripIDs(manager.query)).toEqual(stripIDs(tools.query));
    expect(stripIDs(actions.query)).toEqual(stripIDs(tools.query));
  });
});

describe('unresolvable remove targets', () => {
  /**
   * `removeInPlace` used to gate its `findPath` check behind `!isRuleGroupType(query)`, so an
   * unresolvable *path* was a silent no-op in a plain `RuleGroupType` query while an unresolvable
   * *`id`* — and an unresolvable path in an independent-combinator query — reported
   * `"target-not-found"`. The query was unchanged either way, but the inconsistency leaked into
   * `strict` mode and `onAbort`, and `createQueryActions` refused in every case because it calls
   * `findPath` itself. The check now applies to every query type.
   */
  for (const fixture of ['flat', 'nested', 'ic', 'icNested'] as const) {
    it(`reports target-not-found for an unresolvable path (${fixture})`, () => {
      expect(
        runViaQueryTools([{ kind: 'remove', target: badPath }], queries[fixture]).aborts
      ).toEqual(['target-not-found']);
    });

    it(`reports target-not-found for an unresolvable id (${fixture})`, () => {
      expect(
        runViaQueryTools([{ kind: 'remove', target: badID }], queries[fixture]).aborts
      ).toEqual(['target-not-found']);
    });
  }

  it('refuses the operation in every implementation', () => {
    for (const target of [badPath, badID]) {
      const ops: Op[] = [{ kind: 'remove', target }];
      const manager = runViaQueryManager(ops, queries.flat);
      const tools = runViaQueryTools(ops, queries.flat);
      const actions = runViaActions(ops, queries.flat);

      expect(manager.refused).toEqual([true]);
      expect(tools.refused).toEqual([true]);
      expect(actions.refused).toEqual([true]);

      // And none of them modifies the query.
      expect(stripIDs(manager.query)).toEqual(stripIDs(queries.flat));
      expect(stripIDs(tools.query)).toEqual(stripIDs(queries.flat));
      expect(stripIDs(actions.query)).toEqual(stripIDs(queries.flat));
    }
  });

  it('still reports target-not-found for a combinator slot in an IC query', () => {
    // Independent combinators are bare strings, so `findPath` reports them as missing. They can
    // only be removed alongside the rule they precede or follow.
    expect(runViaQueryTools([{ kind: 'remove', target: [1] }], queries.ic).aborts).toEqual([
      'target-not-found',
    ]);
  });
});
