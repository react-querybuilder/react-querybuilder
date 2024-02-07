import * as React from 'react';
import { Provider } from 'react-redux';
import { useQueryBuilderSchema, useQueryBuilderSetup } from '../hooks';
import { QueryBuilderStateContext, queryBuilderStore } from '../redux';
import type {
  Combinator,
  FullField,
  GetOptionIdentifierType,
  Operator,
  Path,
  QueryBuilderContextProps,
  QueryBuilderProps,
  RuleGroupTypeAny,
} from '../types';
import { QueryBuilderContext as _QBC } from './QueryBuilderContext';

/**
 * The {@link Path} of the root group.
 */
export const rootPath = [] satisfies Path;

/**
 * Context provider for the `{@link QueryBuilder}` state store.
 */
export const QueryBuilderStateProvider = ({ children }: { children: React.ReactNode }) => (
  <Provider context={QueryBuilderStateContext} store={queryBuilderStore}>
    {children}
  </Provider>
);

const QueryBuilderInternal = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends Operator,
  C extends Combinator,
>({
  setup,
  props,
}: {
  props: QueryBuilderProps<RG, F, O, C>;
  setup: ReturnType<typeof useQueryBuilderSetup<RG, F, O, C>>;
}) => {
  const qb = useQueryBuilderSchema<RG, F, O, C>(props, setup);

  const RuleGroupControlElement = qb.schema.controls.ruleGroup;

  const QueryBuilderContext = _QBC as React.Context<
    QueryBuilderContextProps<F, GetOptionIdentifierType<O>>
  >;

  return (
    <QueryBuilderContext.Provider key={qb.dndEnabledAttr} value={qb.rqbContext}>
      <div
        role="form"
        className={qb.wrapperClassName}
        data-dnd={qb.dndEnabledAttr}
        data-inlinecombinators={qb.inlineCombinatorsAttr}>
        <RuleGroupControlElement
          translations={qb.translations}
          ruleGroup={qb.rootGroup}
          rules={qb.rootGroup.rules}
          {...qb.combinatorPropObject}
          not={!!qb.rootGroup.not}
          schema={qb.schema}
          actions={qb.actions}
          id={qb.rootGroup.id}
          path={rootPath}
          disabled={qb.rootGroupDisabled}
          shiftUpDisabled
          shiftDownDisabled
          parentDisabled={qb.queryDisabled}
          context={qb.context}
        />
      </div>
    </QueryBuilderContext.Provider>
  );
};

/**
 * The query builder component for React.
 *
 * See https://react-querybuilder.js.org/ for demos and documentation.
 */
export const QueryBuilder = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends Operator,
  C extends Combinator,
>(
  props: QueryBuilderProps<RG, F, O, C>
) => {
  const setup = useQueryBuilderSetup(props);

  return (
    <QueryBuilderStateProvider>
      <QueryBuilderInternal props={props} setup={setup} />
    </QueryBuilderStateProvider>
  );
};

QueryBuilder.displayName = 'QueryBuilder';
