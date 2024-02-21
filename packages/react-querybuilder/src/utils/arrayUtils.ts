import { defaultJoinChar } from '../defaults';

/**
 * Splits a string by a given character (see {@link defaultJoinChar}. Escaped characters
 * (characters preceded by a backslash) will not apply to the split, and the backslash will
 * be removed in the array element. Inverse of {@link joinWith}.
 *
 * @example
 * splitBy('this\\,\\,that,,the other,,,\\,')
 * // or
 * splitBy('this\\,\\,that,,the other,,,\\,', ',')
 * // would return
 * ['this,,that', '', 'the other', '', '', ',']
 */
export const splitBy = (str?: string, splitChar = defaultJoinChar) =>
  typeof str === 'string'
    ? str
        .split(`\\${splitChar}`)
        .map(c => c.split(splitChar))
        .reduce((prev, curr, idx) => {
          if (idx === 0) {
            return curr;
          }
          return [
            ...prev.slice(0, prev.length - 1),
            `${prev[prev.length - 1]}${splitChar}${curr[0]}`,
            ...curr.slice(1),
          ];
        }, [])
    : [];

/**
 * Joins an array of strings using the given character (see {@link defaultJoinChar}. When
 * the given character appears in an array element, a backslash will be added just before it
 * to distinguish it from the join character. Inverse of {@link splitBy}.
 *
 * @example
 * joinWith(['this,,that', '', 'the other', '', '', ','])
 * // would return
 * 'this\\,\\,that,,the other,,,\\,'
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const joinWith = (strArr: any[], joinChar = defaultJoinChar) =>
  strArr.map(str => `${str ?? ''}`.replaceAll(joinChar, `\\${joinChar}`)).join(joinChar);

/**
 * Trims the value if it is a string. Otherwise returns the value as is.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trimIfString = (val: any) => (typeof val === 'string' ? val.trim() : val);

/**
 * Splits a string by comma then trims each element. Arrays are returned as is except
 * any string elements are trimmed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toArray = (v: any) =>
  Array.isArray(v)
    ? v.map(trimIfString)
    : typeof v === 'string'
      ? splitBy(v, defaultJoinChar)
          .filter(s => !/^\s*$/.test(s))
          .map(s => s.trim())
      : typeof v === 'number'
        ? [v]
        : [];

/**
 * Determines if an array is free of `null`/`undefined`.
 */
export const nullFreeArray = <T>(arr: T[]): arr is Exclude<T, null>[] =>
  arr.every(el => el === false || (el ?? false) !== false);
