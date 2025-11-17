import type { RuleGroupType, RuleGroupTypeIC } from '@react-querybuilder/core';
import type { ConfigureStoreOptions, PayloadAction, Store, ThunkAction } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook, UseStore } from 'react-redux';
import type { SetQueryStateParams } from '../queriesSlice';
import { queriesSlice } from '../queriesSlice';
import { QueryBuilderStateContext } from '../QueryBuilderStateContext';
import { rootReducer } from '../rootReducer';
import type { RqbState } from '../types';
import type { Messages } from '../warningsSlice';
import { warningsSlice } from '../warningsSlice';
import type { UseQueryBuilderDispatch } from './hooks';
import { getInternalHooks } from './hooks';

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

const internalHooks = getInternalHooks(QueryBuilderStateContext);

export const useRQB_INTERNAL_QueryBuilderDispatch =
  internalHooks.useRQB_INTERNAL_QueryBuilderDispatch as UseQueryBuilderDispatch;
export const useRQB_INTERNAL_QueryBuilderStore =
  internalHooks.useRQB_INTERNAL_QueryBuilderStore as UseStore<Store<RqbState>>;
export const useRQB_INTERNAL_QueryBuilderSelector =
  internalHooks.useRQB_INTERNAL_QueryBuilderSelector as TypedUseSelectorHook<RqbState>;

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
  // asyncOptionLists: { cache: {}, loading: {}, errors: {} },
} as RqbState;

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
