/**
 * Determines whether the cursor is in the upper or lower half of an element.
 *
 * Used by the update-while-dragging feature to decide whether a dragged item
 * should be inserted before or after the hovered element.
 */
export const getQuadrant = (element: HTMLElement, clientY: number): 'upper' | 'lower' => {
  const rect = element.getBoundingClientRect();
  const midpoint = rect.top + rect.height / 2;
  return clientY < midpoint ? 'upper' : 'lower';
};
