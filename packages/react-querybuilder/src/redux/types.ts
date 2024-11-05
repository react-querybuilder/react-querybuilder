import type {
  EnhancedStore,
  StoreEnhancer,
  ThunkDispatch,
  Tuple,
  UnknownAction,
} from '@reduxjs/toolkit';
import type { QueriesSliceState } from './queriesSlice';
import type { WarningsSliceState } from './warningsSlice';

export type RqbState = {
  queries: QueriesSliceState;
  warnings: WarningsSliceState;
};

export type RqbStore = EnhancedStore<
  {
    queries: QueriesSliceState;
    warnings: WarningsSliceState;
  },
  UnknownAction,
  Tuple<
    [
      StoreEnhancer<{
        dispatch: ThunkDispatch<
          { queries: QueriesSliceState; warnings: WarningsSliceState },
          undefined,
          UnknownAction
        >;
      }>,
      StoreEnhancer,
    ]
  >
>;
