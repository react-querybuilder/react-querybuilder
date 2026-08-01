import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import { defaultCoalesceMs, defaultMaxHistory } from '@react-querybuilder/core';
import { queriesSlice } from '../../redux/queriesSlice';
import { queryHistorySlice } from '../queryHistorySlice';
import type { QueryHistorySliceState } from '../types';

const { register, unregister, undo, redo, clear } = queryHistorySlice.actions;
const reducer = queryHistorySlice.reducer;

const qbId = 'qb';

const q = (value: string, ruleId = 'r1'): RuleGroupTypeAny =>
  ({
    id: 'g',
    combinator: 'and',
    rules: [{ id: ruleId, field: 'f1', operator: '=', value }],
  }) as RuleGroupTypeAny;

/** Builds a `setQueryState` action with an explicit timestamp. */
const change = (query: RuleGroupTypeAny, timestamp: number, fromHistory = false) => ({
  type: queriesSlice.actions.setQueryState.type,
  payload: { qbId, query },
  meta: { timestamp, fromHistory },
});

const registered = (options?: {
  maxHistory?: number;
  coalesceMs?: number;
  query?: RuleGroupTypeAny;
}) =>
  reducer(
    undefined,
    register({
      qbId,
      query: options?.query,
      maxHistory: options?.maxHistory ?? defaultMaxHistory,
      coalesceMs: options?.coalesceMs ?? defaultCoalesceMs,
    })
  );

const entryOf = (state: QueryHistorySliceState) => state[qbId];

describe('registration', () => {
  it('ignores changes for unregistered query builders', () => {
    const state = reducer(undefined, change(q('a'), 1000));
    expect(state).toEqual({});
  });

  it('seeds present from the current query on register', () => {
    const query = q('a');
    expect(entryOf(registered({ query })).present).toBe(query);
  });

  it('starts with empty stacks', () => {
    const entry = entryOf(registered());
    expect(entry.past).toEqual([]);
    expect(entry.future).toEqual([]);
  });

  it('updates options when registering an existing entry', () => {
    let state = registered({ maxHistory: 10, coalesceMs: 100 });
    state = reducer(state, change(q('a'), 1000));
    state = reducer(state, register({ qbId, maxHistory: 5, coalesceMs: 50 }));
    expect(entryOf(state).maxHistory).toBe(5);
    expect(entryOf(state).coalesceMs).toBe(50);
    // Existing history is retained
    expect(entryOf(state).present).toBeDefined();
  });

  it('removes the entry on unregister', () => {
    expect(reducer(registered(), unregister({ qbId }))).toEqual({});
  });

  it('removes the entry when the query is torn down', () => {
    const state = reducer(registered(), queriesSlice.actions.unsetQueryState({ qbId }));
    expect(state).toEqual({});
  });
});

describe('recording', () => {
  it('swallows the first change as the seed when registered without a query', () => {
    const first = q('a');
    const state = reducer(registered(), change(first, 1000));
    expect(entryOf(state).present).toBe(first);
    expect(entryOf(state).past).toEqual([]);
  });

  it('records a change as a history entry', () => {
    const first = q('a');
    const second = q('b');
    let state = registered({ query: first });
    state = reducer(state, change(second, 1000));
    expect(entryOf(state).past).toEqual([first]);
    expect(entryOf(state).present).toBe(second);
  });

  it('ignores no-op changes that return the same query object', () => {
    const query = q('a');
    let state = registered({ query });
    state = reducer(state, change(query, 1000));
    expect(entryOf(state).past).toEqual([]);
  });

  it('ignores changes that alter nothing observable', () => {
    const first = q('a');
    let state = registered({ query: first });
    state = reducer(state, change(q('a'), 1000));
    expect(entryOf(state).past).toEqual([]);
    // ...but tracks the new reference
    expect(entryOf(state).present).not.toBe(first);
  });

  it('ignores changes marked as originating from history', () => {
    let state = registered({ query: q('a') });
    state = reducer(state, change(q('b'), 1000, true));
    expect(entryOf(state).past).toEqual([]);
  });

  it('clears the redo stack when a new change is recorded', () => {
    let state = registered({ query: q('a') });
    state = reducer(state, change(q('b'), 1000));
    state = reducer(state, undo({ qbId }));
    expect(entryOf(state).future).toHaveLength(1);
    state = reducer(state, change(q('c'), 2000));
    expect(entryOf(state).future).toEqual([]);
  });

  it('trims the past stack to maxHistory', () => {
    let state = registered({ query: q('0'), maxHistory: 3, coalesceMs: 0 });
    for (let i = 1; i <= 6; i++) {
      state = reducer(state, change(q(String(i)), i * 1000));
    }
    expect(entryOf(state).past).toHaveLength(3);
    // The oldest entries were discarded
    expect(entryOf(state).past.map(p => (p.rules[0] as { value: string }).value)).toEqual([
      '3',
      '4',
      '5',
    ]);
  });
});

