import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import type { PayloadAction, Slice } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export type QueriesSliceState = Record<string, RuleGroupTypeAny>;

export interface SetQueryStateParams {
  qbId: string;
  query: RuleGroupTypeAny;
}

export interface UnsetQueryStateParams {
  qbId: string;
}

const initialState: QueriesSliceState = {};

export const queriesSlice: Slice<
  QueriesSliceState,
  {
    setQueryState: (
      state: QueriesSliceState,
      { payload: { qbId, query } }: PayloadAction<SetQueryStateParams>
    ) => void;
    unsetQueryState: (
      state: QueriesSliceState,
      { payload: { qbId } }: PayloadAction<UnsetQueryStateParams>
    ) => void;
  },
  'queries',
  'queries',
  { getQuerySelectorById: (state: QueriesSliceState, qbId: string) => RuleGroupTypeAny }
> = createSlice({
  name: 'queries',
  initialState,
  reducers: {
    setQueryState: (state, { payload: { qbId, query } }) => {
      state[qbId] = query;
    },
    /**
     * Removes a query from the store. Dispatched when the last `QueryBuilder` using a given
     * `qbId` unmounts, unless the `preserveQueryStateOnUnmount` prop is `true`.
     */
    unsetQueryState: (state, { payload: { qbId } }) => {
      delete state[qbId];
    },
  },
  selectors: {
    getQuerySelectorById: (state, qbId) => state[qbId],
  },
});
