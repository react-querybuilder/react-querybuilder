import type { PayloadAction, ThunkAction } from '@reduxjs/toolkit';
import type { SetQueryStateParams } from './queriesSlice';
import { queriesSlice } from './queriesSlice';
import type { RqbState } from '.';

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
