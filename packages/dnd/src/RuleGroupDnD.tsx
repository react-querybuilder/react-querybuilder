import * as React from 'react';
import { useContext, useMemo } from 'react';
import type { RuleGroupProps } from 'react-querybuilder';
import { DragPreviewContext } from './DragPreviewContext';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';

/**
 * Rule group component for drag-and-drop. Renders the provided rule group component
 * ({@link react-querybuilder!RuleGroup RuleGroup} by default), but forwards the drag-and-drop
 * context so that child rules and groups will render within the appropriate drag-and-drop wrappers.
 *
 * @group Components
 */
export const RuleGroupDnD = (props: RuleGroupProps): React.JSX.Element => {
  const rqbDndContext = useContext(QueryBuilderDndContext);
  const { dragPreviewState } = useContext(DragPreviewContext);

  const {
    adapter,
    canDrop,
    baseControls: { ruleGroup: BaseRuleGroupComponent },
    copyModeModifierKey,
    copyModeAfterHoverMs,
    groupModeModifierKey,
    groupModeAfterHoverMs,
    hideDefaultDragPreview,
  } = rqbDndContext;

  // When updateWhileDragging is active and this is the root group,
  // swap ruleGroup/rules with the shadow query so the tree re-renders
  // with the dragged item at its preview position.
  const effectiveProps = useMemo(() => {
    if (props.path.length === 0 && dragPreviewState) {
      const sq = dragPreviewState.shadowQuery;
      return {
        ...props,
        ruleGroup: sq,
        rules: sq.rules,
      };
    }
    return props;
  }, [props, dragPreviewState]);

  const dndRefs = adapter!.useRuleGroupDnD({
    disabled: !!effectiveProps.parentDisabled || !!effectiveProps.disabled,
    path: effectiveProps.path,
    schema: effectiveProps.schema,
    actions: effectiveProps.actions,
    ruleGroup: effectiveProps.ruleGroup,
    canDrop,
    copyModeModifierKey: copyModeModifierKey ?? 'alt',
    copyModeAfterHoverMs,
    groupModeModifierKey: groupModeModifierKey ?? 'ctrl',
    groupModeAfterHoverMs,
    hideDefaultDragPreview,
  });

  // When updateWhileDragging is active, suppress isDragging and isOver
  // indicators — the visual feedback is the item moving in the tree.
  const overriddenDndRefs = dragPreviewState
    ? { ...dndRefs, isDragging: false, isOver: false, dropNotAllowed: false }
    : dndRefs;

  return <BaseRuleGroupComponent {...effectiveProps} {...overriddenDndRefs} />;
};

/**
 * @group Hooks
 * @deprecated Access via the adapter instead: `adapter.useRuleGroupDnD(params)`.
 */
export { type AdapterUseRuleGroupDnDResult as UseRuleGroupDnDResult } from './adapter';
