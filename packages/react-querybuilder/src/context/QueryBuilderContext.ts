import type { Context } from 'react';
import { createContext } from 'react';
import type { QueryBuilderContextProps, RuleGroupTypeAny } from '../types';

interface QueryBuilderContextInternals {
  initialQuery?: RuleGroupTypeAny;
  qbId?: string;
}

interface QueryBuilderContextType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extends QueryBuilderContextProps<any, any>,
    QueryBuilderContextInternals {}

/**
 * Context provider for {@link QueryBuilder}. Any descendant query builders
 * will inherit the props from a context provider.
 */
export const QueryBuilderContext: Context<QueryBuilderContextType> = createContext({});
