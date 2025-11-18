import type { PayloadAction, Slice } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { RulesEngineAny } from '../types';
import type { RulesEngineSliceState } from './types';

export interface SetRulesEngineStateParams {
  reId: string;
  rulesEngine: RulesEngineAny;
}

const initialState: RulesEngineSliceState = {};

const name = 'rulesEngines';

export const rulesEngineSlice: Slice<
  RulesEngineSliceState,
  {
    setRulesEngineState: (
      state: RulesEngineSliceState,
      action: PayloadAction<SetRulesEngineStateParams>
    ) => void;
  },
  typeof name,
  typeof name,
  {
    getRulesEngineSelectorById: (state: RulesEngineSliceState, reId: string) => RulesEngineAny;
  }
> = createSlice({
  name,
  initialState,
  reducers: {
    setRulesEngineState: (state, { payload: { reId, rulesEngine } }) => {
      state[reId] = rulesEngine;
    },
  },
  selectors: {
    getRulesEngineSelectorById: (state, reId) => state[reId],
  },
});
