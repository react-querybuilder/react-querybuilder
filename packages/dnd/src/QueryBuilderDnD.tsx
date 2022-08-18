import type {
  InlineCombinatorProps,
  QueryBuilderProps,
  RuleGroupType,
  RuleGroupTypeIC,
} from 'react-querybuilder';
import { QueryBuilder } from 'react-querybuilder';
import { InlineCombinatorDnD } from './InlineCombinatorDnD';
import { getRuleGroupWithDndWrapper, getRuleWithDndWrapper } from './internal';
import { useReactDnD } from './internal/hooks';
import type { QueryBuilderDndProps } from './types';

export const QueryBuilderWithDndProvider = <RG extends RuleGroupType | RuleGroupTypeIC>(
  props: QueryBuilderDndProps<RG>
) => {
  const dnd = useReactDnD(props.dnd);
  const key = props.enableDragAndDrop && dnd ? 'dnd' : 'no-dnd';

  if (!props.enableDragAndDrop || !dnd) {
    return <QueryBuilder<RG> key={key} {...props} />;
  }

  const { DndProvider, HTML5Backend } = dnd;
  const qbProps: QueryBuilderDndProps<RG> = { ...props, dnd };

  return (
    <DndProvider key={key} backend={HTML5Backend} debugMode={props.debugMode}>
      {/* TODO: get rid of `any` */}
      <QueryBuilderWithoutDndProvider<RG> {...(qbProps as any)} />
    </DndProvider>
  );
};

QueryBuilderWithDndProvider.displayName = 'QueryBuilderWithDndProvider';

export const QueryBuilderWithoutDndProvider = <RG extends RuleGroupType | RuleGroupTypeIC>(
  props: QueryBuilderDndProps<RG>
) => {
  const dnd = useReactDnD(props.dnd);
  const key = props.enableDragAndDrop && dnd ? 'dnd' : 'no-dnd';

  if (!props.enableDragAndDrop || !dnd) {
    return <QueryBuilder<RG> key={key} {...props} />;
  }

  const { useDrag, useDrop } = dnd;

  const ruleGroup = getRuleGroupWithDndWrapper({
    ruleGroup: props.controlElements?.ruleGroup,
    useDrag,
    useDrop,
  });
  const rule = getRuleWithDndWrapper({
    rule: props.controlElements?.rule,
    useDrag,
    useDrop,
  });
  const inlineCombinator = (props: InlineCombinatorProps) => (
    <InlineCombinatorDnD {...props} useDrop={dnd.useDrop} />
  );

  const newProps: QueryBuilderProps<RG> = {
    ...props,
    dnd,
    controlElements: { ...props.controlElements, ruleGroup, rule, inlineCombinator },
  };

  const { DndContext } = dnd;

  return (
    <DndContext.Consumer key={key}>
      {() => <QueryBuilder<RG> key={key} {...newProps} />}
    </DndContext.Consumer>
  );
};

QueryBuilderWithoutDndProvider.displayName = 'QueryBuilderWithoutDndProvider';
