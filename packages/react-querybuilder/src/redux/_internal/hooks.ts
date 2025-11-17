import type { Dispatch, Store, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import React from 'react';
import type { ReactReduxContextValue, TypedUseSelectorHook, UseStore } from 'react-redux';
import { createDispatchHook, createSelectorHook, createStoreHook } from 'react-redux';
import type { RqbState } from '../types';

const genUseQueryBuilderDispatch = (
  ctx: React.Context<ReactReduxContextValue<RqbState> | null>
): UseQueryBuilderDispatch => createDispatchHook(ctx);
export type UseQueryBuilderDispatch = () => ThunkDispatch<RqbState, undefined, UnknownAction> &
  Dispatch;

const genUseQueryBuilderStore = (
  ctx: React.Context<ReactReduxContextValue<RqbState> | null>
): UseStore<Store<RqbState>> => createStoreHook(ctx);

const genUseQueryBuilderSelector = (
  ctx: React.Context<ReactReduxContextValue<RqbState> | null>
): TypedUseSelectorHook<RqbState> => createSelectorHook(ctx);

export const getInternalHooks = (
  ctx: React.Context<ReactReduxContextValue<RqbState> | null>
): {
  useRQB_INTERNAL_QueryBuilderDispatch: UseQueryBuilderDispatch;
  useRQB_INTERNAL_QueryBuilderStore: UseStore<Store<RqbState>>;
  useRQB_INTERNAL_QueryBuilderSelector: TypedUseSelectorHook<RqbState>;
} => ({
  useRQB_INTERNAL_QueryBuilderDispatch: genUseQueryBuilderDispatch(ctx),
  useRQB_INTERNAL_QueryBuilderStore: genUseQueryBuilderStore(ctx),
  useRQB_INTERNAL_QueryBuilderSelector: genUseQueryBuilderSelector(ctx),
});
