import type {
  Dispatch,
  PayloadAction,
  ThunkAction,
  ThunkDispatch,
  UnknownAction,
} from '@reduxjs/toolkit';
import { applyMiddleware, combineReducers, configureStore, createStore } from '@reduxjs/toolkit';
import * as React from 'react';
import type { ReactReduxContextValue, TypedUseSelectorHook } from 'react-redux';
import { createDispatchHook, createSelectorHook, createStoreHook } from 'react-redux';
import type { QueriesSliceState, SetQueryStateParams } from './queriesSlice';
import { queriesSlice } from './queriesSlice';

export type RqbState = { queries: QueriesSliceState };

const rootReducer = combineReducers({ queries: queriesSlice.reducer });

// Next two lines are needed to get the default middleware since the standalone
// `getDefaultMiddleware` function was removed from RTK in v2.
let defaultMiddleware: any[] = [];
configureStore({
  reducer: () => {},
  middleware: gdm =>
    (defaultMiddleware = gdm({
      // Ignore non-serializable values in setQueryState actions and rule `value`s
      // https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data
      serializableCheck: {
        ignoredActions: ['queries/setQueryState'],
        ignoredPaths: [/^queries\b.*\.rules\.\d+\.value$/],
      },
    })),
});

export const queryBuilderStore = createStore(
  rootReducer,
  { queries: queriesSlice.getInitialState() },
  applyMiddleware(...defaultMiddleware)
);
export const QueryBuilderStateContext = React.createContext<ReactReduxContextValue<
  RqbState,
  UnknownAction
> | null>(null);

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
type UseQueryBuilderDispatch = () => ThunkDispatch<RqbState, undefined, UnknownAction> &
  Dispatch<UnknownAction>;

/**
 * A `useSelector` hook for the RQB Redux store.
 */
export const useQueryBuilderSelector: TypedUseSelectorHook<RqbState> =
  createSelectorHook(QueryBuilderStateContext);

// Selectors
/**
 * Given a `qbId` (provided as part of the `schema` prop), returns
 * a selector for use with `useQueryBuilderSelector`.
 */
export const getQuerySelectorById = (qbId: string) => (state: RqbState) =>
  queriesSlice.selectors.getQuerySelectorById(state, qbId);

// Misc exports
export const {
  actions: { setQueryState },
} = queriesSlice;

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
