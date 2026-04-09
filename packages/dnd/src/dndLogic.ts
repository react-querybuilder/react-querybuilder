import type {
  DndDropTargetType,
  DraggedItem,
  DropEffect,
  DropResult,
  Path,
  QueryActions,
  RuleGroupTypeAny,
  RuleType,
  Schema,
} from 'react-querybuilder';
import {
  add,
  findPath,
  getParentPath,
  group,
  insert,
  isAncestor,
  pathsAreEqual,
} from 'react-querybuilder';
import { isHotkeyPressed } from './isHotkeyPressed';
import type { CustomCanDropParams } from './types';

// #region canDrop validators

/**
 * Determines whether a drag item can be dropped on a rule target.
 */
export const canDropOnRule = ({
  dragging,
  path,
  schema,
  canDrop,
  groupModeModifierKey,
  disabled,
  rule,
}: {
  dragging: DraggedItem;
  path: Path;
  // oxlint-disable-next-line typescript/no-explicit-any
  schema: Schema<any, any>;
  canDrop?: (params: CustomCanDropParams) => boolean;
  groupModeModifierKey: string;
  disabled: boolean;
  rule: RuleType;
}): boolean => {
  if (
    (isHotkeyPressed(groupModeModifierKey) && disabled) ||
    (dragging &&
      typeof canDrop === 'function' &&
      !canDrop({ dragging, hovering: { ...rule, path, qbId: schema.qbId } }))
  ) {
    return false;
  }

  if (schema.qbId !== dragging.qbId) return true;

  const parentHoverPath = getParentPath(path);
  const parentItemPath = getParentPath(dragging.path);
  const hoverIndex = path.at(-1);
  const itemIndex = dragging.path.at(-1)!;

  // Disallow drop if...
  // prettier-ignore
  return !(
    // 1) item is ancestor of drop target, OR
    isAncestor(dragging.path, path) ||
    // 2) item is hovered over itself, OR
    (pathsAreEqual(path, dragging.path)) ||
    // 3) item is hovered over the previous item AND this is a move, not a group
    (!isHotkeyPressed(groupModeModifierKey) && pathsAreEqual(parentHoverPath, parentItemPath) &&
      (hoverIndex === itemIndex - 1 ||
        (schema.independentCombinators && hoverIndex === itemIndex - 2)))
  );
};

/**
 * Determines whether a drag item can be dropped on a rule group target.
 */
export const canDropOnRuleGroup = ({
  dragging,
  path,
  schema,
  canDrop,
  disabled,
  ruleGroup,
}: {
  dragging: DraggedItem;
  path: Path;
  // oxlint-disable-next-line typescript/no-explicit-any
  schema: Schema<any, any>;
  canDrop?: (params: CustomCanDropParams) => boolean;
  disabled: boolean;
  ruleGroup: RuleGroupTypeAny;
}): boolean => {
  if (
    disabled ||
    (dragging &&
      typeof canDrop === 'function' &&
      !canDrop({ dragging, hovering: { ...ruleGroup, path, qbId: schema.qbId } }))
  ) {
    return false;
  }

  if (schema.qbId !== dragging.qbId) return true;

  const parentItemPath = getParentPath(dragging.path);
  const itemIndex = dragging.path.at(-1);
  // Disallow drop if...
  // prettier-ignore
  return !(
    // 1) item is ancestor of drop target, OR
    isAncestor(dragging.path, path) ||
    // 2) item is first child and is dropped on its own group header, OR
    (pathsAreEqual(path, parentItemPath) && itemIndex === 0) ||
    // 3) the group is dropped on itself
    pathsAreEqual(path, dragging.path)
  );
};

/**
 * Determines whether a drag item can be dropped on an inline combinator target.
 */
export const canDropOnInlineCombinator = ({
  dragging,
  path,
  schema,
  canDrop,
  groupModeModifierKey,
  hoveringItem,
}: {
  dragging: DraggedItem;
  path: Path;
  // oxlint-disable-next-line typescript/no-explicit-any
  schema: Schema<any, any>;
  canDrop?: (params: CustomCanDropParams) => boolean;
  groupModeModifierKey: string;
  hoveringItem: RuleType | RuleGroupTypeAny;
}): boolean => {
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
};

