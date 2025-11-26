import type {
  Dispatch,
  PayloadAction,
  Store,
  ThunkAction,
  ThunkDispatch,
  UnknownAction,
} from '@reduxjs/toolkit';
import { QueryBuilderStateContext } from 'react-querybuilder';
import type { ReactReduxContextValue, TypedUseSelectorHook, UseStore } from 'react-redux';
import { createDispatchHook, createSelectorHook, createStoreHook } from 'react-redux';
import type { RulesEngine, RulesEngineIC } from '../types';
import type { SetRulesEngineStateParams } from './rulesEngineSlice';
import { rulesEngineSlice } from './rulesEngineSlice';
import type { RqbState } from './types';

type QBSCType = React.Context<ReactReduxContextValue<RqbState> | null>;

declare module './types' {
  export interface RqbState {
    rulesEngines: RulesEngineSliceState;
  }
}

/**
 * Gets the full RQB Redux store.
 */
export const useRQB_INTERNAL_QueryBuilderStore: UseStore<Store<RqbState>> = createStoreHook(
  QueryBuilderStateContext as QBSCType
);

/**
 * Gets the `dispatch` function for the RQB Redux store.
 */
export const useRQB_INTERNAL_QueryBuilderDispatch: UseQueryBuilderDispatch =
  createDispatchHook(QueryBuilderStateContext);
type UseQueryBuilderDispatch = () => ThunkDispatch<RqbState, undefined, UnknownAction> & Dispatch;

export const useRQB_INTERNAL_QueryBuilderSelector: TypedUseSelectorHook<RqbState> =
  createSelectorHook(QueryBuilderStateContext);

export const _RQB_INTERNAL_dispatchThunk =
  ({
    payload,
    onRulesEngineChange,
  }: {
    payload: SetRulesEngineStateParams;
    onRulesEngineChange?:
      | ((rulesEngine: RulesEngine) => void)
      | ((rulesEngine: RulesEngineIC) => void);
  }): ThunkAction<void, RqbState, unknown, PayloadAction<SetRulesEngineStateParams>> =>
  dispatch => {
    dispatch(rulesEngineSlice.actions.setRulesEngineState(payload));
    if (typeof onRulesEngineChange === 'function') {
      onRulesEngineChange(payload.rulesEngine as never /* ??? */);
    }
  };
