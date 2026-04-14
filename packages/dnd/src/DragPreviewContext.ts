import type { Context } from 'react';
import { createContext } from 'react';
import type { DndDropTargetType, Path } from 'react-querybuilder';
import type { DragPreviewState } from './types';

/**
 * Context value for the drag preview state during update-while-dragging.
 *
 * @group DnD
 */
export interface DragPreviewContextValue {
  /** Current drag preview state, or `null` when not actively dragging. */
  dragPreviewState: DragPreviewState | null;
  /**
   * Update the preview position. Called by adapter hooks when the cursor
   * enters a new quadrant of a rule or group.
   */
  updatePreviewPosition: (
    targetPath: Path,
    targetType: DndDropTargetType,
    quadrant: 'upper' | 'lower'
  ) => void;
  /**
   * Commit the current shadow query as the real query and clear preview state.
   * Called on drop.
   */
  commitDrag: () => void;
  /**
   * Discard the shadow query and revert to the original query.
   * Called on cancel.
   */
  cancelDrag: () => void;
}

const noop = (): void => {};

/** @group Components */
export const DragPreviewContext: Context<DragPreviewContextValue> =
  createContext<DragPreviewContextValue>({
    dragPreviewState: null,
    updatePreviewPosition: noop,
    commitDrag: noop,
    cancelDrag: noop,
  });
