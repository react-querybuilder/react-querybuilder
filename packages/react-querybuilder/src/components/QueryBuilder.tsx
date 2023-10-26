import * as React from 'react';
import { Provider } from 'react-redux';
import { useQueryBuilderSchema, useQueryBuilderSetup } from '../hooks';
import { RqbStateContext, queryBuilderStore } from '../redux';
import type {
  Path,
  QueryBuilderProps,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
} from '../types';
import { QueryBuilderContext } from './QueryBuilderContext';

const rootPath = [] satisfies Path;

/**
 * The query builder component for React.
 *
 * See https://react-querybuilder.js.org/ for demos and documentation.
 */
export const QueryBuilder = <RG extends RuleGroupType | RuleGroupTypeIC>(
  props: QueryBuilderProps<RG>
) => {
  const setup = useQueryBuilderSetup(props);

  return (
    <Provider context={RqbStateContext} store={queryBuilderStore}>
      <QueryBuilderInternal {...props} setup={setup} />
    </Provider>
  );
};

QueryBuilder.displayName = 'QueryBuilder';

const QueryBuilderInternal = <RG extends RuleGroupType | RuleGroupTypeIC>(
  allProps: QueryBuilderProps<RG> & {
    setup: ReturnType<typeof useQueryBuilderSetup>;
  }
) => {
  const { setup, ...props } = allProps;
  const qb = {
    ...props,
    ...useQueryBuilderSchema(props as QueryBuilderProps<RuleGroupTypeAny>, setup),
  };

  const RuleGroupControlElement = qb.schema.controls.ruleGroup;

  return (
    <QueryBuilderContext.Provider key={qb.dndEnabledAttr} value={qb.rqbContext}>
      <div
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
          parentDisabled={qb.queryDisabled}
          context={qb.context}
        />
      </div>
    </QueryBuilderContext.Provider>
  );
};
