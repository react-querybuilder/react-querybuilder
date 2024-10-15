import * as React from 'react';
import { Provider } from 'react-redux';
import { QueryBuilderContext as _QBC } from '../context';
import { QueryBuilderStateContext, queryBuilderStore } from '../redux';
import type {
  FullCombinator,
  FullField,
  FullOperator,
  GetOptionIdentifierType,
  Path,
  QueryBuilderContextProps,
  QueryBuilderProps,
  RuleGroupTypeAny,
} from '../types';
import type { UseQueryBuilderSchema } from './QueryBuilder.useQueryBuilderSchema';
import { useQueryBuilderSchema } from './QueryBuilder.useQueryBuilderSchema';
import { useQueryBuilderSetup } from './QueryBuilder.useQueryBuilderSetup';

/**
 * The {@link Path} of the root group.
 */
export const rootPath: Path = [] satisfies Path;

/**
 * Context provider for the `{@link QueryBuilder}` state store.
 */
export const QueryBuilderStateProvider = (props: {
  children: React.ReactNode;
}): React.JSX.Element => (
  <Provider context={QueryBuilderStateContext} store={queryBuilderStore}>
    {props.children}
  </Provider>
);

const QueryBuilderInternal = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>({
  props,
}: {
  props: QueryBuilderProps<RG, F, O, C>;
}) => {
  const qb = useQueryBuilder<RG, F, O, C>(props);

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
          context={props.context}
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
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: QueryBuilderProps<RG, F, O, C>
): React.JSX.Element => (
  <QueryBuilderStateProvider>
    <QueryBuilderInternal props={props} />
  </QueryBuilderStateProvider>
);

/**
 * Calls {@link useQueryBuilderSetup} to massage the props and prepare basic
 * update/generate methods, then passes the result to {@link useQueryBuilderSchema}
 * to prepare and return all values required to render {@link QueryBuilder}.
 */
export const useQueryBuilder = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: QueryBuilderProps<RG, F, O, C>
): UseQueryBuilderSchema<RG, F, O, C> =>
  useQueryBuilderSchema<RG, F, O, C>(props, useQueryBuilderSetup(props));
