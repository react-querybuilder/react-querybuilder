import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import type { PayloadAction, Slice } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export type QueriesSliceState = Record<string, RuleGroupTypeAny>;

export interface SetQueryStateParams {
  qbId: string;
  query: RuleGroupTypeAny;
}

const initialState: QueriesSliceState = {};

export const queriesSlice: Slice<
  QueriesSliceState,
  {
    setQueryState: (
      state: QueriesSliceState,
      {
        payload: { qbId, query },
      }: PayloadAction<SetQueryStateParams>
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
  },
  selectors: {
    getQuerySelectorById: (state, qbId) => state[qbId],
  },
});
