/**
 * History conformance: `queryHistorySlice` vs. `QueryManager`.
 *
 * `<QueryBuilder>` does not use `QueryManager`. Query state lives in `queriesSlice` and history
 * is recorded by `queryHistorySlice`, whose semantics `QueryManager.#record` says it "mirrors."
 * `QueryManager` is the designated substrate for non-React ports, so two implementations of undo
 * coalescing that nobody compares will drift, and a port would be the one to discover it. This
 * file pins them together.
 *
 * The harness drives one operation sequence through both: each mutation is applied to a
 * `QueryManager`, and the query it produces is dispatched into the slice as a `setQueryState`
 * action carrying the same timestamp. Feeding the slice the manager's queries is deliberate —
 * Phase 2 of the conformance work already proved the two mutation layers agree, so what remains
 * under test here is purely the *recording* logic: when an entry is pushed, when a change
 * coalesces into the previous one, and how `past`/`future` respond to undo/redo/clear.
 *
 * Both implementations are driven by an injected clock rather than `Date.now()`. Fake timers
 * would not do: `queriesSlice`'s `prepare` callback assigns the timestamp outside the reducer,
 * so the two clock reads do not happen at comparable moments.
 *
 * `.ts`, no JSX. Lives in the RQB package so that `bun test:bun` — which globs `packages/core`
 * wholesale — never sees it.
 */

import type { Path, RuleGroupTypeAny, RuleType } from '@react-querybuilder/core';
import { defaultCoalesceMs, defaultMaxHistory, QueryManager } from '@react-querybuilder/core';
import type { Op } from '../../../../../utils/testing/queryFixtures';
import {
  applyOpToQueryManager,
  createIdGenerator,
  queries,
} from '../../../../../utils/testing/queryFixtures';
import { queriesSlice } from '../../redux/queriesSlice';
import { queryHistorySlice } from '../queryHistorySlice';
import type { QueryHistoryEntry, QueryHistorySliceState } from '../types';

const qbId = 'qb';
const reducer = queryHistorySlice.reducer;

// #region Harness

/**
 * A history step. Mutations advance the clock by `after` milliseconds *before* being applied,
 * which is what makes coalescing windows expressible: `after` below `coalesceMs` means "typed
 * in the same burst".
 */
type Step =
  | { kind: 'op'; op: Op; after?: number }
  /**
   * Replaces the query wholesale, the way a controlled query builder does when its `query` prop
   * changes. This is the only route to a change that is observably nothing but not
   * reference-equal — no mutation produces one, because Immer returns the original object when
   * a producer changes nothing.
   */
  | { kind: 'setQuery'; query: (current: RuleGroupTypeAny) => RuleGroupTypeAny; after?: number }
  | { kind: 'undo' }
  | { kind: 'redo' }
  | { kind: 'clear' };

interface HistoryOptions {
  maxHistory?: number;
  coalesceMs?: number;
  /** Register the slice without a seed query, exercising the seed branch. */
  seedless?: boolean;
}

interface HistorySnapshot {
  past: RuleGroupTypeAny[];
  present: RuleGroupTypeAny | undefined;
  future: RuleGroupTypeAny[];
}

/**
 * Runs `steps` through both implementations in lockstep, returning a snapshot of each after
 * every step so that a divergence is attributable to the step that caused it.
 */
