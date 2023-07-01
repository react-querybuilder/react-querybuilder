import type { PayloadAction, ThunkAction } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector, useStore } from 'react-redux';
import type { SetQueryStateParams } from './querySlice';
import {
  getQueryState as getQuerySliceState,
  querySliceReducer,
  setQueryState,
} from './querySlice';

// Redux store
export const queryBuilderStore = configureStore({
  reducer: { query: querySliceReducer },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // Ignore non-serializable values in setQueryState actions and rule `value`s
      // https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data
      serializableCheck: {
        ignoredActions: ['query/setQueryState'],
        ignoredPaths: [/^query\b.*\.rules\.\d+\.value$/],
      },
    }),
});

// Types
export type QueryBuilderStoreState = ReturnType<typeof queryBuilderStore.getState>;
type QueryBuilderDispatch = typeof queryBuilderStore.dispatch;

// Hooks
export const useQueryBuilderStore = () => useStore<QueryBuilderStoreState>();
export const useQueryBuilderDispatch = () => useDispatch<QueryBuilderDispatch>();
export const useQueryBuilderSelector: TypedUseSelectorHook<QueryBuilderStoreState> = useSelector;

// Selectors
export const getQueryState = (state: QueryBuilderStoreState, qbId: string) =>
  getQuerySliceState(state.query, qbId);

// Misc exports
export { removeQueryState } from './querySlice';
export { setQueryState };

// Thunks
type QueryBuilderThunk<T> = ThunkAction<T, QueryBuilderStoreState, unknown, PayloadAction<any>>;
type DispatchThunkParams = {
  payload: SetQueryStateParams;
  onQueryChange?: (...args: any[]) => void;
};
export const dispatchThunk =
  ({ payload, onQueryChange }: DispatchThunkParams): QueryBuilderThunk<void> =>
  dispatch => {
    dispatch(setQueryState(payload));
    if (typeof onQueryChange === 'function') {
      onQueryChange(payload.query);
    }
  };
