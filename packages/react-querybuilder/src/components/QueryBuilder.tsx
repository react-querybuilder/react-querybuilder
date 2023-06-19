import * as React from 'react';
import { useQueryBuilder } from '../hooks';
import type { QueryBuilderProps, RuleGroupProps, RuleGroupType, RuleGroupTypeIC } from '../types';
import { QueryBuilderContext } from './QueryBuilderContext';

const rootPath: number[] = [];

export const QueryBuilder = <RG extends RuleGroupType | RuleGroupTypeIC>(
  props: QueryBuilderProps<RG>
) => {
  const qb = { ...props, ...useQueryBuilder(props) };

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

QueryBuilder.displayName = 'QueryBuilder';
