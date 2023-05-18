import type { MouseEvent as ReactMouseEvent } from 'react';
import { objectEntries } from '../utils';

type EventMethod = (event: ReactMouseEvent, context?: any) => void;
type MethodObject<Keys extends string> = { [Key in Keys]: EventMethod };

export const useStopEventPropagation = <Keys extends string>(methods: MethodObject<Keys>) => {
  // The `as` below is lying to TypeScript because the keys don't exist in
  // the object yet, but they will later on so this is relatively safe.
  const wrappedMethods = {} as MethodObject<Keys>;

  for (const [fnName, fn] of objectEntries(methods)) {
    wrappedMethods[fnName] = (event, context) => {
      event.preventDefault();
      event.stopPropagation();
      fn(event, context);
    };
  }

  return wrappedMethods;
};
