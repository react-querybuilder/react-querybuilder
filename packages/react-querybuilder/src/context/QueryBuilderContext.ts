import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import type { Context } from 'react';
import { createContext } from 'react';
import type { QueryBuilderContextProps } from '../types';

interface QueryBuilderContextInternals {
  initialQuery?: RuleGroupTypeAny;
  qbId?: string;
}

interface QueryBuilderContextType
  // oxlint-disable-next-line typescript/no-explicit-any
  extends QueryBuilderContextProps<any, any>,
    QueryBuilderContextInternals {}

/**
 * Context provider for {@link QueryBuilder}. Any descendant query builders
 * will inherit the props from a context provider.
 */
export const QueryBuilderContext: Context<QueryBuilderContextType> = createContext({});