describe('coalescing', () => {
  it('merges consecutive same-signature changes within the window', () => {
    let state = registered({ query: q(''), coalesceMs: 500 });
    state = reducer(state, change(q('h'), 1000));
    state = reducer(state, change(q('he'), 1100));
    state = reducer(state, change(q('hel'), 1200));
    expect(entryOf(state).past).toHaveLength(1);
    // Undo returns to the value from before the burst started
    expect((entryOf(state).past[0].rules[0] as { value: string }).value).toBe('');
  });

  it('starts a new entry once the window elapses', () => {
    let state = registered({ query: q(''), coalesceMs: 500 });
    state = reducer(state, change(q('h'), 1000));
    state = reducer(state, change(q('he'), 2000));
    expect(entryOf(state).past).toHaveLength(2);
  });

  it('does not coalesce changes to different properties', () => {
    let state = registered({ query: q('a'), coalesceMs: 500 });
    state = reducer(state, change(q('b'), 1000));
    const differentProp = {
      id: 'g',
      combinator: 'or',
      rules: [{ id: 'r1', field: 'f1', operator: '=', value: 'b' }],
    } as RuleGroupTypeAny;
    state = reducer(state, change(differentProp, 1050));
    expect(entryOf(state).past).toHaveLength(2);
  });

  it('never coalesces structural changes', () => {
    const base = q('a');
    let state = registered({ query: base, coalesceMs: 500 });
    const twoRules = {
      id: 'g',
      combinator: 'and',
      rules: [base.rules[0], { id: 'r2', field: 'f1', operator: '=', value: 'x' }],
    } as RuleGroupTypeAny;
    const threeRules = {
      id: 'g',
      combinator: 'and',
      rules: [...twoRules.rules, { id: 'r3', field: 'f1', operator: '=', value: 'y' }],
    } as RuleGroupTypeAny;
    state = reducer(state, change(twoRules, 1000));
    state = reducer(state, change(threeRules, 1010));
    expect(entryOf(state).past).toHaveLength(2);
  });

  it('records every change when coalesceMs is 0', () => {
    let state = registered({ query: q(''), coalesceMs: 0 });
    state = reducer(state, change(q('h'), 1000));
    state = reducer(state, change(q('he'), 1000));
    expect(entryOf(state).past).toHaveLength(2);
  });

  // Regression: reading `present` from the Immer draft rather than the original made every
  // change to a query with more than one rule look structural, silently disabling coalescing.
  // A single-rule query masks this, because the one differing child is still identifiable.
  describe('with sibling rules present', () => {
    const sibling = { id: 'r2', field: 'f1', operator: '=', value: 'static' };
    const multi = (value: string): RuleGroupTypeAny =>
      ({
        id: 'g',
        combinator: 'and',
        rules: [{ id: 'r1', field: 'f1', operator: '=', value }, sibling],
      }) as RuleGroupTypeAny;

    it('coalesces a typing burst', () => {
      let state = registered({ query: multi(''), coalesceMs: 500 });
      state = reducer(state, change(multi('h'), 1000));
      state = reducer(state, change(multi('he'), 1100));
      state = reducer(state, change(multi('hel'), 1200));
      expect(entryOf(state).lastSig).toBe('r1:value');
      expect(entryOf(state).past).toHaveLength(1);
    });

    it('stores queries by reference rather than as drafts', () => {
      const first = multi('a');
      const second = multi('b');
      let state = registered({ query: first });
      state = reducer(state, change(second, 1000));
      expect(entryOf(state).present).toBe(second);
      expect(entryOf(state).past[0]).toBe(first);
    });

    it('short-circuits a genuine no-op change', () => {
      const query = multi('a');
      let state = registered({ query });
      state = reducer(state, change(query, 1000));
      expect(entryOf(state).past).toEqual([]);
      expect(entryOf(state).lastSig).toBeUndefined();
    });

    it('restores queries by reference through undo and redo', () => {
      const first = multi('a');
      const second = multi('b');
      let state = registered({ query: first, coalesceMs: 0 });
      state = reducer(state, change(second, 1000));

      state = reducer(state, undo({ qbId }));
      expect(entryOf(state).present).toBe(first);
      expect(entryOf(state).future[0]).toBe(second);

      state = reducer(state, redo({ qbId }));
      expect(entryOf(state).present).toBe(second);
      expect(entryOf(state).past[0]).toBe(first);
    });
  });
});

