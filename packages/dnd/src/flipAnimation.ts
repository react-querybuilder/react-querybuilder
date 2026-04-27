/**
 * FLIP (First, Last, Invert, Play) animation utility.
 *
 * Captures the positions of elements before a DOM update, then after the
 * update animates them from their old positions to their new ones using
 * CSS transforms, producing a smooth layout transition.
 *
 * @example
 * ```ts
 * const flip = createFlipAnimator('.rule, .ruleGroup');
 * flip.captureFirst(containerEl);
 * // ... React re-render happens ...
 * useLayoutEffect(() => { flip.playLast(containerEl); }, [shadowQuery]);
 * ```
 */

const FLIP_DURATION_MS = 150;
const FLIP_EASING = 'ease';

export interface FlipAnimator {
  /** Capture the "first" positions of all matching elements. */
  captureFirst: (container: HTMLElement) => void;
  /**
   * Measure "last" positions, compute deltas, and animate.
   * Call this in `useLayoutEffect` after React has committed the new DOM.
   */
  playLast: (container: HTMLElement) => void;
}

const getElementKey = (el: Element): string | null =>
  el.getAttribute('data-rule-id') ?? el.getAttribute('data-testid') ?? null;

/**
 * Creates a FLIP animator that tracks elements matching the given CSS selector
 * within a container. Elements are identified by their `data-rule-id` or `data-testid`
 * attribute.
 */
export const createFlipAnimator = (selector: string): FlipAnimator => {
  let firstPositions = new Map<string, DOMRect>();

  const captureFirst = (container: HTMLElement): void => {
    firstPositions = new Map();
    const elements = container.querySelectorAll(selector);
    for (const el of elements) {
      const key = getElementKey(el);
      if (key) {
        firstPositions.set(key, el.getBoundingClientRect());
      }
    }
  };

  const playLast = (container: HTMLElement): void => {
    const elements = container.querySelectorAll(selector);
    for (const el of elements) {
      const key = getElementKey(el);
      if (!key) continue;

      const firstRect = firstPositions.get(key);
      if (!firstRect) continue;

      const lastRect = el.getBoundingClientRect();
      const deltaX = firstRect.left - lastRect.left;
      const deltaY = firstRect.top - lastRect.top;

      if (deltaX === 0 && deltaY === 0) continue;

      // Invert: place element at its old position
      const htmlEl = el as HTMLElement;
      htmlEl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      htmlEl.style.transition = 'none';

      // Play: animate to new position
      requestAnimationFrame(() => {
        htmlEl.style.transition = `transform ${FLIP_DURATION_MS}ms ${FLIP_EASING}`;
        htmlEl.style.transform = '';

        const handleTransitionEnd = (): void => {
          htmlEl.style.transition = '';
          htmlEl.removeEventListener('transitionend', handleTransitionEnd);
        };
        htmlEl.addEventListener('transitionend', handleTransitionEnd);
      });
    }

    firstPositions = new Map();
  };

  return { captureFirst, playLast };
};
