import { configureStore } from '@reduxjs/toolkit';
import * as React from 'react';
import { Provider } from 'react-redux';
import { useCreateReduxSlice, useQueryBuilder, useQueryBuilderSetup } from '../hooks';
import type {
  QueryBuilderProps,
  RuleGroupProps,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
} from '../types';
import { prepareRuleGroup, useControlledOrUncontrolled } from '../utils';
import { QueryBuilderContext } from './QueryBuilderContext';

const rootPath: number[] = [];

export const QueryBuilder = <RG extends RuleGroupType | RuleGroupTypeIC>(
  props: QueryBuilderProps<RG>
) => {
  const firstRender = React.useRef(true);

  const setup = useQueryBuilderSetup(props);
  const { query, defaultQuery, idGenerator } = props;
  const firstQueryProp = React.useRef(query ?? defaultQuery);
  const initialQuery = React.useRef<RG>(
    firstQueryProp.current
      ? prepareRuleGroup(firstQueryProp.current, { idGenerator })
      : setup.createRuleGroup()
  );

  useControlledOrUncontrolled({
    defaultQuery,
    queryProp: query,
    isFirstRender: firstRender.current,
  });

  const { reducer: queryReducer, actions } = useCreateReduxSlice(initialQuery.current);

  const store = React.useRef(
    firstRender.current
      ? configureStore({ reducer: { query: queryReducer } })
      : (null as unknown as ReturnType<typeof configureStore>)
  );

  if (firstRender.current) {
    firstRender.current = false;
  }

  return (
    <Provider store={store.current}>
      <QueryBuilderInternal {...props} setup={setup} actions={actions} />
    </Provider>
  );
};

QueryBuilder.displayName = 'QueryBuilder';

const QueryBuilderInternal = <RG extends RuleGroupType | RuleGroupTypeIC>(
  allProps: QueryBuilderProps<RG> & {
    setup: ReturnType<typeof useQueryBuilderSetup>;
    actions: ReturnType<typeof useCreateReduxSlice>['actions'];
  }
) => {
  const { actions, setup, ...props } = allProps;
  const qb = {
    ...props,
    ...useQueryBuilder(props as QueryBuilderProps<RuleGroupTypeAny>, setup, actions),
  };

  const RuleGroupControlElement = qb.schema.controls.ruleGroup;
  const dndEnabled = qb.schema.enableDragAndDrop ? 'enabled' : 'disabled';
  const inlinecombinators =
    qb.schema.independentCombinators || qb.schema.showCombinatorsBetweenRules
      ? 'enabled'
      : 'disabled';
  const combinatorPropObject: Pick<RuleGroupProps, 'combinator'> =
    'combinator' in qb.query ? { combinator: qb.query.combinator } : {};

  return (
    <QueryBuilderContext.Provider key={dndEnabled} value={qb.rqbContext}>
      <div
        className={qb.wrapperClassName}
        data-dnd={dndEnabled}
        data-inlinecombinators={inlinecombinators}>
        <RuleGroupControlElement
          translations={qb.translations}
          ruleGroup={qb.query}
          rules={qb.query.rules}
          {...combinatorPropObject}
          not={!!qb.query.not}
          schema={qb.schema}
          actions={qb.actions}
          id={qb.query.id}
          path={rootPath}
          disabled={!!qb.query.disabled || qb.queryDisabled}
          parentDisabled={qb.queryDisabled}
          context={qb.context}
        />
      </div>
    </QueryBuilderContext.Provider>
  );
};