const run = (
  steps: readonly Step[],
  startQuery: RuleGroupTypeAny,
  options: HistoryOptions = {}
): { manager: HistorySnapshot[]; slice: HistorySnapshot[] } => {
  const maxHistory = options.maxHistory ?? defaultMaxHistory;
  const coalesceMs = options.coalesceMs ?? defaultCoalesceMs;

  let clock = 1000;
  const now = () => clock;

  const qm = new QueryManager(structuredClone(startQuery), {
    idGenerator: createIdGenerator(),
    history: { maxHistory, coalesceMs },
    now,
  });

  let state: QueryHistorySliceState = reducer(
    undefined,
    queryHistorySlice.actions.register({
      qbId,
      // The manager always has a query; registering the slice with the same one is the
      // equivalent starting position. `seedless` opts into the asymmetric case instead.
      query: options.seedless ? undefined : qm.getQuery(),
      maxHistory,
      coalesceMs,
    })
  );

  const dispatch = (action: Parameters<typeof reducer>[1]) => {
    state = reducer(state, action);
  };

  const managerSnapshots: HistorySnapshot[] = [];
  const sliceSnapshots: HistorySnapshot[] = [];

  for (const step of steps) {
    switch (step.kind) {
      case 'op': {
        clock += step.after ?? 0;
        applyOpToQueryManager(qm, step.op);
        // Faithful to the React path, which dispatches whatever the action produced — including
        // an unchanged query, which the slice must recognize and ignore.
        dispatch(
          queriesSlice.actions.setQueryState({ qbId, query: qm.getQuery() }, { timestamp: clock })
        );
        break;
      }
      case 'setQuery': {
        clock += step.after ?? 0;
        qm.setQuery(step.query(qm.getQuery()));
        dispatch(
          queriesSlice.actions.setQueryState({ qbId, query: qm.getQuery() }, { timestamp: clock })
        );
        break;
      }
      case 'undo': {
        qm.undo();
        dispatch(queryHistorySlice.actions.undo({ qbId }));
        // The React path re-dispatches the restored query so that `onQueryChange` fires; the
        // `fromHistory` tag keeps the slice from recording it as a new edit.
        dispatch(
          queriesSlice.actions.setQueryState(
            { qbId, query: qm.getQuery() },
            { timestamp: clock, fromHistory: true }
          )
        );
        break;
      }
      case 'redo': {
        qm.redo();
        dispatch(queryHistorySlice.actions.redo({ qbId }));
        dispatch(
          queriesSlice.actions.setQueryState(
            { qbId, query: qm.getQuery() },
            { timestamp: clock, fromHistory: true }
          )
        );
        break;
      }
      case 'clear': {
        qm.clearHistory();
        dispatch(queryHistorySlice.actions.clear({ qbId }));
        break;
      }
    }

    const { past, future } = qm.getHistory();
    managerSnapshots.push({ past, present: qm.getQuery(), future });

    const entry: QueryHistoryEntry = state[qbId];
    sliceSnapshots.push({
      past: [...entry.past],
      present: entry.present,
      future: [...entry.future],
    });
  }

  return { manager: managerSnapshots, slice: sliceSnapshots };
};

/**
 * Asserts that both implementations agree at every step.
 *
 * Compared by value rather than by reference: the two implementations hold *different* query
 * objects (the slice holds the manager's, but `QueryManager` freezes and structurally shares its
 * own), so reference equality is not the property under test. What matters is that the same
 * queries are on the same stacks in the same order.
 */
const expectConformance = (
  steps: readonly Step[],
  query: RuleGroupTypeAny,
  options?: HistoryOptions
) => {
  const { manager, slice } = run(steps, query, options);
  expect(slice.map(s => ({ past: s.past, future: s.future }))).toEqual(
    manager.map(s => ({ past: s.past, future: s.future }))
  );
  // `present` is the slice's private mirror of the current query, so it must track the manager's.
  expect(slice.map(s => s.present)).toEqual(manager.map(s => s.present));
};

// #endregion

// #region Step shorthands

const rule = (value: string): RuleType => ({ field: 'f1', operator: '=', value });

/**
 * A three-rule query carrying no properties beyond the essentials.
 *
 * The shared fixtures set `path` (an array) on every node so that `id` can encode the node's
 * initial path, which is what makes stale-path-vs-`id` probes expressible. `signatureOf`
 * compares properties with `Object.is`, so any copied node of one of those fixtures has a fresh
 * `path` array and never reads as observably identical — the opposite of what the replacement
 * case below needs.
 */
const plainQuery: RuleGroupTypeAny = {
  id: 'g',
  combinator: 'and',
  rules: [
    { id: 'r1', field: 'f1', operator: '=', value: 'v1' },
    { id: 'r2', field: 'f1', operator: '=', value: 'v2' },
  ],
} as RuleGroupTypeAny;

/**
 * Replaces rule `[0]` with a copy of itself, leaving every other node's identity intact. The
 * result is observably identical to its input but not reference-equal, which is the only way a
 * query reaches `unchangedSignature`: replacing more than one node is structural by definition,
 * and no mutation produces one at all, since Immer returns the original object when a producer
 * changes nothing. In practice this is what a controlled query builder does when it rebuilds
 * part of the query it was handed.
 */
