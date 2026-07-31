import type { Store } from '@reduxjs/toolkit';
import { useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import type { RqbState } from 'react-querybuilder';
import {
  getDispatchQueryById,
  getQuerySelectorById,
  getRqbStore,
  QueryBuilderStateContext,
} from 'react-querybuilder';
import { QueryBuilderHistoryContext } from './QueryBuilderHistoryContext';
import { queryHistorySlice } from './queryHistorySlice';
import type { QueryHistoryEntry, QueryHistoryOptions, UseQueryBuilderHistory } from './types';

const emptyStack: never[] = [];

/**
 * Records undo/redo history for the query builder with the given `qbId`, and returns controls
 * for navigating it.
 *
 * History is only recorded for query builders that use this hook (directly, or by rendering
 * undo/redo controls), so query builders that never use history retain nothing.
 *
 * ```tsx
 * const { undo, redo, canUndo, canRedo } = useQueryBuilderHistory('main');
 * ```
 *
 * Options default to the values provided by the nearest {@link QueryBuilderHistory} ancestor,
 * and fall back to the library defaults when there is none.
 *
 * Unlike most of React Query Builder's hooks, this one does _not_ need to be rendered beneath a
 * `QueryBuilder`. That is the point: an external toolbar or keyboard shortcut handler can drive
 * a query builder's history knowing nothing but its `qbId`. The store is therefore resolved
 * from context when available (which keeps tests that supply their own store working) and from
 * the singleton store otherwise.
 *
 * @group Hooks
 */
export const useQueryBuilderHistory = (
  qbId: string,
  options?: QueryHistoryOptions
): UseQueryBuilderHistory => {
  const reduxContext = useContext(QueryBuilderStateContext);
  const historyContext = useContext(QueryBuilderHistoryContext);

  const store: Store<RqbState> = reduxContext?.store ?? getRqbStore();
  const { dispatch } = store;

  const maxHistory = options?.maxHistory ?? historyContext.maxHistory;
  const coalesceMs = options?.coalesceMs ?? historyContext.coalesceMs;

  const subscribe = useMemo(
    () => (onStoreChange: () => void) => {
      // Seed `present` from the query builder's current query so that the first change recorded
      // after registration is undoable rather than being swallowed as the seed. Registration
      // happens here rather than in an effect so that no change can slip through between the
      // first render and the first effect.
      //
      // Registration is deliberately _not_ undone when this consumer unsubscribes. A query
      // builder's history belongs to the query builder, not to whichever component happens to
      // be displaying it: several consumers can share one `qbId` (the built-in undo/redo
      // buttons plus an external toolbar, say), and unregistering here would destroy the
      // history still in use by the others. Re-subscribing—which also happens whenever the
      // options change—would likewise wipe it. The history entry is discarded when the query
      // builder itself unmounts, via the `unsetQueryState` matcher in the slice.
      dispatch(
        queryHistorySlice.actions.register({
          qbId,
          query: getQuerySelectorById(qbId)(store.getState()),
          maxHistory,
          coalesceMs,
        })
      );
      return store.subscribe(onStoreChange);
    },
    [coalesceMs, dispatch, maxHistory, qbId, store]
  );

  const getSnapshot = useCallback(
    (): QueryHistoryEntry | undefined =>
      queryHistorySlice.selectors.selectHistoryById(store.getState(), qbId),
    [qbId, store]
  );

  const entry = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  /**
   * Applies a query through the query builder's own `dispatchQuery` so that `onQueryChange`
   * fires—a controlled query builder would otherwise revert the change immediately—and tags
   * the action as originating from history so that it is not recorded as a new edit.
   */
  const undo = useCallback(() => {
    const restored = queryHistorySlice.selectors
      .selectHistoryById(store.getState(), qbId)
      ?.past.at(-1);
    if (!restored) return;
    dispatch(queryHistorySlice.actions.undo({ qbId }));
    getDispatchQueryById(qbId)?.(restored, { fromHistory: true });
  }, [dispatch, qbId, store]);

  const redo = useCallback(() => {
    const restored = queryHistorySlice.selectors.selectHistoryById(store.getState(), qbId)
      ?.future[0];
    if (!restored) return;
    dispatch(queryHistorySlice.actions.redo({ qbId }));
    getDispatchQueryById(qbId)?.(restored, { fromHistory: true });
  }, [dispatch, qbId, store]);

  const clear = useCallback(() => {
    dispatch(queryHistorySlice.actions.clear({ qbId }));
  }, [dispatch, qbId]);

  const past = entry?.past ?? emptyStack;
  const future = entry?.future ?? emptyStack;

  return useMemo(
    () => ({
      undo,
      redo,
      clear,
      canUndo: past.length > 0,
      canRedo: future.length > 0,
      past,
      future,
    }),
    [clear, future, past, redo, undo]
  );
};
