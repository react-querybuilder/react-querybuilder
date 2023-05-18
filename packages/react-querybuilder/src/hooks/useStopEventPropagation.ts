import type { MouseEvent as ReactMouseEvent } from 'react';
import { objectEntries } from '../utils';

type EventMethod = (event: ReactMouseEvent, context?: any) => void;
type MethodObject<Keys extends string> = { [Key in Keys]: EventMethod };

export const useStopEventPropagation = <Keys extends string>(methods: MethodObject<Keys>) => {
  const augmentedMethods: Partial<MethodObject<Keys>> = {};
  const entries = objectEntries(methods);

  for (const [fnName, fn] of entries) {
    const augmentedMethod: EventMethod = (event, context) => {
      event.preventDefault();
      event.stopPropagation();
      fn(event, context);
    };
    augmentedMethods[fnName] = augmentedMethod;
  }

  // All object keys have been copied into this object so we can
  // safely remove the `Partial<>` modifier.
  return augmentedMethods as MethodObject<Keys>;
};