const replaceRule0 = (current: RuleGroupTypeAny): RuleGroupTypeAny =>
  ({
    ...current,
    rules: [{ ...(current.rules[0] as RuleType) }, ...current.rules.slice(1)],
  }) as RuleGroupTypeAny;

/** Update the rule at `target`'s value — the archetypal coalescing candidate (typing). */
const type_ = (value: string, after = 0, target: Path = [0]): Step => ({
  kind: 'op',
  op: { kind: 'update', prop: 'value', value, target },
  after,
});

const addRule = (value: string, after = 0, parent: Path = []): Step => ({
  kind: 'op',
  op: { kind: 'add', ruleOrGroup: rule(value), parent },
  after,
});

const removeAt = (target: Path, after = 0): Step => ({
  kind: 'op',
  op: { kind: 'remove', target },
  after,
});

const undo: Step = { kind: 'undo' };
const redo: Step = { kind: 'redo' };
const clear: Step = { kind: 'clear' };

// #endregion

describe('recording', () => {
  it('records a single change identically', () => {
    expectConformance([type_('a')], queries.flat);
  });

  it('records changes of different kinds identically', () => {
    expectConformance(
      [type_('a'), addRule('new', 600), removeAt([1], 600), type_('b', 600, [0])],
      queries.flat
    );
  });

  it('agrees on an operation that changes nothing', () => {
    // `update` to the value it already has returns the same query object, so neither
    // implementation should record anything.
    expectConformance([type_('v1'), type_('v1', 600)], queries.flat);
  });

  it.each(Object.values(queries))('agrees across every fixture', query => {
    expectConformance([addRule('a'), addRule('b', 600), undo, redo], query);
  });
});

describe('coalescing', () => {
  it('coalesces changes within the window into one entry', () => {
    expectConformance([type_('a'), type_('ab', 10), type_('abc', 10)], queries.flat);
  });

  it('does not coalesce changes outside the window', () => {
    expectConformance([type_('a'), type_('ab', 600), type_('abc', 600)], queries.flat);
  });

  it('does not coalesce across a change of target', () => {
    expectConformance([type_('a', 0, [0]), type_('b', 10, [1]), type_('c', 10, [0])], queries.flat);
  });

  it('does not coalesce structural changes', () => {
    // Adding and removing rules changes the shape of the query, which must never collapse into
    // a single undo step no matter how quickly it happens.
    expectConformance([addRule('a'), addRule('b', 10), removeAt([1], 10)], queries.flat);
  });

  it('does not coalesce after an undo', () => {
    expectConformance([type_('a'), type_('ab', 10), undo, type_('ac', 10)], queries.flat);
  });

  it('does not coalesce after a redo', () => {
    expectConformance([type_('a'), undo, redo, type_('ab', 10)], queries.flat);
  });

  it('does not coalesce after clearing', () => {
    expectConformance([type_('a'), clear, type_('ab', 10)], queries.flat);
  });

  it('agrees at the exact window boundary', () => {
    // `Δt < coalesceMs`, so a change exactly `coalesceMs` later must not coalesce.
    expectConformance([type_('a'), type_('ab', defaultCoalesceMs)], queries.flat, {
      coalesceMs: defaultCoalesceMs,
    });
    expectConformance([type_('a'), type_('ab', defaultCoalesceMs - 1)], queries.flat, {
      coalesceMs: defaultCoalesceMs,
    });
  });

  it('agrees when a no-op edit separates two coalescing candidates', () => {
    // An edit that returns the same query object must not affect whether the changes on either
    // side of it coalesce.
    expectConformance([type_('a'), type_('a', 10), type_('ab', 10)], queries.flat);
  });

  it('agrees when an observably-identical replacement precedes an edit to another rule', () => {
    // The interaction the conformance plan flagged as divergence #3, which turns out not to be
    // one — but only just.
    //
    // A replacement that is observably identical is not recorded by either implementation. What
    // matters is what each then treats as the baseline for the *next* change. `QueryManager`
    // returns from `#record` without touching `#lastSig`, but `#commit` has already advanced
    // `#query`, so the next signature is computed against the replacement. The slice advances
    // `entry.present` for exactly the same reason.
    //
    // Keeping the older query instead would look equally defensible and is wrong: here the
    // replacement swaps rule `[0]` and the following edit touches rule `[1]`, so against the
    // older query *two* children differ and the change reads as structural, forbidding
    // coalescing that `QueryManager` allows. Replacing a single node is the only way to get an
    // unchanged signature out of a multi-rule query — two changed children are structural by
    // definition — so this is the narrowest case that tells the two baselines apart.
    expectConformance(
      [
        type_('a', 0, [1]),
        { kind: 'setQuery', query: replaceRule0, after: 10 },
        type_('ab', 10, [1]),
      ],
      plainQuery
    );
  });
});

