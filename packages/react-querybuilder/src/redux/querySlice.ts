import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { RuleGroupTypeAny } from '../types';

type QuerySliceState = Record<string, RuleGroupTypeAny>;

interface SetReduxQueryParams {
  qbId: string;
  query: RuleGroupTypeAny;
}

export const getQueryState = (state: QuerySliceState, qbId: string): RuleGroupTypeAny | undefined =>
  state[qbId];

const initialState: QuerySliceState = {};

export const {
  reducer: querySliceReducer,
  actions: { removeQueryState, setQueryState },
} = createSlice({
  name: 'query',
  initialState,
  reducers: {
    setQueryState(state, { payload: { qbId, query } }: PayloadAction<SetReduxQueryParams>) {
      state[qbId] = query;
    },
    removeQueryState(state, { payload }: PayloadAction<string>) {
      delete state[payload];
    },
  },
});
