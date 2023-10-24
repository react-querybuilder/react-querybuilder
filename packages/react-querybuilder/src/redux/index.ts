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
import { createSubscription } from './Subscription';
import type { QueriesSliceState, SetQueryStateParams } from './queriesSlice';
import {
  getQueriesSliceState,
  initialState,
  queriesSliceReducer,
  setQueryState,
} from './queriesSlice';

export type QueryBuilderStoreState = { queries: QueriesSliceState };

const rootReducer = combineReducers<QueryBuilderStoreState>({ queries: queriesSliceReducer });

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
const contextInitalValue: ReactReduxContextValue<QueryBuilderStoreState, AnyAction> = {
  store: queryBuilderStore,
  subscription: createSubscription(queryBuilderStore),
  stabilityCheck: 'never',
  noopCheck: 'never',
};
export const RqbStoreContext = React.createContext(contextInitalValue);

// Hooks
/**
 * Gets the full RQB Redux store.
 */
export const useQueryBuilderStore = createStoreHook(RqbStoreContext);

/**
 * Gets the `dispatch` function for the RQB Redux store.
 */
export const useQueryBuilderDispatch: UseQueryBuilderDispatch = createDispatchHook(RqbStoreContext);
type UseQueryBuilderDispatch = () => ThunkDispatch<QueryBuilderStoreState, undefined, AnyAction> &
  Dispatch<AnyAction>;

/**
 * A `useSelector` hook for the RQB Redux store.
 */
export const useQueryBuilderSelector = createSelectorHook(RqbStoreContext);

// Selectors
export const getQueryState = (state: QueryBuilderStoreState, qbId: string) =>
  getQueriesSliceState(state.queries, qbId);

// Misc exports
export { removeQueryState } from './queriesSlice';
export { setQueryState };

// Thunks
interface DispatchThunkParams {
  payload: SetQueryStateParams;
  onQueryChange?: (query: any /* RuleGroupTypeAny */) => void;
}
type QueryBuilderThunk = ThunkAction<
  void,
  QueryBuilderStoreState,
  unknown,
  PayloadAction<SetQueryStateParams>
>;
export const dispatchThunk =
  ({ payload, onQueryChange }: DispatchThunkParams): QueryBuilderThunk =>
  dispatch => {
    dispatch(setQueryState(payload));
    if (typeof onQueryChange === 'function') {
      onQueryChange(payload.query);
    }
  };
