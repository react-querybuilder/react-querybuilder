import { produce } from 'immer';
import { useCallback, useEffect, useMemo } from 'react';
import type { FullField, ParseNumberMethod, ValueEditorProps } from '../types';
import { getFirstOption, joinWith, parseNumber, toArray } from '../utils';
import clsx from '../utils/clsx';
import { standardClassnames } from '../defaults';

/**
 * This hook is primarily concerned with multi-value editors like date range
 * pickers, editors for 'in' and 'between' operators, etc.
 *
 * @returns The value as an array (`valueAsArray`) and a change handler for
 * series of editors (`multiValueHandler`).
 *
 * **NOTE:** The following logic only applies if `skipHook` is not `true`. To avoid
 * automatically updating the `value`, pass `{ skipHook: true }`.
 *
 * If the `value` is an array of non-zero length, the `operator` is _not_ one of
 * the known multi-value operators ("between", "notBetween", "in", "notIn"), and
 * the `type` is not "multiselect", then the `value` will be set to the first
 * element of the array (i.e., `value[0]`).
 *
 * The same thing will happen if `inputType` is "number" and `value` is a string
 * containing a comma, since `<input type="number">` doesn't handle commas.
 *
 * @example
 * // Consider the following rule:
 * `{ field: "f1", operator: "in", value: ["twelve","fourteen"] }`
 * // If `operator` changes to "=", the value will be reset to "twelve".
 *
 * @example
 * // Consider the following rule:
 * `{ field: "f1", operator: "between", value: "12,14" }`
 * // If `operator` changes to "=", the value will be reset to "12".
 */
export const useValueEditor = <F extends FullField = FullField, O extends string = string>(
  props: ValueEditorProps<F, O>
): {
  /**
   * Array of values for when the main value represents a list, e.g. when operator
   * is "between" or "in".
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  valueAsArray: any[];
  /**
   * An update handler for a series of value editors, e.g. when operator is "between".
   * Calling this function will update a single element of the value array and leave
   * the rest of the array as is.
   *
   * @param {string} val The new value for the editor
   * @param {number} idx The index of the editor (and the array element to update)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  multiValueHandler: (val: any, idx: number) => void;
  /**
   * Evaluated `parseNumber` method based on `parseNumbers` prop. This property ends up
   * being the same as the `parseNumbers` prop minus the "-limited" suffix, unless
   * the "-limited" suffix is present and the `inputType` is not "number", in which case
   * it's set to `false`.
   */
  parseNumberMethod: ParseNumberMethod;
  /**
   * Class for items in a value editor series (e.g. "between" value editors).
   */
  valueListItemClassName: string;
} => {
  const {
    handleOnChange,
    inputType,
    operator,
    value,
    listsAsArrays,
    parseNumbers,
    values,
    type,
    skipHook,
    schema: { classNames: classNamesProp, suppressStandardClassnames },
  } = props;

  useEffect(() => {
    if (
      !skipHook &&
      type !== 'multiselect' &&
      !['between', 'notBetween', 'in', 'notIn'].includes(operator) &&
      (Array.isArray(value) ||
        (inputType === 'number' && typeof value === 'string' && value.includes(',')))
    ) {
      handleOnChange(toArray(value, { retainEmptyStrings: true })[0] ?? '');
    }
  }, [handleOnChange, inputType, operator, skipHook, type, value]);

  const valueAsArray = useMemo(() => toArray(value, { retainEmptyStrings: true }), [value]);

  const parseNumberMethod = useMemo((): ParseNumberMethod => {
    if (typeof parseNumbers === 'string') {
      const [method, level] = parseNumbers.split('-') as
        | [ParseNumberMethod, 'limited']
        | [ParseNumberMethod];
      if (level === 'limited') {
        return inputType === 'number' ? method : false;
      }

      return method;
    }

    return parseNumbers ? 'strict' : false;
  }, [inputType, parseNumbers]);

  const multiValueHandler = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (val: any, idx: number) => {
      const v = produce(valueAsArray, va => {
        va[idx] = parseNumber(val, { parseNumbers: parseNumberMethod });
        // Enforce an array length of (at least) two for "between"/"notBetween"
        if (
          idx === 0 &&
          (operator === 'between' || operator === 'notBetween') &&
          (va.length < 2 || va[1] === undefined)
        ) {
          va[1] = getFirstOption(values);
        }
      });
      handleOnChange(listsAsArrays ? v : joinWith(v, ','));
    },
    [handleOnChange, listsAsArrays, operator, parseNumberMethod, valueAsArray, values]
  );

  const valueListItemClassName = clsx(
    suppressStandardClassnames || standardClassnames.valueListItem,
    // Optional chaining is necessary for QueryBuilderNative
    classNamesProp?.valueListItem
  );

  return {
    valueAsArray,
    multiValueHandler,
    parseNumberMethod,
    valueListItemClassName,
  };
};
