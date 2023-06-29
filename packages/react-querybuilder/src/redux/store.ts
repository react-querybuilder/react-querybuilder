import { configureStore } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector, useStore } from 'react-redux';
import type { QuerySliceState } from './querySlice';
import * as fromQuerySlice from './querySlice';

export const store = configureStore({ reducer: { query: fromQuerySlice.reducer } });

export type RootState = { query: QuerySliceState };
export type AppDispatch = ReturnType<typeof useStore<RootState>>['dispatch'];

export const useAppStore = () => useStore<RootState>();
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const getReduxQuery = ({ query: querySliceState }: RootState, qbId: string) =>
  fromQuerySlice.getReduxQuery(querySliceState, qbId);
