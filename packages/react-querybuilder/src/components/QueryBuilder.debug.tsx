import * as React from 'react';
import type {
  FullCombinator,
  FullField,
  FullOperator,
  QueryBuilderProps,
  RuleGroupTypeAny,
} from '../types';
import { QueryBuilderInternal } from './QueryBuilderInternal';
import { QueryBuilderStateProvider } from './QueryBuilderStateProvider.debug';

/**
 * The query builder component for React.
 *
 * See https://react-querybuilder.js.org/ for demos and documentation.
 */
export const QueryBuilder = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: QueryBuilderProps<RG, F, O, C>
): React.JSX.Element => (
  <QueryBuilderStateProvider>
    <QueryBuilderInternal props={props} />
  </QueryBuilderStateProvider>
);
