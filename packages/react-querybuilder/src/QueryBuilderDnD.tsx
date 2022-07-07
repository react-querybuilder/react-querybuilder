import { getRuleGroupWithDndWrapper, getRuleWithDndWrapper } from './internal';
import { useReactDnD } from './internal/hooks';
import { QueryBuilderBase } from './QueryBuilderBase';
import type { QueryBuilderProps, RuleGroupType, RuleGroupTypeIC } from './types';

export const QueryBuilderWithDndProvider = (
  props: QueryBuilderProps<RuleGroupType | RuleGroupTypeIC>
) => {
  const dnd = useReactDnD(props.dnd);
  const key = dnd ? 'dnd' : 'no-dnd';

  if (!dnd) {
    return <QueryBuilderBase key={key} {...props} />;
  }

  const { DndProvider, HTML5Backend } = dnd;

  return (
    <DndProvider key={key} backend={HTML5Backend} debugMode={props.debugMode}>
      <QueryBuilderWithoutDndProvider {...{ ...props, dnd }} />
    </DndProvider>
  );
};

QueryBuilderWithDndProvider.displayName = 'QueryBuilderWithDndProvider';

export const QueryBuilderWithoutDndProvider = (
  props: QueryBuilderProps<RuleGroupType | RuleGroupTypeIC>
) => {
  const dnd = useReactDnD(props.dnd);
  const key = dnd ? 'dnd' : 'no-dnd';

  if (!dnd) {
    return <QueryBuilderBase key={key} {...props} />;
  }

  const ruleGroup = getRuleGroupWithDndWrapper(props.controlElements?.ruleGroup);
  const rule = getRuleWithDndWrapper(props.controlElements?.rule);

  const newProps: QueryBuilderProps<RuleGroupType | RuleGroupTypeIC> = {
    ...props,
    dnd,
    controlElements: { ...props.controlElements, ruleGroup, rule },
  };

  const { DndContext } = dnd;

  return (
    <DndContext.Consumer key={key}>
      {() => <QueryBuilderBase key={key} {...newProps} />}
    </DndContext.Consumer>
  );
};

QueryBuilderWithoutDndProvider.displayName = 'QueryBuilderWithoutDndProvider';
