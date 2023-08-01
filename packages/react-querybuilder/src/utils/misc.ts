/**
 * Regex matching numeric strings. Passes for positive/negative integers, decimals,
 * and E notation, with optional surrounding whitespace.
 */
export const numericRegex = /^\s*[+-]?(\d+|\d*\.\d+|\d+\.\d*)([Ee][+-]?\d+)?\s*$/;

/**
 * Determines if a variable is a plain old JavaScript object, aka POJO.
 */
export const isPojo = (obj: any): obj is Record<string, any> =>
  obj === null || typeof obj !== 'object' ? false : Object.getPrototypeOf(obj) === Object.prototype;