describe('undo and redo', () => {
  it('agrees on stack contents through an undo/redo cycle', () => {
    expectConformance(
      [addRule('a'), addRule('b', 600), addRule('c', 600), undo, undo, redo, undo, redo, redo],
      queries.flat
    );
  });

  it('agrees when undoing more times than there is history', () => {
    expectConformance([addRule('a'), undo, undo, undo], queries.flat);
  });

  it('agrees when redoing more times than there is future', () => {
    expectConformance([addRule('a'), undo, redo, redo, redo], queries.flat);
  });

  it('agrees that a new change discards the redo stack', () => {
    expectConformance([addRule('a'), addRule('b', 600), undo, addRule('c', 600)], queries.flat);
  });

  it('agrees on clear', () => {
    expectConformance(
      [addRule('a'), addRule('b', 600), undo, clear, addRule('c', 600)],
      queries.flat
    );
  });
});

describe('maxHistory', () => {
  it('drops the oldest entry past the limit', () => {
    expectConformance(
      [addRule('a'), addRule('b', 600), addRule('c', 600), addRule('d', 600)],
      queries.flat,
      { maxHistory: 2 }
    );
  });

  it('agrees when the limit is reached and then undone back to empty', () => {
    expectConformance(
      [addRule('a'), addRule('b', 600), addRule('c', 600), undo, undo, undo],
      queries.flat,
      { maxHistory: 2 }
    );
  });
});

describe('known divergences', () => {
  /**
   * Divergence #1 from the conformance plan, deliberately *not* fixed.
   *
   * `QueryManager` is always constructed with a query, so its first mutation always has a
   * previous query to push onto `past`. The slice's `register` accepts none, which happens when
   * a `useQueryBuilderHistory` consumer mounts before the query builder's initial
   * `setQueryState` reaches the store. In that state there is nothing to push, so the first
   * change is swallowed as the seed.
   *
   * Removing the branch would not make the first change undoable — `past` cannot hold
   * `undefined` — it would only record `lastSig`/`lastAt` against an entry that does not exist,
   * letting the *next* change coalesce into nothing. The branch is therefore correct, and the
   * asymmetry is a consequence of the slice's registration being decoupled from the query
   * builder's mount rather than a difference in recording semantics.
   */
  it('swallows the first change when the slice is registered without a query', () => {
    const { manager, slice } = run([addRule('a'), addRule('b', 600)], queries.flat, {
      seedless: true,
    });

    // The manager records both changes...
    expect(manager.map(s => s.past.length)).toEqual([1, 2]);
    // ...the slice treats the first as its seed and records only the second.
    expect(slice.map(s => s.past.length)).toEqual([0, 1]);
    // From the second change on, they agree on what is undoable.
    expect(slice.at(-1)!.past).toEqual(manager.at(-1)!.past.slice(-1));
  });

  /**
   * Divergence #4: `QueryManager.batch` collapses N mutations into one undo step. Redux has no
   * batching primitive, so `<QueryBuilder>` cannot express this at all. Documented rather than
   * reconciled — a port using `batch` produces coarser undo steps than the React component,
   * which is the point of the API.
   */
  it('has no slice equivalent for batched mutations', () => {
    const qm = new QueryManager(structuredClone(queries.flat), {
      idGenerator: createIdGenerator(),
      history: true,
      now: () => 1000,
    });

    qm.batch(() => {
      qm.add(rule('a'), []);
      qm.add(rule('b'), []);
      qm.add(rule('c'), []);
    });

    expect(qm.getHistory().past).toHaveLength(1);
  });
});
