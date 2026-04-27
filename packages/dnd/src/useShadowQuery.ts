import { useContext } from 'react';
import type { RuleGroupTypeAny } from 'react-querybuilder';
import { DragPreviewContext } from './DragPreviewContext';

/**
 * Hook for consuming the shadow query during an active drag with
 * `updateWhileDragging` enabled.
 *
 * @returns The shadow query if a drag is in progress, otherwise `undefined`.
 *
 * @group Hooks
 */
export const useShadowQuery = (): RuleGroupTypeAny | undefined => {
  const { dragPreviewState } = useContext(DragPreviewContext);
  return dragPreviewState?.shadowQuery;
};
