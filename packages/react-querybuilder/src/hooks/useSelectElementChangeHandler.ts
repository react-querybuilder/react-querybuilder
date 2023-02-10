import type { ChangeEvent } from 'react';
import { useMemo } from 'react';

interface UseSelectElementChangeHandlerParams {
  onChange: (v: string | string[]) => void;
  multiple?: boolean;
}

/**
 * Returns a memoized change handler for HTML select elements.
 */
export const useSelectElementChangeHandler = ({
  multiple,
  onChange,
}: UseSelectElementChangeHandlerParams) => {
  const selectElementChangeHandler = useMemo(
    () =>
      multiple
        ? (e: ChangeEvent<HTMLSelectElement>) =>
            onChange(Array.from(e.target.selectedOptions).map(o => o.value))
        : (e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value),
    [multiple, onChange]
  );

  return selectElementChangeHandler;
};
