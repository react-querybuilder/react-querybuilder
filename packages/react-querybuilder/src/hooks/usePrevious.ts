import { useEffect, useRef } from 'react';

/**
 * Returns the prop value from the last render.
 *
 * Adapted from https://usehooks.com/usePrevious/.
 */
export const usePrevious = <T>(value: T) => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
