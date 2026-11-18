import { defaultJoinChar } from '../defaults';

// `\` can't escape a `\` separator unambiguously (`\\` = sep+sep or literal), so use `/` instead
const getEscapeChar = (sepFirstChar: string) => (sepFirstChar === '\\' ? '/' : '\\');

/**
 * Splits a string by a given character (see {@link defaultJoinChar}). Escaped characters
 * (characters preceded by a backslash) will not apply to the split, and the backslash will
 * be removed in the array element. Inverse of {@link joinWith}.
 *
 * When the split character starts with a backslash, the escape character is `/` instead.
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
  if (!splitChar) return str.split('');
  const esc = getEscapeChar(splitChar[0]);
  const result: string[] = [];
  let current = '';
  let i = 0;
  while (i < str.length) {
    // Only `<esc><esc>` and `<esc><first char of splitChar>` are escapes; else literal (compat)
    if (str[i] === esc && (str[i + 1] === esc || str[i + 1] === splitChar[0])) {
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
 * will be searched for in the array elements and preceded by a backslash (or `/` when the
 * join character starts with a backslash).
 *
 * @example
 * joinWith(['this,,that', '', 'the other', '', '', ','], ', ')
 * // would return
 * 'this\\,\\,that, , the other, , , \\,'
 */
export const joinWith = (strArr: unknown[], joinChar: string = defaultJoinChar): string => {
  const jc = joinChar[0];
  const strs = strArr.map(str => `${str ?? ''}`);
  if (!jc) return strs.join('');
  const esc = getEscapeChar(jc);
  const [e, j] = [esc, jc].map(c => c.replace(/[$()*+.?[\\\]^{|}-]/g, '\\$&'));
  // Escape join char always; escape char only where ambiguous (before esc, join char, or end)
  const needsEscape = new RegExp(`${e}(?=${e}|${j}|$)|${j}`, 'g');
  return strs.map(s => s.replace(needsEscape, m => `${esc}${m}`)).join(joinChar);
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
