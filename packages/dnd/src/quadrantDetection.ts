/**
 * Determines whether the cursor is in the upper quadrant (top 25%),
 * lower quadrant (bottom 25%), or middle zone (center 50%) of an element.
 *
 * Returns `null` when the cursor is in the middle zone, indicating
 * no positional change should occur.
 */
export const getQuadrant = (element: HTMLElement, clientY: number): 'upper' | 'lower' | null => {
  const rect = element.getBoundingClientRect();
  const quarterHeight = rect.height / 4;
  if (clientY < rect.top + quarterHeight) return 'upper';
  if (clientY > rect.bottom - quarterHeight) return 'lower';
  return null;
};
