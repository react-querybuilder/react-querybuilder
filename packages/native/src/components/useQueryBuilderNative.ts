import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type {
  FullCombinator,
  FullField,
  FullOperator,
  GetOptionIdentifierType,
  QueryBuilderProps,
  RuleGroupTypeAny,
  UseQueryBuilderSchema,
  UseQueryBuilderSetup,
} from 'react-querybuilder';
import { useQueryBuilderSchema, useQueryBuilderSetup } from 'react-querybuilder';
import type { QueryBuilderNativeProps, SchemaNative } from '../types';

/**
 * @group Hooks
 */
export const useQueryBuilderNative = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: QueryBuilderNativeProps<RG, F, O, C>
): UseQueryBuilderSchema<RG, F, O, C> =>
  useQueryBuilderSchemaNative(props, useQueryBuilderSetup(props as QueryBuilderProps<RG, F, O, C>));

/**
 * @group Hooks
 */
export const useQueryBuilderSchemaNative = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: QueryBuilderNativeProps<RG, F, O, C>,
  setup: UseQueryBuilderSetup<RG, F, O, C>
): UseQueryBuilderSchema<RG, F, O, C> & {
  schema: SchemaNative<F, GetOptionIdentifierType<O>>;
} => {
  const qb = useQueryBuilderSchema<RG, F, O, C>(props, setup);

  const styles = useMemo(() => StyleSheet.create(props.styles ?? {}), [props.styles]);

  const schema: SchemaNative<F, GetOptionIdentifierType<O>> = { ...qb.schema, styles };

  // Not spread: `{ ...qb, schema }` forces a ~0.5s structural compare vs the return type
  return Object.assign({}, qb, { schema });
};
