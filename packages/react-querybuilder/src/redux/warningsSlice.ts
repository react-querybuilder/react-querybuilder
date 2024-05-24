import type { Slice } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { messages } from '../messages';

export type WarningsSliceState = {
  didWarnBothQueryDefaultQuery: boolean;
  didWarnUncontrolledToControlled: boolean;
  didWarnControlledToUncontrolled: boolean;
};

export const initialState: WarningsSliceState = {
  didWarnBothQueryDefaultQuery: false,
  didWarnUncontrolledToControlled: false,
  didWarnControlledToUncontrolled: false,
};

export const warningsSlice = createSlice({
  name: 'warnings',
  initialState,
  reducers: {
    warnBothQueryDefaultQuery: state => {
      if (!state.didWarnBothQueryDefaultQuery) {
        console.error(messages.errorBothQueryDefaultQuery);
        state.didWarnBothQueryDefaultQuery = true;
      }
    },
    warnControlledToUncontrolled: state => {
      if (!state.didWarnControlledToUncontrolled) {
        console.error(messages.errorControlledToUncontrolled);
        state.didWarnControlledToUncontrolled = true;
      }
    },
    warnUncontrolledToControlled: state => {
      if (!state.didWarnUncontrolledToControlled) {
        console.error(messages.errorUncontrolledToControlled);
        state.didWarnUncontrolledToControlled = true;
      }
    },
  },
}) satisfies Slice;
