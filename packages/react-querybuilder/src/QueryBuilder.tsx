import { QueryBuilderBase } from './QueryBuilderBase';
import { QueryBuilderWithDndProvider } from './QueryBuilderDnD';
import type { QueryBuilderProps, RuleGroupType, RuleGroupTypeIC } from './types';

export const QueryBuilder = <RG extends RuleGroupType | RuleGroupTypeIC>(
  props: QueryBuilderProps<RG>
) => {
  const key = props.enableDragAndDrop ? 'dnd' : 'no-dnd';
  if (props.enableDragAndDrop) {
    return <QueryBuilderWithDndProvider key={key} {...(props as QueryBuilderProps)} />;
  }

  return <QueryBuilderBase key={key} {...(props as QueryBuilderProps)} />;
};

QueryBuilder.displayName = 'QueryBuilder';
