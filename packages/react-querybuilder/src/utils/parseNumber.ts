import type { ParseNumbersMethod } from '../types/index.noReact';
import { numericRegex } from './misc';

/**
 * Options object for {@link parseNumber}.
 */
export interface ParseNumberOptions {
  parseNumbers?: ParseNumbersMethod;
}

/**
 * Converts a string to a number, or returns the string unchanged if it does not
 * match {@link numericRegex}.
 */
export const parseNumber = (v: any, { parseNumbers }: ParseNumberOptions) => {
  if (typeof v === 'bigint' || typeof v === 'number') {
    return v;
  }
  return parseNumbers && (parseNumbers === 'native' || numericRegex.test(v)) ? parseFloat(v) : v;
};
