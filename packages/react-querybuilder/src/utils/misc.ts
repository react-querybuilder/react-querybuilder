import { numericRegex as numericQuantityRegex } from 'numeric-quantity';

/**
 * Regex matching numeric strings. Passes for positive/negative integers, decimals,
 * and E notation, with optional surrounding whitespace.
 */
export const numericRegex = new RegExp(
  numericQuantityRegex.source.replace(/^\^/, '^\\s*').replace(/\$$/, '\\s*$')
);

/**
 * Determines if a variable is a plain old JavaScript object, aka POJO.
 */
export const isPojo = (obj: any): obj is Record<string, any> =>
  obj === null || typeof obj !== 'object' ? false : Object.getPrototypeOf(obj) === Object.prototype;
