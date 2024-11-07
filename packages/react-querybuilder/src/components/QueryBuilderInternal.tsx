import * as React from 'react';
import { QueryBuilderContext as _QBC } from '../context';
import type {
  FullCombinator,
  FullField,
  FullOperator,
  GetOptionIdentifierType,
  QueryBuilderContextProps,
  QueryBuilderProps,
  RuleGroupTypeAny,
} from '../types';
import { rootPath } from '../defaults';
import { useQueryBuilder } from './QueryBuilder.useQueryBuilder';

export const QueryBuilderInternal = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>({
  props,
}: {
  props: QueryBuilderProps<RG, F, O, C>;
}): React.JSX.Element => {
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
