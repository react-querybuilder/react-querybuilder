import type { PayloadAction } from '@reduxjs/toolkit';
import RTK from '@reduxjs/toolkit';
import type { RuleGroupTypeAny } from '../types';

export type QueriesSliceState = Record<string, RuleGroupTypeAny>;

export interface SetQueryStateParams {
  qbId: string;
  query: RuleGroupTypeAny;
}

export const getQueriesSliceState = (
  state: QueriesSliceState,
  qbId: string
): RuleGroupTypeAny | undefined => state[qbId];

export const initialState: QueriesSliceState = {};

export const {
  reducer: queriesSliceReducer,
  actions: { removeQueryState, setQueryState },
} = RTK.createSlice({
  name: 'queries',
  initialState,
  reducers: {
    setQueryState(state, { payload: { qbId, query } }: PayloadAction<SetQueryStateParams>) {
      state[qbId] = query;
    },
    removeQueryState(state, { payload: qbId }: PayloadAction<string>) {
      delete state[qbId];
    },
  },
});
