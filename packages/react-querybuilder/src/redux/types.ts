import type { FullOption, FullOptionList } from '@react-querybuilder/core';
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
  asyncOptionLists: AsyncOptionListsSliceState;
}

export type RqbStore = EnhancedStore<
  RqbState,
  UnknownAction,
  Tuple<
    [StoreEnhancer<{ dispatch: ThunkDispatch<RqbState, undefined, UnknownAction> }>, StoreEnhancer]
  >
> & { addSlice: (slice: Slice) => void };

export type CacheKeys = [string, ...string[]];

export interface CachedOptionList {
  data: FullOptionList<FullOption>;
  timestamp: number;
  validUntil: number;
}

export interface AsyncOptionListsSliceState {
  cache: Record<string, CachedOptionList>;
  loading: Record<string, boolean>;
  errors: Record<string, string>;
}
