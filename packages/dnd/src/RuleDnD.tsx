import * as React from 'react';
import { useContext } from 'react';
import type { RuleProps } from 'react-querybuilder';
import { DragPreviewContext } from './DragPreviewContext';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';

/**
 * Rule component for drag-and-drop. Renders the provided rule component
 * ({@link react-querybuilder!Rule Rule} by default), but forwards the
 * drag-and-drop context.
 *
 * @group Components
 */
export const RuleDnD = (props: RuleProps): React.JSX.Element => {
  const rqbDndContext = useContext(QueryBuilderDndContext);
  const { dragPreviewState } = useContext(DragPreviewContext);

  const { adapter, canDrop, copyModeModifierKey, groupModeModifierKey, hideDefaultDragPreview } =
    rqbDndContext;

  const disabled = !!props.parentDisabled || !!props.disabled;

  const dndRefs = adapter!.useRuleDnD({
    path: props.path,
    disabled,
    schema: props.schema,
    actions: props.actions,
    rule: props.rule,
    canDrop,
    copyModeModifierKey: copyModeModifierKey ?? 'alt',
    groupModeModifierKey: groupModeModifierKey ?? 'ctrl',
    hideDefaultDragPreview,
  });

  // When updateWhileDragging is active, suppress isDragging and isOver
  // indicators — the visual feedback is the item moving in the tree.
  const overriddenDndRefs = dragPreviewState
    ? { ...dndRefs, isDragging: false, isOver: false, dropNotAllowed: false }
    : dndRefs;

  const { rule: BaseRuleComponent } = rqbDndContext.baseControls;

  return (
    <QueryBuilderDndContext.Provider value={rqbDndContext}>
      <BaseRuleComponent {...props} {...overriddenDndRefs} />
    </QueryBuilderDndContext.Provider>
  );
};

/**
 * @group Hooks
 * @deprecated Access via the adapter instead: `adapter.useRuleDnD(params)`.
 */
export { type AdapterUseRuleDnDResult as UseRuleDnDResult } from './adapter';
