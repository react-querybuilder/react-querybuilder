import type { CombinedSliceReducer } from '@reduxjs/toolkit';
import { combineSlices } from '@reduxjs/toolkit';
import type { QueriesSliceState } from './queriesSlice';
import { queriesSlice } from './queriesSlice';
import type { WarningsSliceState } from './warningsSlice';
import { warningsSlice } from './warningsSlice';

export interface LazyLoadedSlices {}

export const rootReducer: CombinedSliceReducer<{
  queries: QueriesSliceState;
  warnings: WarningsSliceState;
}> = combineSlices(queriesSlice, warningsSlice).withLazyLoadedSlices<LazyLoadedSlices>();
