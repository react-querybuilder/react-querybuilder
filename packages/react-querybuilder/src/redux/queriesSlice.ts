import type { PayloadAction, Slice } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { RuleGroupTypeAny } from '../types';

export type QueriesSliceState = Record<string, RuleGroupTypeAny>;

export interface SetQueryStateParams {
  qbId: string;
  query: RuleGroupTypeAny;
}

export const initialState: QueriesSliceState = {};

export const queriesSlice: Slice<
  QueriesSliceState,
  {
    setQueryState: (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      state: any,
      {
        payload: { qbId, query },
      }: PayloadAction<SetQueryStateParams>
    ) => void;
  },
  string,
  string,
  {
    getQuerySelectorById: (state: QueriesSliceState, qbId: string) => RuleGroupTypeAny;
  }
> = createSlice({
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
