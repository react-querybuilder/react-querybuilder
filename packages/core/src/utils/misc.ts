import { numericRegex as numericQuantityRegex } from 'numeric-quantity';

/**
 * Converts a value to lowercase if it's a string, otherwise returns the value as is.
 */
// istanbul ignore next
export const lc = <T>(v: T): T => (typeof v === 'string' ? (v.toLowerCase() as T) : v);

/**
 * Regex matching numeric strings. Passes for positive/negative integers, decimals,
 * and E notation, with optional surrounding whitespace.
 */
export const numericRegex: RegExp = new RegExp(
  numericQuantityRegex.source.replace(/^\^/, String.raw`^\s*`).replace(/\$$/, String.raw`\s*$`)
);

/**
 * Determines if a variable is a plain old JavaScript object, aka POJO.
 */
// oxlint-disable-next-line typescript/no-explicit-any
export const isPojo = (obj: any): obj is Record<string, any> =>
  obj === null || typeof obj !== 'object' ? false : Object.getPrototypeOf(obj) === Object.prototype;

/**
 * Simple helper to determine whether a value is null, undefined, or an empty string.
 */
// oxlint-disable-next-line typescript/no-explicit-any
export const nullOrUndefinedOrEmpty = (value: any): value is null | undefined | '' =>
  value === null || value === undefined || value === '';
