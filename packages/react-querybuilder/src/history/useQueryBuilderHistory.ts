import type { Store } from '@reduxjs/toolkit';
import { useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import { QueryBuilderStateContext } from '../redux';
import { getDispatchQuery } from '../redux/_internal';
import { getRqbStore } from '../redux/getRqbStore';
import { getQuerySelectorById } from '../redux/selectors';
import type { RqbState } from '../redux/types';
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
      dispatch(
        queryHistorySlice.actions.register({
          qbId,
          query: getQuerySelectorById(qbId)(store.getState()),
          maxHistory,
          coalesceMs,
        })
      );
      const unsubscribe = store.subscribe(onStoreChange);
      return () => {
        unsubscribe();
        dispatch(queryHistorySlice.actions.unregister({ qbId }));
      };
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
    getDispatchQuery(qbId)?.(restored, { fromHistory: true });
  }, [dispatch, qbId, store]);

  const redo = useCallback(() => {
    const restored = queryHistorySlice.selectors.selectHistoryById(store.getState(), qbId)
      ?.future[0];
    if (!restored) return;
    dispatch(queryHistorySlice.actions.redo({ qbId }));
    getDispatchQuery(qbId)?.(restored, { fromHistory: true });
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
