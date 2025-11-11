import type {
  EnhancedStore,
  StoreEnhancer,
  ThunkDispatch,
  Tuple,
  UnknownAction,
} from '@reduxjs/toolkit';
import type { AsyncOptionListsSliceState } from './asyncOptionListsSlice';
import type { QueriesSliceState } from './queriesSlice';
import type { WarningsSliceState } from './warningsSlice';

export type RqbState = {
  queries: QueriesSliceState;
  warnings: WarningsSliceState;
  asyncOptionLists: AsyncOptionListsSliceState;
};

export type RqbStore = EnhancedStore<
  RqbState,
  UnknownAction,
  Tuple<
    [StoreEnhancer<{ dispatch: ThunkDispatch<RqbState, undefined, UnknownAction> }>, StoreEnhancer]
  >
>;

export type CacheKeys = [string, ...string[]];
