import { defaultJoinChar } from '../defaults';

/**
 * Splits a string by a given character (see {@link defaultJoinChar}). Escaped characters
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
export const splitBy = (str?: string, splitChar: string = defaultJoinChar): string[] => {
  if (typeof str !== 'string') return [];
  const result: string[] = [];
  let current = '';
  let i = 0;
  while (i < str.length) {
    // Only `\\` and `\<first char of splitChar>` are escapes; other backslashes are literal (compat)
    if (str[i] === '\\' && (str[i + 1] === '\\' || str[i + 1] === splitChar[0])) {
      current += str[i + 1];
      i += 2;
    } else if (str.startsWith(splitChar, i)) {
      result.push(current);
      current = '';
      i += splitChar.length;
    } else {
      current += str[i];
      i++;
    }
  }
  result.push(current);
  return result;
};

/**
 * Joins an array of strings using the given character (see {@link defaultJoinChar}). When
 * the given character appears in an array element, a backslash will be added just before it
 * to distinguish it from the join character. Effectively the inverse of {@link splitBy}.
 *
 * TIP: The join character can actually be a string of any length. Only the first character
 * will be searched for in the array elements and preceded by a backslash.
 *
 * @example
 * joinWith(['this,,that', '', 'the other', '', '', ','], ', ')
 * // would return
 * 'this\\,\\,that, , the other, , , \\,'
 */
export const joinWith = (strArr: unknown[], joinChar: string = defaultJoinChar): string => {
  const jc = joinChar[0];
  // Escape backslashes only where ambiguous (before `\`, join char, or end of element)
  const ambiguousBackslash = new RegExp(
    `\\\\(?=\\\\|${jc.replace(/[$()*+.?[\\\]^{|}-]/g, '\\$&')}|$)`,
    'g'
  );
  return strArr
    .map(str => `${str ?? ''}`.replace(ambiguousBackslash, '\\\\').replaceAll(jc, `\\${jc}`))
    .join(joinChar);
};

type IsUnknown<T> = unknown extends T ? true : false;
type Trimmed<T> = IsUnknown<T> extends true ? string : T;

/**
 * Trims the value if it is a string. Otherwise returns the value as is.
 */
export const trimIfString = <T>(val: T): Trimmed<T> =>
  (typeof val === 'string' ? val.trim() : val) as Trimmed<T>;

type ToArrayResult<T> =
  IsUnknown<T> extends true
    ? string[]
    : T extends readonly (infer U)[]
      ? Trimmed<U>[]
      : T extends string
        ? string[]
        : T extends number
          ? number[]
          : never[];

/**
 * Splits a string by comma then trims each element. Arrays are returned as is except
 * any string elements are trimmed.
 */
export const toArray = <T>(
  a: T,
  { retainEmptyStrings }: { retainEmptyStrings?: boolean } = {}
): ToArrayResult<T> =>
  (Array.isArray(a)
    ? a.map(trimIfString)
    : typeof a === 'string'
      ? splitBy(a, defaultJoinChar)
          .filter(retainEmptyStrings ? () => true : s => !/^\s*$/.test(s))
          .map(s => s.trim())
      : typeof a === 'number'
        ? [a]
        : []) as ToArrayResult<T>;

/**
 * Determines if an array is free of `null`/`undefined`.
 */
export const nullFreeArray = <T>(arr: T[]): arr is Exclude<T, null>[] =>
  arr.every(el => el === false || (el ?? false) !== false);
