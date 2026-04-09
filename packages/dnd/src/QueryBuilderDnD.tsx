import * as React from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';
import type { QueryBuilderContextProps } from 'react-querybuilder';
import {
  messages,
  preferAnyProp,
  preferProp,
  QueryBuilderContext,
  useMergedContext,
} from 'react-querybuilder';
import type { DndAdapter } from './adapter';
import { isDndAdapter } from './adapter';
import { createReactDnDAdapter } from './adapters/react-dnd';
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

  // Resolve the adapter: either directly provided, wrapped from legacy DndProp, or async-loaded
  const adapter = useResolvedAdapter(props.dnd);
  const key = enableDragAndDrop && adapter ? 'dnd' : 'no-dnd';

  const contextWithoutDnD = useMemo(
    () => ({ ...rqbContext, enableDragAndDrop: false, debugMode }),
    [rqbContext, debugMode]
  );
  const contextWithDnD = useMemo(
    () => ({ ...rqbContext, enableDragAndDrop, debugMode }),
    [rqbContext, debugMode, enableDragAndDrop]
  );

  if (!enableDragAndDrop || !adapter) {
    return (
      <QueryBuilderContext.Provider key={key} value={contextWithoutDnD}>
        {props.children}
      </QueryBuilderContext.Provider>
    );
  }

  const { DndProvider } = adapter;

  return (
    <DndProvider key={key} debugMode={debugMode}>
      <QueryBuilderContext.Provider key={key} value={contextWithDnD}>
        <QueryBuilderDndWithoutProvider
          dnd={adapter}
          canDrop={props.canDrop}
          copyModeModifierKey={props.copyModeModifierKey}
          groupModeModifierKey={props.groupModeModifierKey}
          hideDefaultDragPreview={props.hideDefaultDragPreview}>
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
  const adapter = useResolvedAdapter(props.dnd) ?? rqbDndContext.adapter;
  const copyModeModifierKey = preferAnyProp(
    undefined,
    props.copyModeModifierKey,
    rqbDndContext.copyModeModifierKey
  );
  const groupModeModifierKey = preferAnyProp(
    undefined,
    props.groupModeModifierKey,
    rqbDndContext.groupModeModifierKey
  );
  const enableDragAndDrop = preferProp(true, props.enableDragAndDrop, rqbContext.enableDragAndDrop);
  const debugMode = preferProp(false, props.debugMode, rqbContext.debugMode);
  const hideDefaultDragPreview = preferProp(
    false,
    props.hideDefaultDragPreview,
    rqbDndContext.hideDefaultDragPreview
  );
  const canDrop = preferAnyProp(undefined, props.canDrop, rqbDndContext.canDrop);
  const key = enableDragAndDrop && adapter ? 'dnd' : 'no-dnd';

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

  const newContext: QueryBuilderContextProps = useMemo(
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

  const dndContextValue: QueryBuilderDndContextProps = useMemo(
    () => ({
      baseControls,
      canDrop,
      copyModeModifierKey,
      groupModeModifierKey,
      hideDefaultDragPreview,
      adapter,
    }),
    [
      baseControls,
      canDrop,
      copyModeModifierKey,
      groupModeModifierKey,
      hideDefaultDragPreview,
      adapter,
    ]
  );

  const contextWithoutDnD = useMemo(
    () => ({ ...rqbContext, enableDragAndDrop: false, debugMode }),
    [rqbContext, debugMode]
  );

  if (!enableDragAndDrop || !adapter) {
    return (
      <QueryBuilderContext.Provider key={key} value={contextWithoutDnD}>
        {props.children}
      </QueryBuilderContext.Provider>
    );
  }

  return (
    <QueryBuilderContext.Provider key={key} value={newContext}>
      <QueryBuilderDndContext.Provider value={dndContextValue}>
        {props.children}
      </QueryBuilderDndContext.Provider>
    </QueryBuilderContext.Provider>
  );
};

let didWarnEnabledDndWithoutReactDnD = false;

/**
 * Resolves a `dnd` prop (which may be a {@link DndAdapter}, a legacy {@link DndProp},
 * or `undefined`) into a {@link DndAdapter} or `null`.
 *
 * Hooks are always called in the same order regardless of the `dndParam` value
 * to satisfy the Rules of Hooks.
 */
const useResolvedAdapter = (dndParam?: DndAdapter | DndProp): DndAdapter | null => {
  const directAdapter = dndParam && isDndAdapter(dndParam) ? dndParam : null;

  // Always call useMemo (returns null when not applicable)
  const legacyAdapter = useMemo(
    () => (dndParam && !isDndAdapter(dndParam) ? createReactDnDAdapter(dndParam) : null),
    [dndParam]
  );

  // Always call the async hook, but skip loading when an explicit adapter exists
  const asyncAdapter = useAsyncReactDnDAdapter(directAdapter !== null || legacyAdapter !== null);

  return directAdapter ?? legacyAdapter ?? asyncAdapter;
};

const useAsyncReactDnDAdapter = (skip: boolean): DndAdapter | null => {
  const [adapter, setAdapter] = useState<DndAdapter | null>(null);

  useEffect(() => {
    if (skip) return undefined;

    let didCancel = false;

    const loadDnD = async () => {
      const [reactDnD, reactDndHTML5Be, reactDndTouchBe] = await Promise.all(
        ['', '-html5-backend', '-touch-backend'].map(pn =>
          import(/* @vite-ignore */ `react-dnd${pn}`).catch(/* istanbul ignore next */ () => null)
        )
      );

      // istanbul ignore else
      if (!didCancel) {
        // istanbul ignore else -- react-dnd is always importable in the test environment
        if (reactDnD) {
          let dndExports: DndProp;
          // istanbul ignore next
          if (reactDndHTML5Be && (!reactDndTouchBe || (reactDndTouchBe && !isTouchDevice()))) {
            dndExports = {
              ...reactDnD,
              ...reactDndHTML5Be,
              ...reactDndTouchBe,
              ReactDndBackend: reactDndHTML5Be.HTML5Backend,
            };
          } else if (reactDndTouchBe) {
            dndExports = {
              ...reactDnD,
              ...reactDndTouchBe,
              ...reactDndHTML5Be,
              ReactDndBackend: reactDndTouchBe.TouchBackend,
            };
          } else {
            return;
          }
          setAdapter(() => createReactDnDAdapter(dndExports));
        } else {
          if (process.env.NODE_ENV !== 'production' && !didWarnEnabledDndWithoutReactDnD) {
            console.error(messages.errorEnabledDndWithoutReactDnD);
            didWarnEnabledDndWithoutReactDnD = true;
          }
        }
      }
    };

    if (!adapter) {
      loadDnD();
    }

    return () => {
      didCancel = true;
    };
  }, [adapter, skip]);

  return skip ? null : adapter;
};

/**
 * @group Hooks
 * @deprecated Use `createReactDnDAdapter` instead. This hook is kept for backward compatibility.
 */
export const useReactDnD = (dndParam?: DndProp): UseReactDnD | null => {
  const [dnd, setDnd] = useState(dndParam ?? null);

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
