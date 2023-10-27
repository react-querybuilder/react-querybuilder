import type {
  AnyAction,
  Dispatch,
  PayloadAction,
  ThunkAction,
  ThunkDispatch,
} from '@reduxjs/toolkit';
import {
  applyMiddleware,
  combineReducers,
  createStore,
  getDefaultMiddleware,
} from '@reduxjs/toolkit';
import * as React from 'react';
import type { ReactReduxContextValue } from 'react-redux';
import { createDispatchHook, createSelectorHook, createStoreHook } from 'react-redux';
import type { QueriesSliceState, SetQueryStateParams } from './queriesSlice';
import {
  getQueriesSliceState,
  initialState,
  queriesSliceReducer,
  setQueryState,
} from './queriesSlice';

export type RqbState = { queries: QueriesSliceState };

const rootReducer = combineReducers<RqbState>({ queries: queriesSliceReducer });

export const queryBuilderStore = createStore(
  rootReducer,
  { queries: initialState },
  applyMiddleware(
    ...getDefaultMiddleware({
      // Ignore non-serializable values in setQueryState actions and rule `value`s
      // https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data
      serializableCheck: {
        ignoredActions: ['queries/setQueryState'],
        ignoredPaths: [/^queries\b.*\.rules\.\d+\.value$/],
      },
    })
  )
);
export const QueryBuilderStateContext = React.createContext<
  ReactReduxContextValue<RqbState, AnyAction>
>(null as any);

// Hooks
/**
 * Gets the full RQB Redux store.
 */
export const useQueryBuilderStore = createStoreHook(QueryBuilderStateContext);

/**
 * Gets the `dispatch` function for the RQB Redux store.
 */
export const useQueryBuilderDispatch: UseQueryBuilderDispatch =
  createDispatchHook(QueryBuilderStateContext);
type UseQueryBuilderDispatch = () => ThunkDispatch<RqbState, undefined, AnyAction> &
  Dispatch<AnyAction>;

/**
 * A `useSelector` hook for the RQB Redux store.
 */
export const useQueryBuilderSelector = createSelectorHook(QueryBuilderStateContext);

// Selectors
export const getQueryState = (state: RqbState, qbId: string) =>
  getQueriesSliceState(state.queries, qbId);

// Misc exports
export { removeQueryState } from './queriesSlice';
export { setQueryState };

// Thunks
interface DispatchThunkParams {
  payload: SetQueryStateParams;
  onQueryChange?: (query: any /* RuleGroupTypeAny */) => void;
}
type QueryBuilderThunk = ThunkAction<void, RqbState, unknown, PayloadAction<SetQueryStateParams>>;
export const dispatchThunk =
  ({ payload, onQueryChange }: DispatchThunkParams): QueryBuilderThunk =>
  dispatch => {
    dispatch(setQueryState(payload));
    if (typeof onQueryChange === 'function') {
      onQueryChange(payload.query);
    }
  };
