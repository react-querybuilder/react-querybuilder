import { createContext } from 'react';
import type { QueryBuilderContextProps } from '../types';

/**
 * Context provider for {@link QueryBuilder}. Any descendant query builders
 * will inherit the props from a context provider.
 */
export const QueryBuilderContext = createContext<QueryBuilderContextProps>({});

QueryBuilderContext.displayName = 'QueryBuilderContext';
