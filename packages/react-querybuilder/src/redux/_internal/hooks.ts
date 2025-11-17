import type { Dispatch, Store, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import React from 'react';
import type { ReactReduxContextValue, TypedUseSelectorHook, UseStore } from 'react-redux';
import { createDispatchHook, createSelectorHook, createStoreHook } from 'react-redux';
import type { RqbState } from '../types';

/**
 * Gets the `dispatch` function for the RQB Redux store.
 */
const genUseQueryBuilderDispatch = (
  ctx: React.Context<ReactReduxContextValue<RqbState, UnknownAction> | null>
): UseQueryBuilderDispatch => createDispatchHook(ctx);
export type UseQueryBuilderDispatch = () => ThunkDispatch<RqbState, undefined, UnknownAction> &
  Dispatch;

/**
 * Gets the full RQB Redux store.
 */
const genUseQueryBuilderStore = (
  ctx: React.Context<ReactReduxContextValue<RqbState, UnknownAction> | null>
): UseStore<Store<RqbState>> => createStoreHook(ctx);

const genUseQueryBuilderSelector = (
  ctx: React.Context<ReactReduxContextValue<RqbState, UnknownAction> | null>
): TypedUseSelectorHook<RqbState> => createSelectorHook(ctx);

export const getInternalHooks = (
  ctx: React.Context<ReactReduxContextValue<RqbState, UnknownAction> | null>
): {
  useRQB_INTERNAL_QueryBuilderDispatch: UseQueryBuilderDispatch;
  useRQB_INTERNAL_QueryBuilderStore: UseStore<Store<RqbState>>;
  useRQB_INTERNAL_QueryBuilderSelector: TypedUseSelectorHook<RqbState>;
} => ({
  useRQB_INTERNAL_QueryBuilderDispatch: genUseQueryBuilderDispatch(ctx),
  useRQB_INTERNAL_QueryBuilderStore: genUseQueryBuilderStore(ctx),
  useRQB_INTERNAL_QueryBuilderSelector: genUseQueryBuilderSelector(ctx),
});
