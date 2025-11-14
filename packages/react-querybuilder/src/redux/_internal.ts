import type { RuleGroupType, RuleGroupTypeIC } from '@react-querybuilder/core';
import type {
  ConfigureStoreOptions,
  Dispatch,
  PayloadAction,
  Store,
  ThunkAction,
  ThunkDispatch,
  UnknownAction,
} from '@reduxjs/toolkit';
import type { TypedUseSelectorHook, UseStore } from 'react-redux';
import { createDispatchHook, createSelectorHook, createStoreHook } from 'react-redux';
import type { RqbState } from '.';
import type { SetQueryStateParams } from './queriesSlice';
import { queriesSlice } from './queriesSlice';
import { QueryBuilderStateContext } from './QueryBuilderStateContext';
import { rootReducer } from './rootReducer';
import type { Messages } from './warningsSlice';
import { warningsSlice } from './warningsSlice';

export const _RQB_INTERNAL_dispatchThunk =
  ({
    payload,
    onQueryChange,
  }: {
    payload: SetQueryStateParams;
    onQueryChange?: ((query: RuleGroupType) => void) | ((query: RuleGroupTypeIC) => void);
  }): ThunkAction<void, RqbState, unknown, PayloadAction<SetQueryStateParams>> =>
  dispatch => {
    dispatch(queriesSlice.actions.setQueryState(payload));
    if (typeof onQueryChange === 'function') {
      onQueryChange(payload.query as never /* ??? */);
    }
  };

/**
 * Gets the `dispatch` function for the RQB Redux store.
 */
export const useRQB_INTERNAL_QueryBuilderDispatch: UseQueryBuilderDispatch =
  createDispatchHook(QueryBuilderStateContext);
type UseQueryBuilderDispatch = () => ThunkDispatch<RqbState, undefined, UnknownAction> & Dispatch;

/**
 * Gets the full RQB Redux store.
 */
export const useRQB_INTERNAL_QueryBuilderStore: UseStore<Store<RqbState>> =
  createStoreHook(QueryBuilderStateContext);

export const useRQB_INTERNAL_QueryBuilderSelector: TypedUseSelectorHook<RqbState> =
  createSelectorHook(QueryBuilderStateContext);

const { rqbWarn: _SYNC_rqbWarn } = warningsSlice.actions;

export const rqbWarn =
  (msg: Messages): ThunkAction<void, RqbState, unknown, PayloadAction<Messages>> =>
  dispatch => {
    setTimeout(() => dispatch(_SYNC_rqbWarn(msg)));
  };

const preloadedState = {
  queries: queriesSlice.getInitialState(),
  warnings: warningsSlice.getInitialState(),
  // Avoid importing the async slice itself to ensure lazy loading
  asyncOptionLists: { cache: {}, loading: {}, errors: {} },
} satisfies RqbState;

export const storeCommon: ConfigureStoreOptions = {
  reducer: rootReducer,
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
