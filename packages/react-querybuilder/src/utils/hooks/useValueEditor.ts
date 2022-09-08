import type { ValueEditorProps } from '@react-querybuilder/ts';
import { useEffect } from 'react';
import { toArray } from '../arrayUtils';

type useValueEditorParams = Pick<
  ValueEditorProps,
  'handleOnChange' | 'inputType' | 'operator' | 'value'
>;

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
}: useValueEditorParams) => {
  useEffect(() => {
    if (
      inputType === 'number' &&
      !['between', 'notBetween', 'in', 'notIn'].includes(operator) &&
      ((typeof value === 'string' && value.includes(',')) || Array.isArray(value))
    ) {
      handleOnChange(toArray(value)[0] ?? '');
    }
  }, [handleOnChange, inputType, operator, value]);
};
