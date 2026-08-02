import type { QueryHistoryOptions } from '@react-querybuilder/core';
import { defaultCoalesceMs, defaultMaxHistory } from '@react-querybuilder/core';
import * as React from 'react';

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
