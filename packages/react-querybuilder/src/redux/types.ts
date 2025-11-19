import type {
  EnhancedStore,
  Slice,
  StoreEnhancer,
  ThunkDispatch,
  Tuple,
  UnknownAction,
} from '@reduxjs/toolkit';
import type { QueriesSliceState } from './queriesSlice';
import type { WarningsSliceState } from './warningsSlice';

export interface RqbState {
  queries: QueriesSliceState;
  warnings: WarningsSliceState;
}

export type RqbStore = EnhancedStore<
  RqbState,
  UnknownAction,
  Tuple<
    [StoreEnhancer<{ dispatch: ThunkDispatch<RqbState, undefined, UnknownAction> }>, StoreEnhancer]
  >
> & { addSlice: (slice: Slice) => void };
