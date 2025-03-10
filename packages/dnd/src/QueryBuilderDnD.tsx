import * as React from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';
import type { FullField, QueryBuilderContextProps } from 'react-querybuilder';
import {
  messages,
  QueryBuilderContext,
  useMergedContext,
  usePreferAnyProp,
  usePreferProp,
} from 'react-querybuilder';
import { InlineCombinatorDnD } from './InlineCombinatorDnD';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';
import { RuleDnD } from './RuleDnD';
import { RuleGroupDnD } from './RuleGroupDnD';
import type { QueryBuilderDndProps, UseReactDnD } from './types';

/**
 * Context provider to enable drag-and-drop. If the application already implements
 * `react-dnd`, use {@link QueryBuilderDndWithoutProvider} instead.
 *
 * @group Components
 */
export const QueryBuilderDnD = (props: QueryBuilderDndProps): React.JSX.Element => {
  const {
    controlClassnames,
    controlElements,
    debugMode,
    enableDragAndDrop: enableDragAndDropProp,
    enableMountQueryChange,
    translations,
    canDrop,
  } = props;

  const rqbContext = useMergedContext({
    controlClassnames,
    controlElements,
    debugMode,
    enableDragAndDrop: enableDragAndDropProp ?? true,
    enableMountQueryChange,
    translations: translations ?? {},
  });
  const { enableDragAndDrop } = rqbContext;

  const dnd = useReactDnD(props.dnd);
  const key = enableDragAndDrop && dnd ? 'dnd' : 'no-dnd';

  if (!enableDragAndDrop || !dnd) {
    return (
      <QueryBuilderContext.Provider
        key={key}
        value={{ ...rqbContext, enableDragAndDrop: false, debugMode }}>
        {props.children}
      </QueryBuilderContext.Provider>
    );
  }

  const { DndProvider, HTML5Backend } = dnd;

  return (
    <DndProvider key={key} backend={HTML5Backend} debugMode={debugMode}>
      <QueryBuilderContext.Provider
        key={key}
        value={{ ...rqbContext, enableDragAndDrop, debugMode }}>
        <QueryBuilderDndWithoutProvider dnd={dnd} canDrop={canDrop}>
          {props.children}
        </QueryBuilderDndWithoutProvider>
      </QueryBuilderContext.Provider>
    </DndProvider>
  );
};

/**
 * Context provider to enable drag-and-drop. Only use this provider if the application
 * already implements `react-dnd`, otherwise use {@link QueryBuilderDnD}.
 *
 * @group Components
 */
export const QueryBuilderDndWithoutProvider = (props: QueryBuilderDndProps): React.JSX.Element => {
  const rqbContext = useContext(QueryBuilderContext);
  const rqbDndContext = useContext(QueryBuilderDndContext);
  const dnd = useReactDnD(props.dnd);
  const debugMode = usePreferProp(false, props.debugMode, rqbContext.debugMode);
  const canDrop = usePreferAnyProp(undefined, props.canDrop, rqbDndContext.canDrop);
  const enableDragAndDrop = usePreferProp(
    true,
    props.enableDragAndDrop,
    rqbContext.enableDragAndDrop
  );
  const key = enableDragAndDrop && dnd ? 'dnd' : 'no-dnd';

  const baseControls = useMemo(
    () => ({
      rule:
        props.controlElements?.rule ??
        rqbContext.controlElements?.rule ??
        rqbDndContext.baseControls.rule,
      ruleGroup:
        props.controlElements?.ruleGroup ??
        rqbContext.controlElements?.ruleGroup ??
        rqbDndContext.baseControls.ruleGroup,
      combinatorSelector:
        props.controlElements?.combinatorSelector ??
        rqbContext.controlElements?.combinatorSelector ??
        rqbDndContext.baseControls.combinatorSelector,
    }),
    [
      props.controlElements?.combinatorSelector,
      props.controlElements?.rule,
      props.controlElements?.ruleGroup,
      rqbContext.controlElements?.combinatorSelector,
      rqbContext.controlElements?.rule,
      rqbContext.controlElements?.ruleGroup,
      rqbDndContext.baseControls.combinatorSelector,
      rqbDndContext.baseControls.rule,
      rqbDndContext.baseControls.ruleGroup,
    ]
  );

  const newContext: QueryBuilderContextProps<FullField, string> = useMemo(
    () => ({
      ...rqbContext,
      controlElements: {
        ...rqbContext.controlElements,
        ruleGroup: RuleGroupDnD,
        rule: RuleDnD,
        inlineCombinator: InlineCombinatorDnD,
      },
    }),
    [rqbContext]
  );

  if (!enableDragAndDrop || !dnd) {
    return (
      <QueryBuilderContext.Provider
        key={key}
        value={{ ...rqbContext, enableDragAndDrop: false, debugMode }}>
        {props.children}
      </QueryBuilderContext.Provider>
    );
  }

  const { DndContext, useDrag, useDrop } = dnd;

  return (
    <DndContext.Consumer key={key}>
      {() => (
        <QueryBuilderContext.Provider key={key} value={newContext}>
          <QueryBuilderDndContext.Provider value={{ useDrag, useDrop, baseControls, canDrop }}>
            {props.children}
          </QueryBuilderDndContext.Provider>
        </QueryBuilderContext.Provider>
      )}
    </DndContext.Consumer>
  );
};

let didWarnEnabledDndWithoutReactDnD = false;

/**
 * @group Hooks
 */
export const useReactDnD = (dndParam?: UseReactDnD): UseReactDnD | null => {
  const [dnd, setDnd] = useState<UseReactDnD | null>(dndParam ?? null);

  useEffect(() => {
    let didCancel = false;

    const getDnD = async () => {
      const [reactDnD, reactDnDHTML5Be] = await Promise.all([
        import('react-dnd').catch(() => null),
        import('react-dnd-html5-backend').catch(() => null),
      ]);

      // istanbul ignore else
      if (!didCancel) {
        if (reactDnD && reactDnDHTML5Be) {
          setDnd(() => ({ ...reactDnD, ...reactDnDHTML5Be }));
        } else {
          // istanbul ignore else
          if (process.env.NODE_ENV !== 'production' && !didWarnEnabledDndWithoutReactDnD) {
            console.error(messages.errorEnabledDndWithoutReactDnD);
            didWarnEnabledDndWithoutReactDnD = true;
          }
        }
      }
    };

    if (!dnd) {
      getDnD();
    }

    return () => {
      didCancel = true;
    };
  }, [dnd]);

  return dnd;
};
