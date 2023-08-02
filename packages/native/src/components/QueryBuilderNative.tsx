import * as React from 'react';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { Path, RuleGroupType, RuleGroupTypeAny, RuleGroupTypeIC } from 'react-querybuilder';
import {
  QueryBuilderContext,
  queryBuilderStore,
  useQueryBuilderSchema,
  useQueryBuilderSetup,
} from 'react-querybuilder';
import { Provider } from 'react-redux';
import type { QueryBuilderNativeProps, WithSchemaNative } from '../types';
import { defaultNativeControlElements } from './defaults';

const rootPath = [] satisfies Path;

export const QueryBuilderNative = <RG extends RuleGroupType | RuleGroupTypeIC>(
  props: QueryBuilderNativeProps<RG>
) => {
  const controlElements = useMemo(
    () => ({ ...defaultNativeControlElements, ...props.controlElements }),
    [props.controlElements]
  );
  const setup = useQueryBuilderSetup({ ...props, controlElements });

  return (
    <Provider store={queryBuilderStore}>
      <QueryBuilderNativeInternal {...props} setup={setup} />
    </Provider>
  );
};

const QueryBuilderNativeInternal = <RG extends RuleGroupType | RuleGroupTypeIC>(
  allProps: QueryBuilderNativeProps<RG> & {
    setup: ReturnType<typeof useQueryBuilderSetup>;
  }
) => {
  const { setup, ...props } = allProps;
  const qb = {
    ...props,
    ...(useQueryBuilderSchema(
      props as QueryBuilderNativeProps<RuleGroupTypeAny>,
      setup
    ) as ReturnType<typeof useQueryBuilderSchema> & WithSchemaNative),
  };

  qb.schema.styles = useMemo(() => StyleSheet.create(allProps.styles ?? {}), [allProps.styles]);

  const { ruleGroup: RuleGroupComponent } = qb.schema.controls;

  return (
    <QueryBuilderContext.Provider value={qb.rqbContext}>
      <RuleGroupComponent
        ruleGroup={qb.rootQuery}
        {...qb.combinatorPropObject}
        path={rootPath}
        translations={qb.translations}
        schema={qb.schema}
        actions={qb.actions}
        id={qb.rootQuery.id}
        disabled={!!qb.rootQuery.disabled || qb.queryDisabled}
        parentDisabled={qb.queryDisabled}
        context={qb.context}
      />
    </QueryBuilderContext.Provider>
  );
};

QueryBuilderNative.displayName = 'QueryBuilderNative';
