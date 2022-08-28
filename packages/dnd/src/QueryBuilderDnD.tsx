import { Fragment, useContext } from 'react';
import type { InlineCombinatorProps, QueryBuilderContextProps } from 'react-querybuilder';
import { QueryBuilderContext, usePreferProp } from 'react-querybuilder';
import { InlineCombinatorDnD } from './InlineCombinatorDnD';
import { getRuleGroupWithDndWrapper, getRuleWithDndWrapper } from './internal';
import { useReactDnD } from './internal/hooks';
import type { QueryBuilderDndProps } from './types';

export const QueryBuilderDnD = (props: QueryBuilderDndProps) => {
  const rqbContext = useContext(QueryBuilderContext);
  const dnd = useReactDnD(props.dnd);
  const debugMode = usePreferProp(false, props.debugMode, rqbContext.debugMode);
  const enableDragAndDrop = usePreferProp(
    true,
    props.enableDragAndDrop,
    rqbContext.enableDragAndDrop
  );
  const key = enableDragAndDrop && dnd ? 'dnd' : 'no-dnd';

  if (!enableDragAndDrop || !dnd) {
    return (
      <QueryBuilderContext.Provider value={{ ...rqbContext, enableDragAndDrop: false, debugMode }}>
        <Fragment key={key}>{props.children}</Fragment>
      </QueryBuilderContext.Provider>
    );
  }

  const { DndProvider, HTML5Backend } = dnd;

  return (
    <DndProvider key={key} backend={HTML5Backend} debugMode={debugMode}>
      <QueryBuilderContext.Provider value={{ ...rqbContext, enableDragAndDrop, debugMode }}>
        <QueryBuilderDndWithoutProvider dnd={dnd}>{props.children}</QueryBuilderDndWithoutProvider>
      </QueryBuilderContext.Provider>
    </DndProvider>
  );
};

QueryBuilderDnD.displayName = 'QueryBuilderDnD';

export const QueryBuilderDndWithoutProvider = (props: QueryBuilderDndProps) => {
  const rqbContext = useContext(QueryBuilderContext);
  const dnd = useReactDnD(props.dnd);
  const debugMode = usePreferProp(false, props.debugMode, rqbContext.debugMode);
  const enableDragAndDrop = usePreferProp(
    true,
    props.enableDragAndDrop,
    rqbContext.enableDragAndDrop
  );
  const key = enableDragAndDrop && dnd ? 'dnd' : 'no-dnd';

  if (!enableDragAndDrop || !dnd) {
    return (
      <QueryBuilderContext.Provider value={{ ...rqbContext, enableDragAndDrop: false, debugMode }}>
        <Fragment key={key}>{props.children}</Fragment>
      </QueryBuilderContext.Provider>
    );
  }

  const { useDrag, useDrop } = dnd;

  const ruleGroup = getRuleGroupWithDndWrapper({
    // TODO: Detect and prefer the ruleGroup component defined in the child <QueryBuilder /> element.
    ruleGroup: props.controlElements?.ruleGroup ?? rqbContext.controlElements?.ruleGroup,
    useDrag,
    useDrop,
  });
  const rule = getRuleWithDndWrapper({
    // TODO: Detect and prefer the rule component defined in the child <QueryBuilder /> element.
    rule: props.controlElements?.rule ?? rqbContext.controlElements?.rule,
    useDrag,
    useDrop,
  });
  const combinatorComponent: Partial<Pick<InlineCombinatorProps, 'component'>> = rqbContext
    .controlElements?.combinatorSelector
    ? { component: rqbContext.controlElements.combinatorSelector }
    : {};
  const inlineCombinator = (icProps: InlineCombinatorProps) => (
    <InlineCombinatorDnD {...{ ...icProps, ...combinatorComponent }} useDrop={dnd.useDrop} />
  );

  const newContextProps: QueryBuilderContextProps = {
    ...rqbContext,
    controlElements: { ...rqbContext.controlElements, ruleGroup, rule, inlineCombinator },
  };

  const { DndContext } = dnd;

  return (
    <DndContext.Consumer key={key}>
      {() => (
        <QueryBuilderContext.Provider value={newContextProps}>
          {props.children}
        </QueryBuilderContext.Provider>
      )}
    </DndContext.Consumer>
  );
};

QueryBuilderDndWithoutProvider.displayName = 'QueryBuilderDndWithoutProvider';
