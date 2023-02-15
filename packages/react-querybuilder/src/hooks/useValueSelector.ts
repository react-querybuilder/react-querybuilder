import type { ValueSelectorProps } from '@react-querybuilder/ts';
import { useCallback, useMemo } from 'react';
import { joinWith, toArray } from '../utils';

export type UseValueSelectorParams = Pick<
  ValueSelectorProps,
  'handleOnChange' | 'listsAsArrays' | 'multiple' | 'value'
>;

/**
 * Transforms a value into an array when appropriate and provides
 * a memoized change handler.
 */
export const useValueSelector = ({
  handleOnChange,
  listsAsArrays = false,
  multiple = false,
  value,
}: UseValueSelectorParams) => {
  const onChange = useCallback(
    (v: string | string[]) => {
      if (multiple) {
        const valArray = toArray(v);
        handleOnChange(listsAsArrays ? valArray : joinWith(valArray, ','));
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
