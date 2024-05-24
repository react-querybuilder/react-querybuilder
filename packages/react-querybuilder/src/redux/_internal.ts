import type {
  Dispatch,
  PayloadAction,
  ThunkAction,
  ThunkDispatch,
  UnknownAction,
} from '@reduxjs/toolkit';
import { createDispatchHook, createStoreHook } from 'react-redux';
import { QueryBuilderStateContext, type RqbState } from '.';
import type { SetQueryStateParams } from './queriesSlice';
import { queriesSlice } from './queriesSlice';
import { warningsSlice } from './warningsSlice';

export const _RQB_INTERNAL_dispatchThunk =
  ({
    payload,
    onQueryChange,
  }: {
    payload: SetQueryStateParams;
    // TODO: Why doesn't `(query: RuleGroupTypeAny) => void` work here?
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onQueryChange?: (query: any) => void;
  }): ThunkAction<void, RqbState, unknown, PayloadAction<SetQueryStateParams>> =>
  dispatch => {
    dispatch(queriesSlice.actions.setQueryState(payload));
    if (typeof onQueryChange === 'function') {
      onQueryChange(payload.query);
    }
  };

/**
 * Gets the `dispatch` function for the RQB Redux store.
 */
export const useRQB_INTERNAL_QueryBuilderDispatch: UseQueryBuilderDispatch =
  createDispatchHook(QueryBuilderStateContext);
type UseQueryBuilderDispatch = () => ThunkDispatch<RqbState, undefined, UnknownAction> &
  Dispatch<UnknownAction>;

/**
 * Gets the full RQB Redux store.
 */
export const useRQB_INTERNAL_QueryBuilderStore = createStoreHook(QueryBuilderStateContext);

export const {
  warnBothQueryDefaultQuery,
  warnControlledToUncontrolled,
  warnUncontrolledToControlled,
} = warningsSlice.actions;
