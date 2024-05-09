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
export const parseNumber = (v: any, pno: ParseNumberOptions = {}) => {
  if (!pno.parseNumbers || typeof v === 'bigint' || typeof v === 'number') {
    return v;
  }
  if (pno.parseNumbers === 'native') {
    return parseFloat(v);
  }
  const n =
    // TODO: Should these options be configurable?
    numericQuantity(v, {
      allowTrailingInvalid: pno.parseNumbers === 'enhanced',
      romanNumerals: true,
      round: false,
    });
  return isNaN(n) ? v : n;
};
