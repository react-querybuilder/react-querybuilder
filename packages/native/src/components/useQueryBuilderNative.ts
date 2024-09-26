import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type {
  FullCombinator,
  FullField,
  FullOperator,
  GetOptionIdentifierType,
  QueryBuilderProps,
  RuleGroupTypeAny,
} from 'react-querybuilder';
import { useQueryBuilderSetup } from 'react-querybuilder';
import { useQueryBuilderSchema } from 'react-querybuilder';
import type { QueryBuilderNativeProps, SchemaNative } from '../types';

export const useQueryBuilderNative = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: QueryBuilderNativeProps<RG, F, O, C>
): ReturnType<typeof useQueryBuilderSchema<RG, F, O, C>> =>
  useQueryBuilderSchemaNative(props, useQueryBuilderSetup(props as QueryBuilderProps<RG, F, O, C>));

export const useQueryBuilderSchemaNative = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: QueryBuilderNativeProps<RG, F, O, C>,
  setup: ReturnType<typeof useQueryBuilderSetup<RG, F, O, C>>
): ReturnType<typeof useQueryBuilderSchema<RG, F, O, C>> & {
  schema: SchemaNative<F, GetOptionIdentifierType<O>>;
} => {
  const qb = useQueryBuilderSchema<RG, F, O, C>(props as QueryBuilderProps<RG, F, O, C>, setup);

  const styles = useMemo(() => StyleSheet.create(props.styles ?? {}), [props.styles]);

  return { ...qb, schema: { ...qb.schema, styles } };
};
