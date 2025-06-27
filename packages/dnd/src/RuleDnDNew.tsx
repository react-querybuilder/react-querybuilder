import * as React from 'react';
import { useContext, useRef } from 'react';
import type { DndDropTargetType, RuleProps, UseRuleDnD } from 'react-querybuilder';
import { getParentPath, isAncestor, pathsAreEqual } from 'react-querybuilder';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';
import type { DragHookOptions, DropHookOptions, DropResult } from './dnd-core/types';
import { useDndDrag, useDndDrop } from './hooks/useDndAdapter';
import { isHotkeyPressed } from './isHotkeyPressed';
import type { CustomCanDropParams } from './types';

/**
 * Rule component for drag-and-drop using the adapter system.
 * Supports multiple DnD libraries through the adapter pattern.
 */
export const RuleDnD = (props: RuleProps): React.JSX.Element => {
  const rqbDndContext = useContext(QueryBuilderDndContext);

  const { canDrop, copyModeModifierKey, groupModeModifierKey } = rqbDndContext;

  const disabled = !!props.parentDisabled || !!props.disabled;

  const dndRefs = useRuleDnD({
    ...props,
    disabled,
    canDrop,
    copyModeModifierKey,
    groupModeModifierKey,
  });

  const { rule: BaseRuleComponent } = rqbDndContext.baseControls;

  return (
    <QueryBuilderDndContext.Provider value={rqbDndContext}>
      <BaseRuleComponent {...props} {...dndRefs} />
    </QueryBuilderDndContext.Provider>
  );
};

type UseRuleDndParams = RuleProps & {
  disabled: boolean;
  canDrop?: (params: CustomCanDropParams) => boolean;
  copyModeModifierKey?: string;
  groupModeModifierKey?: string;
};

const accept: [DndDropTargetType, DndDropTargetType] = ['rule', 'ruleGroup'];

/**
 * Hook for Rule drag and drop functionality using the adapter system
 */
export const useRuleDnD = (params: UseRuleDndParams): UseRuleDnD => {
  const dndRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLSpanElement>(null);

  const {
    path,
    rule,
    disabled,
    schema,
    actions,
    canDrop,
    copyModeModifierKey = 'alt',
    groupModeModifierKey = 'ctrl',
  } = params;

  // Drag options
  const dragOptions: DragHookOptions = {
    type: 'rule',
    item: () => ({
      type: 'rule' as const,
      path,
      qbId: schema.qbId,
      ...rule,
    }),
    canDrag: !disabled,
    end: (item, result) => {
      if (!result) return;

      const { qbId: targetQbId, path: targetPath, dropEffect, groupItems } = result;

      if (targetQbId === schema.qbId) {
        // Same query builder - use internal actions
        if (groupItems) {
          actions.groupRule(path, targetPath, dropEffect === 'copy');
        } else if (dropEffect === 'copy') {
          actions.moveRule(path, targetPath, true);
        } else {
          actions.moveRule(path, targetPath);
        }
      } else {
        // Different query builder - use dispatch functions
        // const sourceQuery = schema.getQuery();
        // let updatedQuery = sourceQuery;

        if (dropEffect !== 'copy') {
          // Remove from source if moving
          actions.onRuleRemove(path);
        }

        // Add to target
        const targetQuery = result.getQuery();
        if (groupItems) {
          // Create a new group with the rule
          // const newGroup = {
          //   combinator: 'and' as const,
          //   rules: [rule],
          // };
          result.dispatchQuery({
            ...targetQuery,
            // This is simplified - full implementation would use proper path insertion
          });
        } else {
          result.dispatchQuery({
            ...targetQuery,
            // This is simplified - full implementation would use proper path insertion
          });
        }
      }
    },
  };

  // Drop options
  const dropOptions: DropHookOptions = {
    accept,
    canDrop: dragging => {
      if (
        (isHotkeyPressed(groupModeModifierKey) && disabled) ||
        (dragging &&
          typeof canDrop === 'function' &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          !canDrop({ dragging: dragging as any, hovering: { ...rule, path, qbId: schema.qbId } }))
      ) {
        return false;
      }

      if (schema.qbId !== dragging.qbId) return true;

      const parentHoverPath = getParentPath(path);
      const parentItemPath = getParentPath(dragging.path);
      const hoverIndex = path.at(-1);
      const itemIndex = dragging.path.at(-1)!;

      // Disallow drop if...
      return !(
        // 1) item is ancestor of drop target, OR
        (
          isAncestor(dragging.path, path) ||
          // 2) item is hovered over itself, OR
          pathsAreEqual(path, dragging.path) ||
          // 3) item is hovered over the previous item AND this is a move, not a group
          (!isHotkeyPressed(groupModeModifierKey) &&
            pathsAreEqual(parentHoverPath, parentItemPath) &&
            (hoverIndex === itemIndex - 1 ||
              (schema.independentCombinators && hoverIndex === itemIndex - 2)))
        )
      );
    },
    drop: (): DropResult => {
      const { qbId, getQuery, dispatchQuery } = schema;
      const dropEffect = isHotkeyPressed(copyModeModifierKey) ? 'copy' : 'move';
      const groupItems = isHotkeyPressed(groupModeModifierKey);

      return {
        type: 'rule',
        path,
        qbId,
        getQuery,
        dispatchQuery,
        groupItems,
        dropEffect,
      };
    },
    modifierKeys: {
      copyModeKey: copyModeModifierKey,
      groupModeKey: groupModeModifierKey,
    },
  };

  // Use the adapter hooks
  const {
    isDragging,
    dragMonitorId,
    dragRef: adapterDragRef,
    previewRef,
  } = useDndDrag(dragOptions);
  const { isOver, dropMonitorId, dropEffect, groupItems, dropRef } = useDndDrop(dropOptions);

  // Connect refs
  React.useEffect(() => {
    if (dragRef.current) {
      adapterDragRef(dragRef.current);
    }
  }, [adapterDragRef]);

  React.useEffect(() => {
    if (dndRef.current) {
      previewRef(dndRef.current);
      dropRef(dndRef.current);
    }
  }, [previewRef, dropRef]);

  return {
    isDragging,
    dragMonitorId,
    isOver,
    dropMonitorId,
    dndRef,
    dragRef,
    dropEffect,
    groupItems,
  };
};
