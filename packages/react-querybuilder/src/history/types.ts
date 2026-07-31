import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import type { WithSlice } from '@reduxjs/toolkit';
import type { queryHistorySlice } from './queryHistorySlice';

declare module '../redux/rootReducer' {
  export interface LazyLoadedSlices extends WithSlice<typeof queryHistorySlice> {}
}

declare module '../redux/types' {
  export interface RqbState {
    queryHistory: QueryHistorySliceState;
  }
}

/**
 * Undo/redo history for a single query builder.
 */
export interface QueryHistoryEntry {
  /** Previous queries, oldest first. The last element is what `undo` restores. */
  past: RuleGroupTypeAny[];
  /**
   * The query as of the most recent recorded change.
   *
   * The history slice mirrors this itself because a slice's `extraReducers` matcher only
   * receives its own state plus the _new_ query—it cannot read the queries slice to find the
   * previous one. This is a reference, not a copy, so it costs nothing.
   */
  present: RuleGroupTypeAny | undefined;
  /** Undone queries, newest first. The first element is what `redo` restores. */
  future: RuleGroupTypeAny[];
  /** Signature of the most recent change, used to decide whether the next one can coalesce. */
  lastSig: string | undefined;
  /** Timestamp of the most recent change, used to decide whether the next one can coalesce. */
  lastAt: number;
  /** Maximum number of entries retained in `past`. */
  maxHistory: number;
  /** Time window within which consecutive same-signature changes coalesce. */
  coalesceMs: number;
}

export type QueryHistorySliceState = Record<string, QueryHistoryEntry>;

export interface QueryHistoryOptions {
  /**
   * Maximum number of undo steps to retain. Older entries are discarded.
   *
   * @default 50
   */
  maxHistory?: number;
  /**
   * Consecutive changes to the same property of the same rule within this many milliseconds
   * are merged into a single undo step, so that (for example) typing a multi-character value
   * produces one history entry rather than one per keystroke.
   *
   * Set to `0` to record every change separately.
   *
   * @default 500
   */
  coalesceMs?: number;
}

export interface UseQueryBuilderHistory {
  /** Restores the previous query. No-op when `canUndo` is `false`. */
  undo: () => void;
  /** Restores the most recently undone query. No-op when `canRedo` is `false`. */
  redo: () => void;
  /** Discards all undo/redo history without changing the current query. */
  clear: () => void;
  /** Whether there is anything to undo. */
  canUndo: boolean;
  /** Whether there is anything to redo. */
  canRedo: boolean;
  /** Previous queries, oldest first. */
  past: RuleGroupTypeAny[];
  /** Undone queries, newest first. */
  future: RuleGroupTypeAny[];
}
