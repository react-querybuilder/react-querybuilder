import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type {
  Combinator,
  Field,
  Operator,
  QueryBuilderProps,
  RuleGroupTypeAny,
  useQueryBuilderSetup,
} from 'react-querybuilder';
import { useQueryBuilderSchema } from 'react-querybuilder';
import type { QueryBuilderNativeProps, WithSchemaNative } from '../types';

export const useQueryBuilderSchemaNative = <
  RG extends RuleGroupTypeAny,
  F extends Field,
  O extends Operator,
  C extends Combinator,
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
