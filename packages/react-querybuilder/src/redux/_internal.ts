import type {
  Dispatch,
  PayloadAction,
  Store,
  ThunkAction,
  ThunkDispatch,
  UnknownAction,
} from '@reduxjs/toolkit';
import type { UseStore } from 'react-redux';
import { createDispatchHook, createStoreHook } from 'react-redux';
import type { RqbState } from '.';
import type { SetQueryStateParams } from './queriesSlice';
import { queriesSlice } from './queriesSlice';
import { QueryBuilderStateContext } from './QueryBuilderStateContext';
import type { Messages } from './warningsSlice';
import { warningsSlice } from './warningsSlice';

export const _RQB_INTERNAL_dispatchThunk =
  ({
    payload,
    onQueryChange,
  }: {
    payload: SetQueryStateParams;
    // TODO: Why doesn't `(query: RuleGroupTypeAny) => void` work here?
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onQueryChange?: (query: any) => void;
  }): ThunkAction<void, RqbState, unknown, PayloadAction<SetQueryStateParams>> =>
  dispatch => {
    dispatch(queriesSlice.actions.setQueryState(payload));
    if (typeof onQueryChange === 'function') {
      onQueryChange(payload.query);
    }
  };

/**
 * Gets the `dispatch` function for the RQB Redux store.
 */
export const useRQB_INTERNAL_QueryBuilderDispatch: UseQueryBuilderDispatch =
  createDispatchHook(QueryBuilderStateContext);
type UseQueryBuilderDispatch = () => ThunkDispatch<RqbState, undefined, UnknownAction> &
  Dispatch<UnknownAction>;

/**
 * Gets the full RQB Redux store.
 */
export const useRQB_INTERNAL_QueryBuilderStore: UseStore<Store<RqbState, UnknownAction>> =
  createStoreHook(QueryBuilderStateContext);

const { rqbWarn: _SYNC_rqbWarn } = warningsSlice.actions;

export const rqbWarn =
  (msg: Messages): ThunkAction<void, RqbState, unknown, PayloadAction<Messages>> =>
  dispatch => {
    setTimeout(() => dispatch(_SYNC_rqbWarn(msg)));
  };

import type { ConfigureStoreOptions } from '@reduxjs/toolkit';

const preloadedState = {
  queries: queriesSlice.getInitialState(),
  warnings: warningsSlice.getInitialState(),
} satisfies RqbState;

export const storeCommon: ConfigureStoreOptions = {
  reducer: {
    queries: queriesSlice.reducer,
    warnings: warningsSlice.reducer,
  },
  preloadedState,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // Ignore non-serializable values in setQueryState actions and rule `value`s
      // https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data
      serializableCheck: {
        ignoredActions: [queriesSlice.actions.setQueryState.type],
        ignoredPaths: [/^queries\b.*\.rules\.\d+\.value$/],
      },
    }),
};
