// From https://usehooks.com/usePrevious/
import { useEffect, useRef } from 'react';

export const usePrevious = <T>(value: T) => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
