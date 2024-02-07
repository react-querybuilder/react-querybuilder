import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type {
  FullCombinator,
  FullField,
  FullOperator,
  QueryBuilderProps,
  RuleGroupTypeAny,
  useQueryBuilderSetup,
} from 'react-querybuilder';
import { useQueryBuilderSchema } from 'react-querybuilder';
import type { QueryBuilderNativeProps, WithSchemaNative } from '../types';

export const useQueryBuilderSchemaNative = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: QueryBuilderNativeProps<RG, F, O, C>,
  setup: ReturnType<typeof useQueryBuilderSetup<RG, F, O, C>>
) => {
  const qb = useQueryBuilderSchema<RG, F, O, C>(props as QueryBuilderProps<RG, F, O, C>, setup);

  (qb as WithSchemaNative).schema.styles = useMemo(
    () => StyleSheet.create(props.styles ?? {}),
    [props.styles]
  );

  return qb;
};
