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
import { isTouchDevice } from './isTouchDevice';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';
import { RuleDnD } from './RuleDnD';
import { RuleGroupDnD } from './RuleGroupDnD';
import type {
  DndProp,
  QueryBuilderDndContextProps,
  QueryBuilderDndProps,
  UseReactDnD,
} from './types';

const emptyObject = {} as UseReactDnD;

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
    copyModeModifierKey,
    groupModeModifierKey,
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

  const { DndProvider, ReactDndBackend } = dnd ?? emptyObject;

  const contextWithoutDnD = useMemo(
    () => ({ ...rqbContext, enableDragAndDrop: false, debugMode }),
    [rqbContext, debugMode]
  );
  const contextWithDnD = useMemo(
    () => ({ ...rqbContext, enableDragAndDrop, debugMode }),
    [rqbContext, debugMode, enableDragAndDrop]
  );

  if (!enableDragAndDrop || !dnd || !DndProvider || !ReactDndBackend) {
    return (
      <QueryBuilderContext.Provider key={key} value={contextWithoutDnD}>
        {props.children}
      </QueryBuilderContext.Provider>
    );
  }

  return (
    <DndProvider key={key} backend={ReactDndBackend} debugMode={debugMode}>
      <QueryBuilderContext.Provider key={key} value={contextWithDnD}>
        <QueryBuilderDndWithoutProvider
          dnd={dnd}
          canDrop={canDrop}
          copyModeModifierKey={copyModeModifierKey}
          groupModeModifierKey={groupModeModifierKey}>
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
  const copyModeModifierKey = usePreferAnyProp(
    undefined,
    props.copyModeModifierKey,
    rqbDndContext.copyModeModifierKey
  );
  const groupModeModifierKey = usePreferAnyProp(
    undefined,
    props.groupModeModifierKey,
    rqbDndContext.groupModeModifierKey
  );
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
      enableDragAndDrop,
      debugMode,
      controlElements: {
        ...rqbContext.controlElements,
        ruleGroup: RuleGroupDnD,
        rule: RuleDnD,
        inlineCombinator: InlineCombinatorDnD,
      },
    }),
    [debugMode, enableDragAndDrop, rqbContext]
  );

  const { DndContext, useDrag, useDrop } = dnd ?? {};

  const dndContextValue: QueryBuilderDndContextProps = useMemo(
    () => ({ baseControls, canDrop, copyModeModifierKey, groupModeModifierKey, useDrag, useDrop }),
    [baseControls, canDrop, copyModeModifierKey, groupModeModifierKey, useDrag, useDrop]
  );

  const contextWithoutDnD = useMemo(
    () => ({ ...rqbContext, enableDragAndDrop: false, debugMode }),
    [rqbContext, debugMode]
  );

  if (!enableDragAndDrop || !DndContext) {
    return (
      <QueryBuilderContext.Provider key={key} value={contextWithoutDnD}>
        {props.children}
      </QueryBuilderContext.Provider>
    );
  }

  return (
    <DndContext.Consumer key={key}>
      {() => (
        <QueryBuilderContext.Provider key={key} value={newContext}>
          <QueryBuilderDndContext.Provider value={dndContextValue}>
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
export const useReactDnD = (dndParam?: DndProp): UseReactDnD | null => {
  const [dnd, setDnd] = useState<DndProp | null>(dndParam ?? null);

  useEffect(() => {
    let didCancel = false;

    const getDnD = async () => {
      const [reactDnD, reactDndHTML5Be, reactDndTouchBe] = await Promise.all(
        ['', '-html5-backend', '-touch-backend'].map(pn =>
          import(/* @vite-ignore */ `react-dnd${pn}`).catch(() => null)
        )
      );

      // istanbul ignore else
      if (!didCancel) {
        if (reactDnD) {
          // istanbul ignore next
          // Only prefer HTML5 backend if not touch device or we don't have the touch backend
          // (Can't test this since jsdom unconditionally defines `window.ontouchstart`.)
          if (reactDndHTML5Be && (!reactDndTouchBe || (reactDndTouchBe && !isTouchDevice()))) {
            setDnd(() => ({
              ...reactDnD,
              ...reactDndHTML5Be,
              ...reactDndTouchBe,
              ReactDndBackend: reactDndHTML5Be.HTML5Backend,
            }));
          } else if (reactDndTouchBe) {
            setDnd(() => ({
              ...reactDnD,
              ...reactDndTouchBe,
              ...reactDndHTML5Be,
              ReactDndBackend: reactDndTouchBe.TouchBackend,
            }));
          }
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

  // istanbul ignore next
  if (dnd && !dnd.ReactDndBackend) {
    // Prefer touch backend if this is a touch device
    dnd.ReactDndBackend = isTouchDevice()
      ? (dnd.TouchBackend ?? dnd.HTML5Backend)
      : (dnd.HTML5Backend ?? dnd.TouchBackend);
  }

  return dnd as UseReactDnD;
};
