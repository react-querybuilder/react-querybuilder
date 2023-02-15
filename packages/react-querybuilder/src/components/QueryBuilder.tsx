import { QueryBuilderContext } from '@react-querybuilder/ctx';
import type { QueryBuilderProps, RuleGroupType, RuleGroupTypeIC } from '@react-querybuilder/ts';
import { useQueryBuilder } from '../hooks';

export const QueryBuilder = <RG extends RuleGroupType | RuleGroupTypeIC>(
  props: QueryBuilderProps<RG>
) => {
  const qb = { ...props, ...useQueryBuilder(props) };

  const { ruleGroup: RuleGroupControlElement } = qb.schema.controls;

  return (
    <QueryBuilderContext.Provider
      key={qb.schema.enableDragAndDrop ? 'dnd' : 'no-dnd'}
      value={qb.rqbContext}>
      <div
        className={qb.wrapperClassName}
        data-dnd={qb.schema.enableDragAndDrop ? 'enabled' : 'disabled'}
        data-inlinecombinators={
          qb.schema.independentCombinators || qb.schema.showCombinatorsBetweenRules
            ? 'enabled'
            : 'disabled'
        }>
        <RuleGroupControlElement
          translations={qb.translations}
          ruleGroup={qb.query}
          rules={qb.query.rules}
          combinator={'combinator' in qb.query ? qb.query.combinator : undefined}
          not={!!qb.query.not}
          schema={qb.schema}
          actions={qb.actions}
          id={qb.query.id}
          path={[]}
          disabled={!!qb.query.disabled || qb.queryDisabled}
          parentDisabled={qb.queryDisabled}
          context={qb.context}
        />
      </div>
    </QueryBuilderContext.Provider>
  );
};

QueryBuilder.displayName = 'QueryBuilder';
