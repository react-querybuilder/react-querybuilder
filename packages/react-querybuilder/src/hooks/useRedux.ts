import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector, useStore } from 'react-redux';
import type { RuleGroupTypeAny } from '../types';

export type RootState = { query: RuleGroupTypeAny };
export type AppDispatch = ReturnType<typeof useStore<RootState>>['dispatch'];

export const useAppStore = () => useStore<RootState>();
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const getReduxQuery = ({ query }: RootState) => query;
