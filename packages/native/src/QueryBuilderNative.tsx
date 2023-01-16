import { QueryBuilderContext } from '@react-querybuilder/ctx';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { RuleGroupType, RuleGroupTypeIC } from 'react-querybuilder';
import { useQueryBuilder } from 'react-querybuilder';
import { defaultNativeControlElements } from './defaults';
import { RuleGroupNative } from './RuleGroupNative';
import type { QueryBuilderNativeProps, WithSchemaNative } from './types';

export const QueryBuilderNative = <RG extends RuleGroupType | RuleGroupTypeIC = RuleGroupType>(
  props: QueryBuilderNativeProps<RG>
) => {
  const controlElements = { ...defaultNativeControlElements, ...props.controlElements };
  const qb = useQueryBuilder({ ...props, controlElements }) as ReturnType<typeof useQueryBuilder> &
    WithSchemaNative;

  qb.schema.styles = useMemo(() => StyleSheet.create(props.styles ?? {}), [props.styles]);

  return (
    <QueryBuilderContext.Provider value={qb.rqbContext}>
      <RuleGroupNative
        ruleGroup={qb.query}
        path={[]}
        translations={qb.translations}
        schema={qb.schema}
        actions={qb.actions}
      />
    </QueryBuilderContext.Provider>
  );
};
