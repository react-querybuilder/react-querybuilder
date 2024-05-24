import type { UnknownAction } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import * as React from 'react';
import type { ReactReduxContextValue, TypedUseSelectorHook } from 'react-redux';
import { createSelectorHook } from 'react-redux';
import type { QueriesSliceState } from './queriesSlice';
import { queriesSlice } from './queriesSlice';
import type { WarningsSliceState } from './warningsSlice';
import { warningsSlice } from './warningsSlice';

export type RqbState = {
  queries: QueriesSliceState;
  warnings: WarningsSliceState;
};

const preloadedState = {
  queries: queriesSlice.getInitialState(),
  warnings: warningsSlice.getInitialState(),
} satisfies RqbState;

export const queryBuilderStore = configureStore({
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
  queriesSlice.selectors.getQuerySelectorById({ queries: state.queries }, qbId);
// #endregion
