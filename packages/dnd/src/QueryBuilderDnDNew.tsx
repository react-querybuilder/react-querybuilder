import * as React from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';
import type {
  FullField,
  QueryBuilderContextProps,
  QueryBuilderContextProviderProps,
} from 'react-querybuilder';
import {
  QueryBuilderContext,
  useMergedContext,
  usePreferAnyProp,
  usePreferProp,
} from 'react-querybuilder';
import { InlineCombinatorDnD } from './InlineCombinatorDnD';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';
import { RuleDnD } from './RuleDnD';
import { RuleGroupDnD } from './RuleGroupDnD';
import { dndManager, type DndConfig } from './dnd-core';
import type { CustomCanDropParams, QueryBuilderDndContextProps } from './types';

export interface QueryBuilderDndNewProps extends QueryBuilderContextProviderProps {
  /**
   * DnD configuration - specify the library and options to use
   */
  dnd?: DndConfig;

  /**
   * Custom drop validation function
   */
  canDrop?: (params: CustomCanDropParams) => boolean;

  /**
   * Key for copy mode (default: 'alt')
   */
  copyModeModifierKey?: string;

  /**
   * Key for group mode (default: 'ctrl')
   */
  groupModeModifierKey?: string;
}

/**
 * Context provider to enable drag-and-drop with library-agnostic support.
 * Supports react-dnd, @hello-pangea/dnd, @dnd-kit/core, and @atlaskit/pragmatic-drag-and-drop.
 */
export const QueryBuilderDnD = (props: QueryBuilderDndNewProps): React.JSX.Element => {
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
    dnd: dndConfig,
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize DnD manager
  useEffect(() => {
    if (!enableDragAndDrop || !dndConfig) {
      setIsInitialized(false);
      return;
    }

    const initializeDnd = async () => {
      try {
        await dndManager.initialize(dndConfig);
        setIsInitialized(true);
        setInitError(null);
      } catch (error) {
        setInitError(error instanceof Error ? error.message : 'Failed to initialize DnD');
        setIsInitialized(false);

        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to initialize DnD manager:', error);
        }
      }
    };

    initializeDnd();
  }, [enableDragAndDrop, dndConfig]);

  const key = enableDragAndDrop && isInitialized ? 'dnd' : 'no-dnd';

  // If DnD is disabled or not initialized, render without DnD
  if (!enableDragAndDrop || !isInitialized || initError) {
    return (
      <QueryBuilderContext.Provider
        key={key}
        value={{ ...rqbContext, enableDragAndDrop: false, debugMode }}>
        {props.children}
      </QueryBuilderContext.Provider>
    );
  }

  const adapter = dndManager.getAdapter();
  const { DndProvider } = adapter;

  return (
    <DndProvider key={key} backend={dndConfig?.backend} debugMode={debugMode}>
      <QueryBuilderContext.Provider
        key={key}
        value={{ ...rqbContext, enableDragAndDrop, debugMode }}>
        <QueryBuilderDndWithoutProvider
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
 * already implements a DnD provider, otherwise use {@link QueryBuilderDnD}.
 */
export const QueryBuilderDndWithoutProvider = (
  props: Omit<QueryBuilderDndNewProps, 'dnd'>
): React.JSX.Element => {
  const rqbContext = useContext(QueryBuilderContext);
  const rqbDndContext = useContext(QueryBuilderDndContext);

  const debugMode = usePreferProp(false, props.debugMode, rqbContext.debugMode);
  const canDrop = usePreferAnyProp(undefined, props.canDrop, rqbDndContext.canDrop);
  const copyModeModifierKey = usePreferAnyProp(
    'alt',
    props.copyModeModifierKey,
    rqbDndContext.copyModeModifierKey
  );
  const groupModeModifierKey = usePreferAnyProp(
    'ctrl',
    props.groupModeModifierKey,
    rqbDndContext.groupModeModifierKey
  );
  const enableDragAndDrop = usePreferProp(
    true,
    props.enableDragAndDrop,
    rqbContext.enableDragAndDrop
  );

  const key = enableDragAndDrop && dndManager.isInitialized() ? 'dnd' : 'no-dnd';

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

  const dndContextValue: QueryBuilderDndContextProps = useMemo(
    () => ({
      baseControls,
      canDrop,
      copyModeModifierKey,
      groupModeModifierKey,
      // These will be replaced with adapter methods in the components
      useDrag: undefined,
      useDrop: undefined,
    }),
    [baseControls, canDrop, copyModeModifierKey, groupModeModifierKey]
  );

  if (!enableDragAndDrop || !dndManager.isInitialized()) {
    return (
      <QueryBuilderContext.Provider
        key={key}
        value={{ ...rqbContext, enableDragAndDrop: false, debugMode }}>
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
