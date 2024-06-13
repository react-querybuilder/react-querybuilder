import type { UnknownAction } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import * as React from 'react';
import type { ReactReduxContextValue, TypedUseSelectorHook } from 'react-redux';
import { createSelectorHook } from 'react-redux';
import { QueryBuilderContext } from '../components';
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
const useRQB_INTERNAL_QueryBuilderSelector: TypedUseSelectorHook<RqbState> =
  createSelectorHook(QueryBuilderStateContext);

/**
 * A Redux `useSelector` hook for RQB's internal store. See also {@link getQuerySelectorById}.
 *
 * **TIP:** Prefer {@link useQueryBuilderQuery} if you only need to access the query object
 * for the nearest ancestor {@link QueryBuilder} component.
 */
export const useQueryBuilderSelector: TypedUseSelectorHook<RqbState> = (selector, other) => {
  const rqbContext = React.useContext(QueryBuilderContext);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = useRQB_INTERNAL_QueryBuilderSelector(selector, other as any);
  return result ?? rqbContext?.initialQuery;
};

/**
 * Retrieves the full, latest query object for the nearest ancestor {@link QueryBuilder}
 * component.
 *
 * The optional parameter should only be used when retrieving a query object from a different
 * {@link QueryBuilder} than the nearest ancestor. It can be a full props object as passed
 * to a custom component or any object matching the interface `{ schema: { qbId: string } }`.
 *
 * Must follow React's [Rules of Hooks](https://react.dev/warnings/invalid-hook-call-warning).
 */
export const useQueryBuilderQuery = (props?: { schema: { qbId: string } }) => {
  const rqbContext = React.useContext(QueryBuilderContext);
  return (
    useRQB_INTERNAL_QueryBuilderSelector(
      getQuerySelectorById(props?.schema.qbId ?? rqbContext.qbId ?? /* istanbul ignore next */ '')
    ) ?? rqbContext?.initialQuery
  );
};
// #endregion

// #region Selectors
/**
 * Given a `qbId` (passed to every component as part of the `schema` prop), returns
 * a Redux selector for use with {@link useQueryBuilderSelector}.
 *
 * Note that {@link useQueryBuilderQuery} is a more concise way of accessing the
 * query for the nearest ancestor {@link QueryBuilder} component.
 */
export const getQuerySelectorById = (qbId: string) => (state: RqbState) =>
  queriesSlice.selectors.getQuerySelectorById({ queries: state.queries }, qbId);
// #endregion
