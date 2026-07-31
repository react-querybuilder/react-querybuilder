import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import type { PayloadAction, Slice } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export type QueriesSliceState = Record<string, RuleGroupTypeAny>;

export interface SetQueryStateParams {
  qbId: string;
  query: RuleGroupTypeAny;
}

/**
 * Options that augment a `setQueryState` action's `meta` property.
 */
export interface SetQueryStateOptions {
  /**
   * `true` when the query update originates from an undo/redo operation rather than from a
   * user edit. Consumers that record query history use this to avoid recording the very
   * updates they dispatch.
   */
  fromHistory?: boolean;
}

/**
 * The `meta` property attached to every `setQueryState` action.
 */
export interface SetQueryStateMeta extends SetQueryStateOptions {
  /**
   * When the action was created. Assigned in a `prepare` callback—the sanctioned place for
   * non-deterministic values—so that reducers consuming this action remain pure.
   */
  timestamp: number;
}

export type SetQueryStateAction = PayloadAction<SetQueryStateParams, string, SetQueryStateMeta>;

export interface UnsetQueryStateParams {
  qbId: string;
}

const initialState: QueriesSliceState = {};

export const queriesSlice: Slice<
  QueriesSliceState,
  {
    setQueryState: {
      prepare: (
        payload: SetQueryStateParams,
        options?: SetQueryStateOptions
      ) => { payload: SetQueryStateParams; meta: SetQueryStateMeta };
      reducer: (state: QueriesSliceState, action: SetQueryStateAction) => void;
    };
    unsetQueryState: (
      state: QueriesSliceState,
      { payload: { qbId } }: PayloadAction<UnsetQueryStateParams>
    ) => void;
  },
  'queries',
  'queries',
  { getQuerySelectorById: (state: QueriesSliceState, qbId: string) => RuleGroupTypeAny }
> = createSlice({
  name: 'queries',
  initialState,
  reducers: {
    setQueryState: {
      prepare: (payload: SetQueryStateParams, options?: SetQueryStateOptions) => ({
        payload,
        meta: { timestamp: Date.now(), fromHistory: !!options?.fromHistory },
      }),
      reducer: (state, { payload: { qbId, query } }: SetQueryStateAction) => {
        state[qbId] = query;
      },
    },
    /**
     * Removes a query from the store. Dispatched when the last `QueryBuilder` using a given
     * `qbId` unmounts, unless the `preserveQueryStateOnUnmount` prop is `true`.
     */
    unsetQueryState: (state, { payload: { qbId } }) => {
      delete state[qbId];
    },
  },
  selectors: {
    getQuerySelectorById: (state, qbId) => state[qbId],
  },
});
