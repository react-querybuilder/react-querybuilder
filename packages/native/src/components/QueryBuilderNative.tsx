import * as React from 'react';
import { useMemo } from 'react';
import type {
  Controls,
  FullCombinator,
  FullField,
  FullOperator,
  GetOptionIdentifierType,
  Path,
  QueryBuilderContextProps,
  RuleGroupTypeAny,
} from 'react-querybuilder';
import {
  QueryBuilderContext as _QBC,
  QueryBuilderStateContext,
  queryBuilderStore,
} from 'react-querybuilder';
import { Provider } from 'react-redux';
import type { QueryBuilderNativeProps } from '../types';
import { defaultNativeControlElements } from './defaults';
import { useQueryBuilderNative } from './useQueryBuilderNative';

const rootPath = [] satisfies Path;

const QueryBuilderNativeInternal = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>({
  props,
}: {
  props: QueryBuilderNativeProps<RG, F, O, C>;
}) => {
  const controlElements = useMemo(
    () =>
      ({ ...defaultNativeControlElements, ...props.controlElements }) as Controls<
        F,
        GetOptionIdentifierType<O>
      >,
    [props.controlElements]
  );
  const qb = useQueryBuilderNative({ ...props, controlElements } as QueryBuilderNativeProps<
    RG,
    F,
    O,
    C
  >);

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

/**
 * An implementation of react-querybuilder for React Native.
 *
 * @group Components
 */
export const QueryBuilderNative = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: QueryBuilderNativeProps<RG, F, O, C>
): React.JSX.Element => (
  <Provider context={QueryBuilderStateContext} store={queryBuilderStore}>
    <QueryBuilderNativeInternal props={props} />
  </Provider>
);
