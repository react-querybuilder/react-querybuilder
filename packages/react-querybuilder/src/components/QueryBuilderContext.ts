import { createContext } from 'react';
import type { QueryBuilderContextProps } from '../types';

/**
 * Context provider for {@link QueryBuilder}. Any descendant query builders
 * will inherit the props from a context provider.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const QueryBuilderContext = createContext<QueryBuilderContextProps<any, any>>({});
