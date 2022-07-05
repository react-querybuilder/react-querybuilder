import { defaultJoinChar } from '../defaults';

/**
 * Splits a string by a given character (default ','). Escaped characters (characters
 * preceded by a backslash) will not apply to the split, and the backslash will be
 * removed in the array element. Inverse of `joinWith`.
 *
 * @example
 * splitBy('this\\,\\,that,,the other,,,\\,')
 * // or
 * splitBy('this\\,\\,that,,the other,,,\\,', ',')
 * // would return
 * ['this,,that', '', 'the other', '', '', ',']
 */
export const splitBy = (str?: string, splitChar = defaultJoinChar) =>
  typeof str === 'undefined'
    ? []
    : str
        .split(`\\${splitChar}`)
        .map(c => c.split(splitChar))
        .reduce((prev, curr, idx) => {
          if (idx === 0) return curr;
          // prev[prev.length - 1] = `${prev[prev.length - 1]},${curr[0]}`;
          return [
            ...prev.slice(0, prev.length - 1),
            `${prev[prev.length - 1]}${splitChar}${curr[0]}`,
            ...curr.slice(1),
          ];
        }, []);

/**
 * Joins an array of strings using the given character (default ','). When the given
 * character appears in an array element, a backslash will be added just before it to
 * distinguish it from the join character. Inverse of `splitBy`.
 *
 * @example
 * joinWith(['this,,that', '', 'the other', '', '', ','])
 * // would return
 * 'this\\,\\,that,,the other,,,\\,'
 */
export const joinWith = (strArr: string[], joinChar = defaultJoinChar) =>
  strArr.map(str => str.replaceAll(joinChar, `\\${joinChar}`)).join(joinChar);

/**
 * Trims the value if it is a string. Otherwise returns value as-is.
 */
export const trimIfString = (val: any) => (typeof val === 'string' ? val.trim() : val);

/**
 * Splits strings by comma and trims each element; returns arrays as-is.
 */
export const toArray = (v: any) =>
  (Array.isArray(v)
    ? v
    : typeof v === 'string'
    ? splitBy(v, defaultJoinChar).filter(s => !/^\s*$/.test(s))
    : []
  ).map(trimIfString);
