import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import { signatureOf, structuralSignature, unchangedSignature } from '@react-querybuilder/core';
import type { PayloadAction, Slice } from '@reduxjs/toolkit';
import { createSlice, original } from '@reduxjs/toolkit';
// Imported relatively rather than from `react-querybuilder` on purpose: this slice is only used
// for its action matchers, which compare action `type` strings, so a duplicated copy in this
// entry point's bundle still matches actions dispatched by the main bundle. Anything whose
// _identity_ matters (the store, the React contexts, the `dispatchQuery` registry) must come
// from `react-querybuilder` so that both bundles share one instance.
import { queriesSlice } from '../redux/queriesSlice';
import type { SetQueryStateAction } from '../redux/queriesSlice';
import type { QueryHistoryEntry, QueryHistorySliceState } from './types';

export interface RegisterHistoryParams {
  qbId: string;
  /** Current query, used to seed `present` so that the first recorded change is undoable. */
  query?: RuleGroupTypeAny;
  maxHistory: number;
  coalesceMs: number;
}

export interface QbIdParams {
  qbId: string;
}

const initialState: QueryHistorySliceState = {};

const sliceName = 'queryHistory';

/**
 * Records a change, either as a new history entry or by absorbing it into the current one.
 *
 * Coalescing (rather than debouncing) is what makes typing produce a single undo step: the
 * pre-edit query is pushed onto `past` when the burst _starts_ and left untouched by the rest
 * of the burst, so the boundary snapshot is preserved by construction.
 *
 * `present` must be the _original_ (undrafted) query—see the note in `extraReducers`.
 */
const record = (
  entry: QueryHistoryEntry,
  present: RuleGroupTypeAny | undefined,
  query: RuleGroupTypeAny,
  timestamp: number
): void => {
  // Seed. Also swallows the query builder's mount dispatch, so there is no spurious first entry.
  if (present === undefined) {
    entry.present = query;
    return;
  }

  // No-op edits (e.g. removing the root group) return the same query object.
  if (present === query) return;

  const sig = signatureOf(present, query);

  // The query object changed but nothing observable did. Track the new reference without
  // creating a history entry that would appear to do nothing when undone.
  if (sig === unchangedSignature) {
    entry.present = query;
    return;
  }

  const canCoalesce =
    sig !== structuralSignature &&
    sig === entry.lastSig &&
    timestamp - entry.lastAt < entry.coalesceMs;

  if (!canCoalesce) {
    entry.past.push(present);
    if (entry.past.length > entry.maxHistory) entry.past.shift();
    entry.future = [];
  }

  entry.present = query;
  entry.lastSig = sig;
  entry.lastAt = timestamp;
};

export const queryHistorySlice: Slice<
  QueryHistorySliceState,
  {
    register: (state: QueryHistorySliceState, action: PayloadAction<RegisterHistoryParams>) => void;
    unregister: (state: QueryHistorySliceState, action: PayloadAction<QbIdParams>) => void;
    undo: (state: QueryHistorySliceState, action: PayloadAction<QbIdParams>) => void;
    redo: (state: QueryHistorySliceState, action: PayloadAction<QbIdParams>) => void;
    clear: (state: QueryHistorySliceState, action: PayloadAction<QbIdParams>) => void;
  },
  typeof sliceName,
  typeof sliceName,
  {
    selectHistoryById: (
      state: QueryHistorySliceState,
      qbId: string
    ) => QueryHistoryEntry | undefined;
  }
> = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    /**
     * Opts a query builder in to history recording. Changes are only recorded for registered
     * `qbId`s, so query builders that never use history cost nothing.
     */
    register: (state, { payload: { qbId, query, maxHistory, coalesceMs } }) => {
      const existing = state[qbId];
      if (existing) {
        // Already recording; just apply any changed options.
        existing.maxHistory = maxHistory;
        existing.coalesceMs = coalesceMs;
        return;
      }
      state[qbId] = {
        past: [],
        present: query,
        future: [],
        lastSig: undefined,
        lastAt: 0,
        maxHistory,
        coalesceMs,
      };
    },
    /**
     * Stops recording history for a query builder and discards what has been recorded.
     *
     * Not dispatched when a consumer of {@link useQueryBuilderHistory} unmounts—history belongs
     * to the query builder rather than to any one consumer—but available for explicitly opting
     * a query builder back out of recording. History is otherwise discarded automatically when
     * the query builder unmounts (see the `unsetQueryState` matcher below).
     */
    unregister: (state, { payload: { qbId } }) => {
      delete state[qbId];
    },
    undo: (state, { payload: { qbId } }) => {
      const entry = state[qbId];
      if (!entry || entry.past.length === 0) return;
      // Read through `original` so that queries are stored by reference rather than as drafts.
      const base = original(entry);
      // `past` is non-empty, so `present` is necessarily defined.
      entry.future.unshift(base.present!);
      entry.present = base.past.at(-1);
      entry.past.pop();
      // Prevent the next edit from coalescing into the restored entry.
      entry.lastSig = undefined;
    },
    redo: (state, { payload: { qbId } }) => {
      const entry = state[qbId];
      if (!entry || entry.future.length === 0) return;
      const base = original(entry);
      entry.past.push(base.present!);
      entry.present = base.future[0];
      entry.future.shift();
      entry.lastSig = undefined;
    },
    clear: (state, { payload: { qbId } }) => {
      const entry = state[qbId];
      if (!entry) return;
      entry.past = [];
      entry.future = [];
      entry.lastSig = undefined;
    },
  },
  selectors: {
    selectHistoryById: (state, qbId) => state[qbId],
  },
  extraReducers: builder => {
    builder
      // Record every query change that did not originate from this slice's own undo/redo.
      .addMatcher(
        (action): action is SetQueryStateAction =>
          queriesSlice.actions.setQueryState.match(action) && !action.meta.fromHistory,
        (state, action: SetQueryStateAction) => {
          const entry = state[action.payload.qbId];
          if (!entry) return;
          // `entry.present` would be an Immer draft, and a draft is never reference-equal to
          // the plain object it wraps. Since coalescing depends entirely on reference equality
          // (Immer's structural sharing is what makes untouched subtrees identifiable), reading
          // the draft would make every change to a query with more than one rule look
          // structural, silently disabling coalescing. `original` yields the undrafted value.
          record(entry, original(entry)?.present, action.payload.query, action.meta.timestamp);
        }
      )
      // Discard history when the query itself is torn down on unmount.
      .addMatcher(queriesSlice.actions.unsetQueryState.match, (state, action) => {
        delete state[action.payload.qbId];
      });
  },
});
