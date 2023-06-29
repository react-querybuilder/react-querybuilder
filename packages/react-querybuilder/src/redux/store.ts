import { configureStore } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { getQueryState as getQuerySliceState, querySliceReducer } from './querySlice';

// Redux store
export const queryBuilderStore = configureStore({
  reducer: { [querySliceReducer.name]: querySliceReducer },
});

// Types
export type QueryBuilderStoreState = ReturnType<(typeof queryBuilderStore)['getState']>;
type QueryBuilderDispatch = ReturnType<typeof useStore<QueryBuilderStoreState>>['dispatch'];

// Hooks
export const useQueryBuilderStore = () => useStore<QueryBuilderStoreState>();
export const useQueryBuilderDispatch = () => useDispatch<QueryBuilderDispatch>();
export const useQueryBuilderSelector: TypedUseSelectorHook<QueryBuilderStoreState> = useSelector;

// Selectors
export const getQueryState = (state: QueryBuilderStoreState, qbId: string) =>
  getQuerySliceState(state[querySliceReducer.name], qbId);
