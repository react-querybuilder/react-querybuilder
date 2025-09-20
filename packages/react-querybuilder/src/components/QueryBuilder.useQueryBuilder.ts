import type {
  FullCombinator,
  FullField,
  FullOperator,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import type { QueryBuilderProps } from '../types';
import type { UseQueryBuilderSchema } from './QueryBuilder.useQueryBuilderSchema';
import { useQueryBuilderSchema } from './QueryBuilder.useQueryBuilderSchema';
import { useQueryBuilderSetup } from './QueryBuilder.useQueryBuilderSetup';

/**
 * Calls {@link useQueryBuilderSetup} to massage the props and prepare basic
 * update/generate methods, then passes the result to {@link useQueryBuilderSchema}
 * to prepare and return all values required to render {@link QueryBuilder}.
 *
 * @group Hooks
 */
export const useQueryBuilder = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: QueryBuilderProps<RG, F, O, C>
): UseQueryBuilderSchema<RG, F, O, C> =>
  useQueryBuilderSchema<RG, F, O, C>(props, useQueryBuilderSetup(props));
