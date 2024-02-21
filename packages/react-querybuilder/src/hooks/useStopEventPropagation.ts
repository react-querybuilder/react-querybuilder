import type { MouseEvent } from 'react';
import { useCallback } from 'react';

/**
 * Wraps an event handler function in another function that calls
 * `event.preventDefault()` and `event.stopPropagation()` first. The
 * returned function accepts and forwards a second `context` argument.
 */
export const useStopEventPropagation = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  method: (event?: MouseEvent, context?: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ((event?: MouseEvent, context?: any) => void) => {
  return useCallback(
    (event, context) => {
      event?.preventDefault();
      event?.stopPropagation();
      method(event, context);
    },
    [method]
  );
};
