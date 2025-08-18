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
import type { DndConfig } from './dnd-core';
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

  // Initialize DnD adapter
  useEffect(() => {
    if (!enableDragAndDrop || !dndConfig?.adapter) {
      setIsInitialized(false);
      return;
    }

    const initializeDnd = async () => {
      try {
        // Initialize the adapter if it has an initialize method
        if (dndConfig.adapter.initialize) {
          await dndConfig.adapter.initialize();
        }
        setIsInitialized(true);
        setInitError(null);
      } catch (error) {
        setInitError(error instanceof Error ? error.message : 'Failed to initialize DnD adapter');
        setIsInitialized(false);

        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to initialize DnD adapter:', error);
        }
      }
    };

    initializeDnd();
  }, [enableDragAndDrop, dndConfig]);

  const key = enableDragAndDrop && isInitialized ? 'dnd' : 'no-dnd';

  const dndDisabledContextValue = useMemo(
    () => ({ ...rqbContext, enableDragAndDrop: false, debugMode }),
    [rqbContext, debugMode]
  );
  const dndEnabledContextValue = useMemo(
    () => ({ ...rqbContext, enableDragAndDrop: enableDragAndDrop, debugMode }),
    [rqbContext, debugMode, enableDragAndDrop]
  );

  // If DnD is disabled or not initialized, render without DnD
  if (!enableDragAndDrop || !isInitialized || initError || !dndConfig) {
    return (
      <QueryBuilderContext.Provider key={key} value={dndDisabledContextValue}>
        {props.children}
      </QueryBuilderContext.Provider>
    );
  }

  const { DndProvider } = dndConfig.adapter;

  return (
    <DndProvider key={key} backend={dndConfig?.backend} debugMode={debugMode}>
      <QueryBuilderContext.Provider key={key} value={dndEnabledContextValue}>
        <QueryBuilderDndWithoutProvider
          canDrop={canDrop}
          copyModeModifierKey={copyModeModifierKey}
          groupModeModifierKey={groupModeModifierKey}
          adapter={dndConfig.adapter}>
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
  // oxlint-disable-next-line consistent-type-imports
  props: Omit<QueryBuilderDndNewProps, 'dnd'> & { adapter?: import('./dnd-core/types').DndAdapter }
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

  const key = enableDragAndDrop ? 'dnd' : 'no-dnd';

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
      adapter: props.adapter,
    }),
    [baseControls, canDrop, copyModeModifierKey, groupModeModifierKey, props.adapter]
  );

  const dndDisabledContextValue = useMemo(
    () => ({ ...rqbContext, enableDragAndDrop: false, debugMode }),
    [rqbContext, debugMode]
  );

  if (!enableDragAndDrop) {
    return (
      <QueryBuilderContext.Provider key={key} value={dndDisabledContextValue}>
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
