import { useCallback, useMemo } from 'react';
import type { ValueSelectorProps } from '../types';
import { joinWith, toArray } from '../utils';

export type UseValueSelectorParams = Pick<
  ValueSelectorProps,
  'handleOnChange' | 'listsAsArrays' | 'multiple' | 'value'
>;

/**
 * Transforms a value into an array when appropriate and provides
 * a memoized change handler.
 */
export const useValueSelector = (props: UseValueSelectorParams) => {
  const { handleOnChange, listsAsArrays = false, multiple = false, value } = props;

  const onChange = useCallback(
    (v: string | string[]) => {
      if (multiple) {
        const valueAsArray = toArray(v);
        handleOnChange(listsAsArrays ? valueAsArray : joinWith(valueAsArray, ','));
      } else {
        handleOnChange(v);
      }
    },
    [handleOnChange, listsAsArrays, multiple]
  );

  const val = useMemo(() => (multiple ? toArray(value) : value), [multiple, value]);

  return {
    /**
     * Memoized change handler for value selectors
     */
    onChange,
    /**
     * The value as provided or, if appropriate, as an array
     */
    val,
  };
};
