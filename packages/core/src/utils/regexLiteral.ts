// Internal helpers for string-match operators exported as regexes (not part of public API)

/** Escapes regex metacharacters (JS/Java-compatible). */
export const escapeRegexLiteral = (s: string): string =>
  s.replaceAll(/[\\.^$|?*+()[\]{}]/g, String.raw`\$&`);

/**
 * Inverse of {@link escapeRegexLiteral} (also handles JSONata's `\/` and `\x2d`).
 * Returns `null` if the pattern contains actual regex syntax.
 */
export const unescapeRegexLiteral = (src: string): string | null => {
  let out = '';
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === '\\') {
      if (src.startsWith('x2d', i + 1)) {
        out += '-';
        i += 3;
      } else if (/^[\\.^$|?*+()[\]{}/-]$/.test(src[i + 1] ?? '')) {
        out += src[++i];
      } else {
        return null;
      }
    } else if (/^[.^$|?*+()[\]{}]$/.test(c)) {
      return null;
    } else {
      out += c;
    }
  }
  return out;
};

export type RegexStringMatchOperator = 'contains' | 'beginsWith' | 'endsWith' | '=';

// [prefix, suffix, operator], first fit wins
type Template = [string, string, RegexStringMatchOperator];

/** Templates for full-string match semantics (SpEL `matches`) */
const fullMatchTemplates: Template[] = [
  ['.*', '.*', 'contains'],
  ['^', '.*', 'beginsWith'],
  ['.*', '$', 'endsWith'],
  ['^', '$', '='],
  // Legacy (pre-full-match) formatter output
  ['^', '', 'beginsWith'],
  ['', '$', 'endsWith'],
  ['', '', '='],
];

/** Templates for find (unanchored) semantics (JSONata `$contains`) */
const findTemplates: Template[] = [
  ['^', '$', '='],
  ['^', '', 'beginsWith'],
  ['', '$', 'endsWith'],
  ['', '', 'contains'],
];

/** Suffix at `end` is escaped if preceded by an odd number of backslashes */
const isEscapedAt = (s: string, end: number) => {
  let n = 0;
  while (end - n - 1 >= 0 && s[end - n - 1] === '\\') n++;
  return n % 2 === 1;
};

/**
 * Maps a regex pattern to the string-match operator/value that would produce it.
 * Value is unescaped when the remaining pattern is a plain literal, else returned raw.
 */
export const regexToStringMatch = (
  src: string,
  semantics: 'full' | 'find'
): { operator: RegexStringMatchOperator; value: string } => {
  const templates = semantics === 'full' ? fullMatchTemplates : findTemplates;
  for (const [prefix, suffix, operator] of templates) {
    if (
      src.length >= prefix.length + suffix.length &&
      src.startsWith(prefix) &&
      src.endsWith(suffix) &&
      !(suffix && isEscapedAt(src, src.length - suffix.length))
    ) {
      const middle = src.slice(prefix.length, src.length - suffix.length);
      return { operator, value: unescapeRegexLiteral(middle) ?? middle };
    }
  }
  // v8 ignore next -- last template always matches
  return { operator: semantics === 'full' ? '=' : 'contains', value: src };
};
