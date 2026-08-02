import type { InputType, ParseNumberMethod } from '../types';
import { joinWith, toArray } from './arrayUtils';
import { getFirstOption } from './optGroupUtils';
import { parseNumber } from './parseNumber';

/** Operators whose value is a list rather than a single scalar. */
const multiValueOperators = new Set(['between', 'notBetween', 'in', 'notIn']);

/**
 * Whether an operator's value is a list of two bounds.
 *
 * @group Value Editors
 */
export const isBetweenOperator = (operator: string): boolean =>
  operator === 'between' || operator === 'notBetween';

/**
 * Determines whether a rule's `value` needs to be collapsed to a single element because it no
 * longer represents a list, and what it should become.
 *
 * This happens when the value is an array (or a comma-containing string in a `number` input,
 * which `<input type="number">` can't display) while the operator is not one of the multi-value
 * operators and the editor is not a multiselect—typically right after the operator changes from
 * `"in"` or `"between"` to something else.
 *
 * The React `useValueEditor` hook applies the result in an effect; other implementations may
 * apply it wherever is idiomatic.
 *
 * @group Value Editors
 */
export const getValueEditorReset = ({
  skipHook,
  type,
  operator,
  value,
  inputType,
}: {
  skipHook?: boolean;
  type?: string;
  operator: string;
  value: unknown;
  inputType?: InputType | null;
}): { reset: boolean; value: unknown } => {
  const reset =
    !skipHook &&
    type !== 'multiselect' &&
    !multiValueOperators.has(operator) &&
    (Array.isArray(value) ||
      (inputType === 'number' && typeof value === 'string' && value.includes(',')));

  return reset
    ? { reset: true, value: toArray(value, { retainEmptyStrings: true })[0] ?? '' }
    : { reset: false, value };
};

/**
 * Produces the next value for a series of value editors when the editor at `index` changes.
 *
 * For `between`/`notBetween`, editing the first bound guarantees an array of at least two
 * elements, seeding the second from the first available option. The result is a comma-joined
 * string unless `listsAsArrays` is `true`.
 *
 * @group Value Editors
 */
export const getMultiValueUpdate = ({
  value,
  index,
  valueAsArray,
  operator,
  values,
  listsAsArrays,
  parseNumberMethod,
}: {
  value: unknown;
  index: number;
  valueAsArray: unknown[];
  operator: string;
  // Matches the `values` prop on value editors, which is loosely typed by design.
  // oxlint-disable-next-line typescript/no-explicit-any
  values?: any[];
  listsAsArrays?: boolean;
  parseNumberMethod?: ParseNumberMethod;
}): unknown => {
  const parsedVal = parseNumber(value, { parseNumbers: parseNumberMethod });
  const needsBetweenFix =
    index === 0 &&
    isBetweenOperator(operator) &&
    (valueAsArray.length < 2 || valueAsArray[1] === undefined);

  // Unchanged at this index and no bounds to backfill: hand back the array as-is.
  if (valueAsArray[index] === parsedVal && !needsBetweenFix) {
    return listsAsArrays ? valueAsArray : joinWith(valueAsArray, ',');
  }

  const v = [...valueAsArray];
  v[index] = parsedVal;
  if (needsBetweenFix) {
    v[1] = getFirstOption(values)!;
  }

  return listsAsArrays ? v : joinWith(v, ',');
};

/**
 * Coerces a value to a `bigint`, falling back to the parsed number when it can't be represented
 * as one (an empty string or a decimal, for example).
 *
 * @group Value Editors
 */
export const coerceBigIntValue = (
  value: unknown,
  parseNumberMethod?: ParseNumberMethod
): unknown => {
  const valAsMaybeNumber = parseNumber(value, {
    parseNumbers: parseNumberMethod,
    bigIntOnOverflow: true,
  });

  try {
    return BigInt(valAsMaybeNumber as string | number | bigint);
  } catch {
    return valAsMaybeNumber;
  }
};

/**
 * The `type` attribute an `<input>` should use for a rule. `bigint` values and the `in`/`notIn`
 * operators (whose value is a comma-separated list) both require a text input.
 *
 * @group Value Editors
 */
export const coerceInputType = (
  inputType: InputType | null | undefined,
  operator: string
): InputType =>
  inputType === 'bigint' || operator === 'in' || operator === 'notIn'
    ? 'text'
    : inputType || 'text';

/**
 * Produces the next value for a value selector. Multiselect values are normalized to an array
 * first, then comma-joined unless `listsAsArrays` is `true`. Single-select values pass through.
 *
 * @group Value Editors
 */
export const getValueSelectorUpdate = (
  value: string | string[],
  { multiple, listsAsArrays }: { multiple?: boolean; listsAsArrays?: boolean } = {}
): string | string[] => {
  if (!multiple) return value;

  const valueAsArray = toArray(value);
  return listsAsArrays ? valueAsArray : joinWith(valueAsArray, ',');
};

/**
 * Normalizes a value selector's current value for display. Multiselect values become an array of
 * strings so they match option names, which are always strings (e.g. `[42]` becomes `["42"]`).
 *
 * @group Value Editors
 */
export const normalizeValueSelectorValue = (
  value: unknown,
  multiple?: boolean
  // oxlint-disable-next-line typescript/no-explicit-any
): any => (multiple ? toArray(value).map(String) : value);
