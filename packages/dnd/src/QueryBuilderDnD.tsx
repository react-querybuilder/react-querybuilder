import { cloneElement } from 'react';
import type { InlineCombinatorProps, QueryBuilderProps } from 'react-querybuilder';
import { InlineCombinatorDnD } from './InlineCombinatorDnD';
import { getRuleGroupWithDndWrapper, getRuleWithDndWrapper } from './internal';
import { useReactDnD } from './internal/hooks';
import type { QueryBuilderDndProps } from './types';

export const QueryBuilderDnD = (props: QueryBuilderDndProps) => {
  const dnd = useReactDnD(props.dnd);
  const key = props.children.props.enableDragAndDrop && dnd ? 'dnd' : 'no-dnd';

  if (!props.children.props.enableDragAndDrop || !dnd) {
    return cloneElement(props.children, { key });
  }

  const { DndProvider, HTML5Backend } = dnd;

  return (
    <DndProvider key={key} backend={HTML5Backend} debugMode={props.children.props.debugMode}>
      <QueryBuilderWithoutDndProvider dnd={dnd}>
        {cloneElement(props.children)}
      </QueryBuilderWithoutDndProvider>
    </DndProvider>
  );
};

QueryBuilderDnD.displayName = 'QueryBuilderDnD';

export const QueryBuilderWithoutDndProvider = (props: QueryBuilderDndProps) => {
  const dnd = useReactDnD(props.dnd);
  const key = props.children.props.enableDragAndDrop && dnd ? 'dnd' : 'no-dnd';

  if (!props.children.props.enableDragAndDrop || !dnd) {
    return cloneElement(props.children, { key });
  }

  const { useDrag, useDrop } = dnd;

  const ruleGroup = getRuleGroupWithDndWrapper({
    ruleGroup: props.children.props.controlElements?.ruleGroup,
    useDrag,
    useDrop,
  });
  const rule = getRuleWithDndWrapper({
    rule: props.children.props.controlElements?.rule,
    useDrag,
    useDrop,
  });
  const inlineCombinator = (props: InlineCombinatorProps) => (
    <InlineCombinatorDnD {...props} useDrop={dnd.useDrop} />
  );

  const newProps: QueryBuilderProps = {
    controlElements: { ...props.children.props.controlElements, ruleGroup, rule, inlineCombinator },
  };

  const { DndContext } = dnd;

  return (
    <DndContext.Consumer key={key}>
      {() => cloneElement(props.children, newProps)}
    </DndContext.Consumer>
  );
};

QueryBuilderWithoutDndProvider.displayName = 'QueryBuilderWithoutDndProvider';
