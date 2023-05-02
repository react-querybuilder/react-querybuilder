import * as React from 'react';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { RuleGroupType, RuleGroupTypeIC } from 'react-querybuilder';
import { QueryBuilderContext, useQueryBuilder } from 'react-querybuilder';
import type { QueryBuilderNativeProps, WithSchemaNative } from '../types';
import { defaultNativeControlElements } from './defaults';

export const QueryBuilderNative = <RG extends RuleGroupType | RuleGroupTypeIC = RuleGroupType>(
  props: QueryBuilderNativeProps<RG>
) => {
  const controlElements = useMemo(
    () => ({ ...defaultNativeControlElements, ...props.controlElements }),
    [props.controlElements]
  );
  const qb = useQueryBuilder({ ...props, controlElements }) as ReturnType<typeof useQueryBuilder> &
    WithSchemaNative;

  qb.schema.styles = useMemo(() => StyleSheet.create(props.styles ?? {}), [props.styles]);

  const { ruleGroup: RuleGroupComponent } = controlElements;

  return (
    <QueryBuilderContext.Provider value={qb.rqbContext}>
      <RuleGroupComponent
        ruleGroup={qb.query}
        path={[]}
        translations={qb.translations}
        schema={qb.schema}
        actions={qb.actions}
      />
    </QueryBuilderContext.Provider>
  );
};

QueryBuilderNative.displayName = 'QueryBuilderNative';
