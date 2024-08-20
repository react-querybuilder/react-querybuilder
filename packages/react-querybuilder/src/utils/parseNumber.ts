import { numericQuantity } from 'numeric-quantity';
import type { ParseNumbersMethod } from '../types/index.noReact';

/**
 * Options object for {@link parseNumber}.
 */
export interface ParseNumberOptions {
  parseNumbers?: ParseNumbersMethod;
}

/**
 * Converts a string to a number. Uses native `parseFloat` if `parseNumbers` is "native",
 * otherwise uses [`numeric-quantity`](https://jakeboone02.github.io/numeric-quantity/).
 * If that returns `NaN`, the string is returned unchanged. Numeric values are returned
 * as-is regardless of the `parseNumbers` option.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseNumber = (val: any, opts: ParseNumberOptions = {}) => {
  if (!opts.parseNumbers || typeof val === 'bigint' || typeof val === 'number') {
    return val;
  }

  if (opts.parseNumbers === 'native') {
    return parseFloat(val);
  }

  const valAsNum =
    // TODO: Should these options be configurable?
    numericQuantity(val, {
      allowTrailingInvalid: opts.parseNumbers === 'enhanced',
      romanNumerals: false,
      round: false,
    });

  return isNaN(valAsNum) ? val : valAsNum;
};
