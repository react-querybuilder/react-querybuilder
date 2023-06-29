import * as React from 'react';
import { Provider } from 'react-redux';
import { useQueryBuilder, useQueryBuilderSetup } from '../hooks';
import type { RootState } from '../redux';
import { getReduxQuery, setReduxQuery, store, useAppSelector } from '../redux';
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
  const initialQuery = React.useRef<RG>(
    prepareRuleGroup(query ?? defaultQuery ?? setup.createRuleGroup(), { idGenerator })
  );

  React.useEffect(() => {
    store.dispatch(setReduxQuery({ qbId: setup.qbId, query: initialQuery.current }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useControlledOrUncontrolled({
    defaultQuery,
    queryProp: query,
    isFirstRender: firstRender.current,
  });

  if (firstRender.current) {
    firstRender.current = false;
  }

  return (
    <Provider store={store}>
      <QueryBuilderInternal {...props} setup={setup} initialQuery={initialQuery.current} />
    </Provider>
  );
};

QueryBuilder.displayName = 'QueryBuilder';

const QueryBuilderInternal = <RG extends RuleGroupType | RuleGroupTypeIC>(
  allProps: QueryBuilderProps<RG> & {
    setup: ReturnType<typeof useQueryBuilderSetup>;
    initialQuery: RG;
  }
) => {
  const { initialQuery, setup, ...props } = allProps;
  const querySelector = React.useCallback(
    (state: RootState) => getReduxQuery(state, setup.qbId),
    [setup.qbId]
  );
  const reduxQuery = useAppSelector(querySelector);
  const rootQuery = props.query ?? reduxQuery ?? props.defaultQuery ?? initialQuery;
  const qb = {
    ...props,
    ...useQueryBuilder(props as QueryBuilderProps<RuleGroupTypeAny>, setup),
  };

  const RuleGroupControlElement = qb.schema.controls.ruleGroup;
  const dndEnabled = qb.schema.enableDragAndDrop ? 'enabled' : 'disabled';
  const inlinecombinators =
    qb.schema.independentCombinators || qb.schema.showCombinatorsBetweenRules
      ? 'enabled'
      : 'disabled';
  const combinatorPropObject: Pick<RuleGroupProps, 'combinator'> =
    'combinator' in rootQuery ? { combinator: rootQuery.combinator } : {};

  return (
    <QueryBuilderContext.Provider key={dndEnabled} value={qb.rqbContext}>
      <div
        className={qb.wrapperClassName}
        data-dnd={dndEnabled}
        data-inlinecombinators={inlinecombinators}>
        <RuleGroupControlElement
          translations={qb.translations}
          ruleGroup={rootQuery}
          rules={rootQuery.rules}
          {...combinatorPropObject}
          not={!!rootQuery.not}
          schema={qb.schema}
          actions={qb.actions}
          id={rootQuery.id}
          path={rootPath}
          disabled={!!rootQuery.disabled || qb.queryDisabled}
          parentDisabled={qb.queryDisabled}
          context={qb.context}
        />
      </div>
    </QueryBuilderContext.Provider>
  );
};