describe('undo/redo/clear', () => {
  const setup = () => {
    let state = registered({ query: q('a'), coalesceMs: 0 });
    state = reducer(state, change(q('b'), 1000));
    state = reducer(state, change(q('c'), 2000));
    return state;
  };

  it('moves the present onto the future when undoing', () => {
    let state = setup();
    const before = entryOf(state).present;
    state = reducer(state, undo({ qbId }));
    expect(entryOf(state).future[0]).toBe(before);
    expect((entryOf(state).present!.rules[0] as { value: string }).value).toBe('b');
    expect(entryOf(state).past).toHaveLength(1);
  });

  it('restores the undone query when redoing', () => {
    let state = setup();
    state = reducer(state, undo({ qbId }));
    state = reducer(state, redo({ qbId }));
    expect((entryOf(state).present!.rules[0] as { value: string }).value).toBe('c');
    expect(entryOf(state).future).toEqual([]);
    expect(entryOf(state).past).toHaveLength(2);
  });

  it('walks all the way back and forward', () => {
    let state = setup();
    state = reducer(state, undo({ qbId }));
    state = reducer(state, undo({ qbId }));
    expect((entryOf(state).present!.rules[0] as { value: string }).value).toBe('a');
    expect(entryOf(state).past).toEqual([]);
    state = reducer(state, redo({ qbId }));
    state = reducer(state, redo({ qbId }));
    expect((entryOf(state).present!.rules[0] as { value: string }).value).toBe('c');
  });

  it('resets the coalescing signature after undo', () => {
    let state = setup();
    state = reducer(state, undo({ qbId }));
    expect(entryOf(state).lastSig).toBeUndefined();
    // A subsequent edit must not be absorbed into the restored entry
    state = reducer(state, change(q('z'), 2001));
    expect(entryOf(state).past).toHaveLength(2);
  });

  it('resets the coalescing signature after redo', () => {
    let state = setup();
    state = reducer(state, undo({ qbId }));
    state = reducer(state, redo({ qbId }));
    expect(entryOf(state).lastSig).toBeUndefined();
  });

  it('is a no-op to undo with an empty past', () => {
    const state = registered({ query: q('a') });
    expect(reducer(state, undo({ qbId }))).toEqual(state);
  });

  it('is a no-op to redo with an empty future', () => {
    const state = registered({ query: q('a') });
    expect(reducer(state, redo({ qbId }))).toEqual(state);
  });

  it('empties both stacks without changing the present when clearing', () => {
    let state = setup();
    const present = entryOf(state).present;
    state = reducer(state, undo({ qbId }));
    state = reducer(state, clear({ qbId }));
    expect(entryOf(state).past).toEqual([]);
    expect(entryOf(state).future).toEqual([]);
    expect(entryOf(state).lastSig).toBeUndefined();
    // `clear` must not change which query is current
    expect(entryOf(state).present).not.toBe(present);
    expect((entryOf(state).present!.rules[0] as { value: string }).value).toBe('b');
  });

  it('is a no-op for unregistered query builders', () => {
    const empty = {};
    expect(reducer(empty, undo({ qbId }))).toEqual(empty);
    expect(reducer(empty, redo({ qbId }))).toEqual(empty);
    expect(reducer(empty, clear({ qbId }))).toEqual(empty);
  });
});

describe('multiple query builders', () => {
  it('keeps histories independent', () => {
    let state = reducer(
      undefined,
      register({ qbId: 'a', query: q('a1'), maxHistory: 10, coalesceMs: 0 })
    );
    state = reducer(state, register({ qbId: 'b', query: q('b1'), maxHistory: 10, coalesceMs: 0 }));
    state = reducer(state, {
      type: queriesSlice.actions.setQueryState.type,
      payload: { qbId: 'a', query: q('a2') },
      meta: { timestamp: 1000, fromHistory: false },
    });

    expect(state['a'].past).toHaveLength(1);
    expect(state['b'].past).toHaveLength(0);
  });
});
