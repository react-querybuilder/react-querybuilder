import * as React from 'react';
import { useMemo } from 'react';
import { QueryBuilderHistoryContext } from './QueryBuilderHistoryContext';
import { defaultCoalesceMs, defaultMaxHistory } from './queryHistorySlice';
import type { QueryHistoryOptions } from './types';

export interface QueryBuilderHistoryProps extends QueryHistoryOptions {
  children?: React.ReactNode;
}

/**
 * Enables undo/redo history for descendant {@link QueryBuilder} components.
 *
 * Importing this component (or {@link useQueryBuilderHistory}) is what injects the history
 * slice into React Query Builder's internal Redux store, so applications that do not use
 * undo/redo pay nothing for it.
 *
 * ```tsx
 * <QueryBuilderHistory maxHistory={50} coalesceMs={500}>
 *   <QueryBuilder qbId="main" />
 * </QueryBuilderHistory>
 * ```
 *
 * @group Components
 */
export const QueryBuilderHistory = (props: QueryBuilderHistoryProps): React.JSX.Element => {
  const { maxHistory = defaultMaxHistory, coalesceMs = defaultCoalesceMs } = props;

  const contextValue = useMemo(
    () => ({ maxHistory, coalesceMs, historyEnabled: true }),
    [maxHistory, coalesceMs]
  );

  return (
    <QueryBuilderHistoryContext.Provider value={contextValue}>
      {props.children}
    </QueryBuilderHistoryContext.Provider>
  );
};
