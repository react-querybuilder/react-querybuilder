import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type {
  Combinator,
  Field,
  Operator,
  RuleGroupTypeAny,
  ToFlexibleOption,
  useQueryBuilderSetup,
} from 'react-querybuilder';
import { useQueryBuilderSchema } from 'react-querybuilder';
import type { QueryBuilderNativeProps, WithSchemaNative } from '../types';

export const useQueryBuilderSchemaNative = <
  RG extends RuleGroupTypeAny,
  F extends ToFlexibleOption<Field>,
  O extends ToFlexibleOption<Operator>,
  C extends ToFlexibleOption<Combinator>
>(
  props: QueryBuilderNativeProps<RG, F, O, C>,
  setup: ReturnType<typeof useQueryBuilderSetup<RG, F, O, C>>
) => {
  const qb = useQueryBuilderSchema(props, setup);

  (qb as WithSchemaNative).schema.styles = useMemo(
    () => StyleSheet.create(props.styles ?? {}),
    [props.styles]
  );

  return qb;
};
