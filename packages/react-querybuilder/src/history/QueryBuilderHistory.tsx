import * as React from 'react';
import { useContext, useMemo } from 'react';
import { QueryBuilderContext } from '../components/QueryBuilderContext';
import type { QueryBuilderContextProps } from '../types';
import { QueryBuilderHistoryContext } from './QueryBuilderHistoryContext';
import { defaultCoalesceMs, defaultMaxHistory } from './queryHistorySlice';
import type { QueryHistoryOptions } from './types';
import { UndoRedoActions } from './UndoRedoActions';

export interface QueryBuilderHistoryProps extends QueryHistoryOptions {
  children?: React.ReactNode;
}

/**
 * Enables undo/redo history for descendant {@link QueryBuilder} components.
 *
 * Supplies the undo/redo controls rendered by the `showUndoRedo` prop, in the same way that
 * `QueryBuilderDnD` supplies its drag-and-drop-aware subcomponents. Importing this component
 * (or {@link useQueryBuilderHistory}) is also what injects the history slice into React Query
 * Builder's internal Redux store, so applications that do not use undo/redo pay nothing for it.
 *
 * ```tsx
 * <QueryBuilderHistory maxHistory={50} coalesceMs={500}>
 *   <QueryBuilder qbId="main" showUndoRedo />
 * </QueryBuilderHistory>
 * ```
 *
 * @group Components
 */
export const QueryBuilderHistory = (props: QueryBuilderHistoryProps): React.JSX.Element => {
  const { maxHistory = defaultMaxHistory, coalesceMs = defaultCoalesceMs } = props;
  const rqbContext = useContext(QueryBuilderContext);

  const historyContextValue = useMemo(
    () => ({ maxHistory, coalesceMs, historyEnabled: true }),
    [maxHistory, coalesceMs]
  );

  // Supply the undo/redo controls without disturbing any other context overrides, and without
  // overriding a custom `undoRedoActions` component that the consumer has already provided.
  const newRqbContext = useMemo(
    (): QueryBuilderContextProps => ({
      ...rqbContext,
      controlElements: {
        undoRedoActions: UndoRedoActions,
        ...rqbContext.controlElements,
      },
    }),
    [rqbContext]
  );

  return (
    <QueryBuilderHistoryContext.Provider value={historyContextValue}>
      <QueryBuilderContext.Provider value={newRqbContext}>
        {props.children}
      </QueryBuilderContext.Provider>
    </QueryBuilderHistoryContext.Provider>
  );
};
