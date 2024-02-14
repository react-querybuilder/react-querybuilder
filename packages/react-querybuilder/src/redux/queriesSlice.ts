import type { PayloadAction, Slice } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { RuleGroupTypeAny } from '../types';

export type QueriesSliceState = Record<string, RuleGroupTypeAny>;

export interface SetQueryStateParams {
  qbId: string;
  query: RuleGroupTypeAny;
}

export const initialState: QueriesSliceState = {};

export const queriesSlice = createSlice({
  name: 'queries',
  initialState,
  reducers: {
    setQueryState: (state, { payload: { qbId, query } }: PayloadAction<SetQueryStateParams>) => {
      state[qbId] = query;
    },
  },
  selectors: {
    getQuerySelectorById: (state: QueriesSliceState, qbId: string) => state[qbId],
  },
}) satisfies Slice;
