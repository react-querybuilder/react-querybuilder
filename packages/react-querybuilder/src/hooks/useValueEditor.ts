import { produce } from 'immer';
import { useCallback, useEffect, useMemo } from 'react';
import type { ValueEditorProps } from '../types';
import { getFirstOption, joinWith, parseNumber, toArray } from '../utils';

export type UseValueEditorParams = Pick<
  ValueEditorProps,
  | 'handleOnChange'
  | 'inputType'
  | 'operator'
  | 'value'
  | 'listsAsArrays'
  | 'type'
  | 'values'
  | 'parseNumbers'
  | 'skipHook'
>;

/**
 * This effect trims the value if all of the following are true:
 * - `inputType` is "number"
 * - `operator` is _not_ one of ("between", "notBetween", "in", "notIn")
 * - `value` is either an array or a string containing a comma
 *
 * For example, consider the following rule:
 *
 * `{ field: "f1", operator: "between", value: "12,14" }`
 *
 * If its operator changes to "=", the value will be reset to "12" since
 * the "number" input type can't handle arrays or strings with commas.
 *
 * @returns The value as an array and a change handler for series of editors.
 */
export const useValueEditor = ({
  handleOnChange,
  inputType,
  operator,
  value,
  listsAsArrays,
  parseNumbers,
  values,
  skipHook,
}: UseValueEditorParams) => {
  useEffect(() => {
    if (skipHook) return;
    if (
      inputType === 'number' &&
      !['between', 'notBetween', 'in', 'notIn'].includes(operator) &&
      ((typeof value === 'string' && value.includes(',')) || Array.isArray(value))
    ) {
      handleOnChange(toArray(value)[0] ?? '');
    }
  }, [handleOnChange, inputType, operator, skipHook, value]);

  const valueAsArray = useMemo(() => toArray(value), [value]);

  const multiValueHandler = useCallback(
    (v: any, i: number) => {
      const val = produce(valueAsArray, va => {
        va[i] = parseNumber(v, { parseNumbers });
        // Enforce an array length of (at least) two for "between"/"notBetween"
        if (
          i === 0 &&
          (operator === 'between' || operator === 'notBetween') &&
          (va.length < 2 || typeof va[1] === 'undefined')
        ) {
          va[1] = getFirstOption(values);
        }
      });
      handleOnChange(listsAsArrays ? val : joinWith(val, ','));
    },
    [handleOnChange, listsAsArrays, operator, parseNumbers, valueAsArray, values]
  );

  return {
    /**
     * Array of values for when the main value represents a list, e.g. when operator
     * is "between" or "in".
     */
    valueAsArray,
    /**
     * An update handler for a series of value editors, e.g. when operator is "between".
     * Calling this function will update a single element of the value array and leave
     * the rest of the array as is.
     *
     * @param {string} val The new value for the editor
     * @param {number} idx The index of the editor (and the array element to update)
     */
    multiValueHandler,
  };
};
