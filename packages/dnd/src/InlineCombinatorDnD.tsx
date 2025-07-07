import type { Ref } from 'react';
import * as React from 'react';
import { useContext, useRef } from 'react';
import type { useDrop as useDropOriginal } from 'react-dnd';
import type {
  DndDropTargetType,
  DraggedItem,
  DropCollection,
  DropEffect,
  DropResult,
  InlineCombinatorProps,
  RuleGroupTypeAny,
  RuleType,
} from 'react-querybuilder';
import {
  getParentPath,
  isAncestor,
  pathsAreEqual,
  standardClassnames,
  TestID,
} from 'react-querybuilder';
import { isHotkeyPressed } from './isHotkeyPressed';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';
import type { QueryBuilderDndContextProps } from './types';

/**
 * The drag-and-drop-enabled inline combinator component.
 *
 * @group Components
 */
export const InlineCombinatorDnD = ({
  component: CombinatorSelectorComponent,
  ...props
}: InlineCombinatorProps): React.JSX.Element => {
  const { canDrop, useDrop, copyModeModifierKey, groupModeModifierKey } =
    useContext(QueryBuilderDndContext);

  const { dropRef, dropMonitorId, isOver } = useInlineCombinatorDnD({
    ...props,
    component: CombinatorSelectorComponent,
    useDrop: useDrop!,
    canDrop,
    copyModeModifierKey,
    groupModeModifierKey,
  });

  const wrapperClassName = [
    props.schema.suppressStandardClassnames || standardClassnames.betweenRules,
    (isOver && !props.schema.classNames.dndOver) || false,
    (isOver && !props.schema.suppressStandardClassnames && standardClassnames.dndOver) || false,
  ]
    .filter(c => typeof c === 'string')
    .join(' ');

  return (
    <div
      key="dnd"
      ref={dropRef}
      className={wrapperClassName}
      data-dropmonitorid={dropMonitorId}
      data-testid={TestID.inlineCombinator}>
      <CombinatorSelectorComponent {...props} testID={TestID.combinators} />
    </div>
  );
};

type UseInlineCombinatorDndParams = InlineCombinatorProps &
  Pick<QueryBuilderDndContextProps, 'canDrop' | 'copyModeModifierKey' | 'groupModeModifierKey'> & {
    useDrop: typeof useDropOriginal;
  };

interface UseInlineCombinatorDnD {
  isOver: boolean;
  dropMonitorId: string | symbol | null;
  dropRef: Ref<HTMLDivElement>;
  dropEffect?: DropEffect;
  groupItems?: boolean;
}

/**
 * @group Hooks
 */
export const useInlineCombinatorDnD = (
  params: UseInlineCombinatorDndParams
): UseInlineCombinatorDnD => {
  const dropRef = useRef<HTMLDivElement>(null);

  const {
    path,
    canDrop,
    schema,
    useDrop,
    rules,
    copyModeModifierKey = 'alt',
    groupModeModifierKey = 'ctrl',
  } = params;

  // The "hovering" item is the rule or group which precedes this inline combinator.
  const hoveringItem = (rules ?? /* istanbul ignore next */ [])[path.at(-1)! - 1] as
    | RuleType
    | RuleGroupTypeAny;

  const [{ isOver, dropMonitorId, dropEffect }, drop] = useDrop<
    DraggedItem,
    DropResult,
    DropCollection
  >(
    () => ({
      accept: ['rule', 'ruleGroup'] as DndDropTargetType[],
      canDrop: dragging => {
        const { path: itemPath } = dragging;
        if (
          isHotkeyPressed(groupModeModifierKey) ||
          (dragging &&
            typeof canDrop === 'function' &&
            !canDrop({ dragging, hovering: { ...hoveringItem, path, qbId: schema.qbId } }))
        ) {
          return false;
        }
        const parentHoverPath = getParentPath(path);
        const parentItemPath = getParentPath(itemPath);
        const hoverIndex = path.at(-1)!;
        const itemIndex = itemPath.at(-1)!;

        // Disallow drop if...
        // prettier-ignore
        return !(
          // 1) the item is an ancestor of the drop target,
          isAncestor(itemPath, path) ||
          // 2) the item is hovered over itself (which should never
          // happen since combinators don't have drag handles),
          pathsAreEqual(itemPath, path) ||
          (pathsAreEqual(parentHoverPath, parentItemPath) && hoverIndex - 1 === itemIndex) ||
          // 3) independentCombinators is true and the drop target is just above the hovering item
          (schema.independentCombinators &&
            pathsAreEqual(parentHoverPath, parentItemPath) &&
            hoverIndex === itemIndex - 1)
        );
      },
      collect: monitor => ({
        isOver: monitor.canDrop() && monitor.isOver(),
        dropMonitorId: monitor.getHandlerId() ?? '',
        dropEffect: isHotkeyPressed(copyModeModifierKey) ? 'copy' : 'move',
        groupItems: isHotkeyPressed(groupModeModifierKey),
      }),
      drop: () => {
        const { qbId, getQuery, dispatchQuery } = schema;
        const dropEffect = isHotkeyPressed(copyModeModifierKey) ? 'copy' : 'move';
        const groupItems = isHotkeyPressed(groupModeModifierKey);

        return {
          type: 'inlineCombinator',
          path,
          qbId,
          getQuery,
          dispatchQuery,
          groupItems,
          dropEffect,
        };
      },
    }),
    [canDrop, hoveringItem, path, schema]
  );

  drop(dropRef);

  return { dropRef, dropMonitorId, isOver, dropEffect };
};
