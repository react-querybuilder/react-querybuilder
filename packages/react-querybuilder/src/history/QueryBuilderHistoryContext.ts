import * as React from 'react';
import { defaultCoalesceMs, defaultMaxHistory } from './queryHistorySlice';
import type { QueryHistoryOptions } from './types';

export interface QueryBuilderHistoryContextProps extends Required<QueryHistoryOptions> {
  /** `true` when a {@link QueryBuilderHistory} provider is present. */
  historyEnabled: boolean;
}

export const defaultQueryBuilderHistoryContext: QueryBuilderHistoryContextProps = {
  maxHistory: defaultMaxHistory,
  coalesceMs: defaultCoalesceMs,
  historyEnabled: false,
};

/**
 * Provides undo/redo options to descendants of {@link QueryBuilderHistory}.
 */
export const QueryBuilderHistoryContext: React.Context<QueryBuilderHistoryContextProps> =
  React.createContext<QueryBuilderHistoryContextProps>(defaultQueryBuilderHistoryContext);
