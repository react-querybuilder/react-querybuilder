import type {
  FullCombinator,
  FullField,
  FullOperator,
  QueryBuilderProps,
  RuleGroupTypeAny,
} from '../types';
import { useQueryBuilderSchema } from './useQueryBuilderSchema';
import { useQueryBuilderSetup } from './useQueryBuilderSetup';

export const useQueryBuilder = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: QueryBuilderProps<RG, F, O, C>
) => useQueryBuilderSchema<RG, F, O, C>(props, useQueryBuilderSetup(props));
