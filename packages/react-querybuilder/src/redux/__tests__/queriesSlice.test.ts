import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import { queriesSlice } from '../queriesSlice';
import type { QueriesSliceState } from '../queriesSlice';

const { setQueryState, unsetQueryState } = queriesSlice.actions;
const reducer = queriesSlice.reducer;

const qbId = 'qb';
const query = { combinator: 'and', rules: [] } as RuleGroupTypeAny;

describe('setQueryState', () => {
  it('stores a query by identifier', () => {
    const state = reducer(undefined, setQueryState({ qbId, query }));
    expect(state[qbId]).toBe(query);
  });

  it('replaces the query for an existing identifier', () => {
    const next = { combinator: 'or', rules: [] } as RuleGroupTypeAny;
    let state = reducer(undefined, setQueryState({ qbId, query }));
    state = reducer(state, setQueryState({ qbId, query: next }));
    expect(state[qbId]).toBe(next);
  });

  it('keeps queries for different identifiers separate', () => {
    let state = reducer(undefined, setQueryState({ qbId, query }));
    state = reducer(state, setQueryState({ qbId: 'other', query }));
    expect(Object.keys(state)).toEqual([qbId, 'other']);
  });

  it('timestamps the action from the clock by default', () => {
    const before = Date.now();
    const { meta } = setQueryState({ qbId, query });
    expect(meta.timestamp).toBeGreaterThanOrEqual(before);
    expect(meta.timestamp).toBeLessThanOrEqual(Date.now());
  });

  it('accepts an explicit timestamp', () => {
    expect(setQueryState({ qbId, query }, { timestamp: 1234 }).meta.timestamp).toBe(1234);
  });

  it('defaults fromHistory to false', () => {
    expect(setQueryState({ qbId, query }).meta.fromHistory).toBe(false);
    expect(setQueryState({ qbId, query }, {}).meta.fromHistory).toBe(false);
  });

  it('marks actions originating from history', () => {
    expect(setQueryState({ qbId, query }, { fromHistory: true }).meta.fromHistory).toBe(true);
  });
});

describe('unsetQueryState', () => {
  it('removes the query', () => {
    const state: QueriesSliceState = reducer(undefined, setQueryState({ qbId, query }));
    expect(reducer(state, unsetQueryState({ qbId }))).toEqual({});
  });

  it('ignores identifiers with no stored query', () => {
    expect(reducer(undefined, unsetQueryState({ qbId }))).toEqual({});
  });
});

describe('getQuerySelectorById', () => {
  it('returns the query for an identifier', () => {
    const state = reducer(undefined, setQueryState({ qbId, query }));
    expect(queriesSlice.selectors.getQuerySelectorById({ queries: state }, qbId)).toBe(query);
  });
});
