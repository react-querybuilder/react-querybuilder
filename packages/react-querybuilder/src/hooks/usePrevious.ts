import { useRef } from 'react';

/**
 * Returns the prop value from the last render.
 *
 * Adapted from https://usehooks.com/usePrevious/.
 */
export const usePrevious = <T>(value: T) => {
  const ref = useRef<{ value: T | null; prev: T | null }>({
    value: value,
    prev: null,
  });

  const current = ref.current.value;

  if (value !== current) {
    ref.current = {
      value: value,
      prev: current,
    };
  }

  return ref.current.prev;
};
