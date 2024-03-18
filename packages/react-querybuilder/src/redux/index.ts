import type { Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import * as React from 'react';
import type { ReactReduxContextValue, TypedUseSelectorHook } from 'react-redux';
import { createDispatchHook, createSelectorHook, createStoreHook } from 'react-redux';
import { queriesSlice } from './queriesSlice';

export type RqbState = { queries: ReturnType<typeof queriesSlice.getInitialState> };
const preloadedState = { queries: queriesSlice.getInitialState() } satisfies RqbState;

export const queryBuilderStore = configureStore({
  reducer: { queries: queriesSlice.reducer },
  preloadedState,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // Ignore non-serializable values in setQueryState actions and rule `value`s
      // https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data
      serializableCheck: {
        ignoredActions: ['queries/setQueryState'],
        ignoredPaths: [/^queries\b.*\.rules\.\d+\.value$/],
      },
    }),
});

export const QueryBuilderStateContext = React.createContext<ReactReduxContextValue<
  RqbState,
  UnknownAction
> | null>(null);

// #region Hooks
/**
 * Gets the full RQB Redux store.
 */
export const useQueryBuilderStore = createStoreHook(QueryBuilderStateContext);

/**
 * Gets the `dispatch` function for the RQB Redux store.
 */
export const useQueryBuilderDispatch: UseQueryBuilderDispatch =
  createDispatchHook(QueryBuilderStateContext);
type UseQueryBuilderDispatch = () => ThunkDispatch<RqbState, undefined, UnknownAction> &
  Dispatch<UnknownAction>;

/**
 * A `useSelector` hook for the RQB Redux store.
 */
export const useQueryBuilderSelector: TypedUseSelectorHook<RqbState> =
  createSelectorHook(QueryBuilderStateContext);
// #endregion

// #region Selectors
/**
 * Given a `qbId` (provided as part of the `schema` prop), returns
 * a selector for use with `useQueryBuilderSelector`.
 */
export const getQuerySelectorById = (qbId: string) => (state: RqbState) =>
  queriesSlice.selectors.getQuerySelectorById(state, qbId);
// #endregion
