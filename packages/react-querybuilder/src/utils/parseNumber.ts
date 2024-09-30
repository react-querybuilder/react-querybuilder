import { numericQuantity } from 'numeric-quantity';
import type { ParseNumberMethod } from '../types/index.noReact';

/**
 * Options object for {@link parseNumber}.
 */
export interface ParseNumberOptions {
  parseNumbers?: ParseNumberMethod;
}

/**
 * Converts a string to a number. Uses native `parseFloat` if `parseNumbers` is "native",
 * otherwise uses [`numeric-quantity`](https://jakeboone02.github.io/numeric-quantity/).
 * If that returns `NaN`, the string is returned unchanged. Numeric values are returned
 * as-is regardless of the `parseNumbers` option.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseNumber = (val: any, { parseNumbers }: ParseNumberOptions = {}): any => {
  if (!parseNumbers || typeof val === 'bigint' || typeof val === 'number') {
    return val;
  }

  if (parseNumbers === 'native') {
    return parseFloat(val);
  }

  const valAsNum =
    // TODO: Should these options be configurable?
    numericQuantity(val, {
      allowTrailingInvalid: parseNumbers === 'enhanced',
      romanNumerals: false,
      round: false,
    });

  return isNaN(valAsNum) ? val : valAsNum;
};
