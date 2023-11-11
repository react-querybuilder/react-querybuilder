import * as React from 'react';
import { Provider } from 'react-redux';
import { useQueryBuilderSchema, useQueryBuilderSetup } from '../hooks';
import { QueryBuilderStateContext, queryBuilderStore } from '../redux';
import type {
  Combinator,
  Field,
  Operator,
  Path,
  QueryBuilderProps,
  RuleGroupTypeAny,
  ToFlexibleOption,
} from '../types';
import { QueryBuilderContext } from './QueryBuilderContext';

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
  F extends ToFlexibleOption<Field>,
  O extends ToFlexibleOption<Operator>,
  C extends ToFlexibleOption<Combinator>
>({
  setup,
  props,
}: {
  props: QueryBuilderProps<RG, F, O, C>;
  setup: ReturnType<typeof useQueryBuilderSetup<RG, F, O, C>>;
}) => {
  const qb = useQueryBuilderSchema(props, setup);

  const RuleGroupControlElement = qb.schema.controls.ruleGroup;

  return (
    <QueryBuilderContext.Provider key={qb.dndEnabledAttr} value={qb.rqbContext}>
      <div
        role="form"
        className={qb.wrapperClassName}
        data-dnd={qb.dndEnabledAttr}
        data-inlinecombinators={qb.inlineCombinatorsAttr}>
        <RuleGroupControlElement
          translations={qb.translations}
          ruleGroup={qb.rootQuery}
          rules={qb.rootQuery.rules}
          {...qb.combinatorPropObject}
          not={!!qb.rootQuery.not}
          schema={qb.schema}
          actions={qb.actions}
          id={qb.rootQuery.id}
          path={rootPath}
          disabled={!!qb.rootQuery.disabled || qb.queryDisabled}
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
  F extends ToFlexibleOption<Field>,
  O extends ToFlexibleOption<Operator>,
  C extends ToFlexibleOption<Combinator>
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
