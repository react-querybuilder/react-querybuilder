import { numericQuantity } from 'numeric-quantity';
import type { ParseNumberMethod } from '../types';

/**
 * Options object for {@link parseNumber}.
 */
export interface ParseNumberOptions {
  parseNumbers?: ParseNumberMethod;
  /**
   * Generates a `bigint` value if the string represents a valid integer
   * outside the safe boundaries of the `number` type.
   */
  bigIntOnOverflow?: boolean;
}

/**
 * Converts a string to a number. Uses native `parseFloat` if `parseNumbers` is "native",
 * otherwise uses [`numeric-quantity`](https://jakeboone02.github.io/numeric-quantity/).
 * If that returns `NaN`, the string is returned unchanged. Numeric values are returned
 * as-is regardless of the `parseNumbers` option.
 */
export const parseNumber = (
  // oxlint-disable-next-line typescript/no-explicit-any
  val: any,
  { parseNumbers, bigIntOnOverflow }: ParseNumberOptions = {}
  // oxlint-disable-next-line typescript/no-explicit-any
): any => {
  if (!parseNumbers || typeof val === 'bigint' || typeof val === 'number') {
    return val;
  }

  if (parseNumbers === 'native') {
    return Number.parseFloat(val);
  }

  const valAsNum: number | bigint =
    // TODO: Should these options be configurable?
    numericQuantity(val, {
      allowTrailingInvalid: parseNumbers === 'enhanced',
      bigIntOnOverflow,
      romanNumerals: false,
      round: false,
    });

  return typeof valAsNum === 'bigint' || !Number.isNaN(valAsNum) ? valAsNum : val;
};
