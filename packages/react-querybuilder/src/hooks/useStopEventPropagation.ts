import { useCallback, type MouseEvent as ReactMouseEvent } from 'react';

type EventMethod = (event: ReactMouseEvent, context?: any) => void;

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
