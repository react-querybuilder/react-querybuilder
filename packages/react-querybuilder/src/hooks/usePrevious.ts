import { useState } from 'react';

/**
 * Returns the prop value from the last render.
 *
 * Adapted from https://usehooks.com/usePrevious/.
 *
 * @group Hooks
 */
export const usePrevious = <T>(value: T): T | null => {
  const [current, setCurrent] = useState<T | null>(value);
  const [previous, setPrevious] = useState<T | null>(null);

  // Adjust state during render instead of mutating a ref's `current` (which the
  // React Compiler forbids during render). Returns the prior distinct value.
  if (value !== current) {
    setPrevious(current);
    setCurrent(value);
  }

  return previous;
};
