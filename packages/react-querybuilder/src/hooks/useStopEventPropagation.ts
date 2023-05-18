import type { MouseEvent as ReactMouseEvent } from 'react';

type EventMethod = (event: ReactMouseEvent, context?: any) => void;
type MethodObject = Record<string, EventMethod>;

export const useStopEventPropagation = (methods: MethodObject) => {
  const augmentedMethods: MethodObject = {};

  for (const [fnName, fn] of Object.entries(methods)) {
    const augmentedMethod: EventMethod = (event, context) => {
      event.preventDefault();
      event.stopPropagation();
      fn(event, context);
    };
    augmentedMethods[fnName] = augmentedMethod;
  }

  return augmentedMethods;
};