// #endregion

// #region Drop result builders

/**
 * Builds a {@link DropResult} for a given target.
 */
export const buildDropResult = ({
  type,
  path,
  schema,
  copyModeModifierKey,
  groupModeModifierKey,
}: {
  type: DndDropTargetType;
  path: Path;
  // oxlint-disable-next-line typescript/no-explicit-any
  schema: Schema<any, any>;
  copyModeModifierKey: string;
  groupModeModifierKey: string;
}): DropResult => {
  const { qbId, getQuery, dispatchQuery } = schema;
  return {
    type,
    path,
    qbId,
    getQuery,
    dispatchQuery,
    groupItems: isHotkeyPressed(groupModeModifierKey),
    dropEffect: isHotkeyPressed(copyModeModifierKey) ? 'copy' : 'move',
  };
};

/**
 * Collects the current drop state from modifier keys.
 */
export const collectDropState = (
  copyModeModifierKey: string,
  groupModeModifierKey: string
): { dropEffect: DropEffect; groupItems: boolean } => ({
  dropEffect: isHotkeyPressed(copyModeModifierKey) ? 'copy' : 'move',
  groupItems: isHotkeyPressed(groupModeModifierKey),
});

// #endregion

// #region Drop handling

/**
 * Computes the destination path for a drop operation based on the drop target
 * type and whether grouping mode is active.
 */
export const getDestinationPath = (dropResult: DropResult, groupItems: boolean): Path => {
  const parentHoverPath = getParentPath(dropResult.path);
  const hoverIndex = dropResult.path.at(-1)!;

  if (groupItems) {
    return dropResult.path;
  }
  if (dropResult.type === 'ruleGroup') {
    return [...dropResult.path, 0];
  }
  if (dropResult.type === 'inlineCombinator') {
    return [...parentHoverPath, hoverIndex];
  }
  // rule
  return [...parentHoverPath, hoverIndex + 1];
};

/**
 * Handles the actual query mutation when a drop completes.
 * Supports move, copy, group, and cross-query-builder operations.
 */
export const handleDrop = ({
  item,
  dropResult,
  schema,
  actions,
  copyModeModifierKey,
  groupModeModifierKey,
}: {
  item: DraggedItem;
  dropResult: DropResult | null;
  // oxlint-disable-next-line typescript/no-explicit-any
  schema: Schema<any, any>;
  actions: QueryActions;
  copyModeModifierKey: string;
  groupModeModifierKey: string;
}): void => {
  if (!dropResult) return;

  const dropEffect = isHotkeyPressed(copyModeModifierKey) ? 'copy' : 'move';
  const groupItems = isHotkeyPressed(groupModeModifierKey);
  const destinationPath = getDestinationPath(dropResult, groupItems);

  if (schema.qbId === dropResult.qbId) {
    if (groupItems) {
      actions.groupRule(item.path, destinationPath, dropEffect === 'copy');
    } else {
      actions.moveRule(item.path, destinationPath, dropEffect === 'copy');
    }
  } else {
    const otherBuilderQuery = dropResult.getQuery();
    // istanbul ignore else
    if (otherBuilderQuery) {
      if (groupItems) {
        dropResult.dispatchQuery(
          group(
            add(otherBuilderQuery, item, []),
            [otherBuilderQuery.rules.length],
            destinationPath,
            { clone: false }
          )
        );
      } else {
        dropResult.dispatchQuery(insert(otherBuilderQuery, item, destinationPath));
      }
      // istanbul ignore else
      if (dropEffect !== 'copy') {
        actions.onRuleRemove(item.path);
      }
    }
  }
};

/**
 * Creates the drag item from the current path and schema, used by
 * drag-start callbacks.
 */
export const getDragItem = (
  path: Path,
  // oxlint-disable-next-line typescript/no-explicit-any
  schema: Schema<any, any>
): DraggedItem => ({
  ...findPath(path, schema.getQuery())!,
  path,
  qbId: schema.qbId,
});

// #endregion
