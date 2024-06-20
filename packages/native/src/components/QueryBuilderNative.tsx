import * as React from 'react';
import { useMemo } from 'react';
import type {
  FullCombinator,
  Controls,
  FullField,
  GetOptionIdentifierType,
  FullOperator,
  Path,
  QueryBuilderContextProps,
  QueryBuilderProps,
  RuleGroupTypeAny,
} from 'react-querybuilder';
import {
  QueryBuilderContext as _QBC,
  QueryBuilderStateContext,
  queryBuilderStore,
  useQueryBuilderSetup,
} from 'react-querybuilder';
import { Provider } from 'react-redux';
import type { QueryBuilderNativeProps } from '../types';
import { defaultNativeControlElements } from './defaults';
import { useQueryBuilderSchemaNative } from './useQueryBuilderSchemaNative';

const rootPath = [] satisfies Path;

const QueryBuilderNativeInternal = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>({
  props,
  setup,
}: {
  props: QueryBuilderNativeProps<RG, F, O, C>;
  setup: ReturnType<typeof useQueryBuilderSetup<RG, F, O, C>>;
}) => {
  const qb = useQueryBuilderSchemaNative<RG, F, O, C>(props, setup);

  const { ruleGroup: RuleGroupComponent } = qb.schema.controls;

  const QueryBuilderContext = _QBC as React.Context<
    QueryBuilderContextProps<F, GetOptionIdentifierType<O>>
  >;

  return (
    <QueryBuilderContext.Provider value={qb.rqbContext}>
      <RuleGroupComponent
        ruleGroup={qb.rootGroup}
        {...qb.combinatorPropObject}
        path={rootPath}
        translations={qb.translations}
        schema={qb.schema}
        actions={qb.actions}
        id={qb.rootGroup.id}
        disabled={qb.rootGroupDisabled}
        parentDisabled={qb.queryDisabled}
        context={props.context}
      />
    </QueryBuilderContext.Provider>
  );
};

export const QueryBuilderNative = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: QueryBuilderNativeProps<RG, F, O, C>
) => {
  const controlElements = useMemo(
    () =>
      ({ ...defaultNativeControlElements, ...props.controlElements }) as Controls<
        F,
        GetOptionIdentifierType<O>
      >,
    [props.controlElements]
  );
  const setup = useQueryBuilderSetup({ ...props, controlElements } as QueryBuilderProps<
    RG,
    F,
    O,
    C
  >);

  return (
    <Provider context={QueryBuilderStateContext} store={queryBuilderStore}>
      <QueryBuilderNativeInternal props={props} setup={setup} />
    </Provider>
  );
};
