import { useCallback, type MouseEvent as ReactMouseEvent } from 'react';

type EventMethod = (event: ReactMouseEvent, context?: any) => void;

/**
 * Wraps an event handler function in another function that calls
 * `event.preventDefault()` and `event.stopPropagation()` first. The
 * returned function accepts and forwards a second `context` argument.
 */
export const useStopEventPropagation = (method: EventMethod): EventMethod => {
  return useCallback(
    (event, context) => {
      event.preventDefault();
      event.stopPropagation();
      method(event, context);
    },
    [method]
  );
};
