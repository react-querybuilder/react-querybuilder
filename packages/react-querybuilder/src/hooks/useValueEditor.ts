import type { ValueEditorProps } from '@react-querybuilder/ts';
import { useEffect } from 'react';
import { getFirstOption, joinWith, parseNumber, toArray } from '../utils';

type useValueEditorParams = Pick<
  ValueEditorProps,
  | 'handleOnChange'
  | 'inputType'
  | 'operator'
  | 'value'
  | 'listsAsArrays'
  | 'type'
  | 'values'
  | 'parseNumbers'
> & { skipHook?: boolean };

/**
 * This Effect trims the value if all of the following are true:
 *  - `inputType` is "number"
 *  - `operator` is not one of ("between", "notBetween", "in", "notIn")
 *  - `value` is an array OR the value is a string containing a comma
 *
 * For example, consider the following rule:
 *
 * `{ field: "f1", operator: "between", value: "12,14" }`
 *
 * If its operator changes to "=", the value will be reset to "12" since
 * the "number" input type can't handle arrays or strings with commas.
 */
export const useValueEditor = ({
  handleOnChange,
  inputType,
  operator,
  value,
  type,
  listsAsArrays,
  parseNumbers,
  values,
  skipHook,
}: useValueEditorParams) => {
  let valArray: any[] = [];
  let betweenValueHandler: (v: string, i: number) => void = v => handleOnChange(v);

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

  if (
    (operator === 'between' || operator === 'notBetween') &&
    (type === 'select' || type === 'text')
  ) {
    valArray = toArray(value);
    betweenValueHandler = (v: string, i: number) => {
      const vParsed = parseNumber(v, { parseNumbers });
      const val =
        i === 0
          ? [vParsed, valArray[1] ?? getFirstOption(values), ...valArray.slice(2)]
          : [valArray[0], vParsed, ...valArray.slice(2)];
      handleOnChange(listsAsArrays ? val : joinWith(val, ','));
    };
  }

  return { valArray, betweenValueHandler };
};
