import type {
  DndDropTargetType,
  DraggedItem,
  DropEffect,
  Path,
  RuleGroupTypeAny,
} from 'react-querybuilder';
import { getParentPath, group, move } from 'react-querybuilder';

/**
 * Computes the destination path for a quadrant-based drag target.
 *
 * - **Rule, upper quadrant**: Insert before the target rule.
 * - **Rule, lower quadrant**: Insert after the target rule.
 * - **RuleGroup header**: Insert as first child of the group (position 0).
 */
export const computeDestinationFromQuadrant = (
  targetPath: Path,
  targetType: DndDropTargetType,
  quadrant: 'upper' | 'lower'
): Path => {
  if (targetType === 'ruleGroup') {
    // Group header → insert as first child
    return [...targetPath, 0];
  }

  // Rule target
  const parentPath = getParentPath(targetPath);
  const targetIndex = targetPath.at(-1)!;

  if (quadrant === 'upper') {
    // Insert before the target
    return [...parentPath, targetIndex];
  }
  // Insert after the target
  return [...parentPath, targetIndex + 1];
};

/**
 * Checks whether the dragged item is already at the computed destination,
 * meaning no visual change would occur.
 */
const isNoOp = (draggedPath: Path, destinationPath: Path): boolean => {
  if (draggedPath.length !== destinationPath.length) return false;

  const parentDragged = getParentPath(draggedPath);
  const parentDest = getParentPath(destinationPath);

  // Different parents → not a no-op
  if (parentDragged.length !== parentDest.length) return false;
  for (let i = 0; i < parentDragged.length; i++) {
    if (parentDragged[i] !== parentDest[i]) return false;
  }

  const dragIdx = draggedPath.at(-1)!;
  const destIdx = destinationPath.at(-1)!;

  // Moving to same position or position+1 (which resolves to same after removal)
  return destIdx === dragIdx || destIdx === dragIdx + 1;
};

/**
 * Computes a shadow query given the current drag state and target position.
 *
 * Uses the existing `move()` and `group()` utilities from `@react-querybuilder/core`
 * to produce an immutable preview of the query with the dragged item at its
 * prospective position.
 *
 * @returns The shadow query and the path where the dragged item now lives,
 *          or `null` if the move would be a no-op.
 */
export const computeShadowQuery = ({
  originalQuery,
  // draggedItem,
  draggedPath,
  targetPath,
  targetType,
  quadrant,
  dropEffect,
  groupItems,
}: {
  originalQuery: RuleGroupTypeAny;
  draggedItem: DraggedItem;
  draggedPath: Path;
  targetPath: Path;
  targetType: DndDropTargetType;
  quadrant: 'upper' | 'lower';
  dropEffect: DropEffect;
  groupItems: boolean;
}): { shadowQuery: RuleGroupTypeAny; previewPath: Path } | null => {
  const destinationPath = computeDestinationFromQuadrant(targetPath, targetType, quadrant);
  const isClone = dropEffect === 'copy';

  if (groupItems) {
    // Group mode: create a new group containing both items
    try {
      const shadowQuery = group(originalQuery, draggedPath, targetPath, { clone: isClone });
      // After grouping, the dragged item is inside the new group.
      // The new group is at targetPath, and the source item is at index 0 or 1
      // depending on relative positions. For preview purposes, use targetPath.
      return { shadowQuery, previewPath: targetPath };
    } catch {
      return null;
    }
  }

  // Normal move/copy
  if (!isClone && isNoOp(draggedPath, destinationPath)) {
    return null;
  }

  try {
    const shadowQuery = move(originalQuery, draggedPath, destinationPath, { clone: isClone });
    // Compute the preview path: where the item ended up after the move.
    // After a move, the destination path may shift if the source was before it.
    // For preview purposes, we approximate: if source was before dest in same parent,
    // the effective dest shifts back by 1.
    let previewPath = destinationPath;
    if (!isClone) {
      const parentDragged = getParentPath(draggedPath);
      const parentDest = getParentPath(destinationPath);
      const sameParent =
        parentDragged.length === parentDest.length &&
        parentDragged.every((v, i) => v === parentDest[i]);
      if (sameParent) {
        const dragIdx = draggedPath.at(-1)!;
        const destIdx = destinationPath.at(-1)!;
        if (dragIdx < destIdx) {
          previewPath = [...parentDest, destIdx - 1];
        }
      }
    }
    return { shadowQuery, previewPath };
  } catch {
    return null;
  }
};
