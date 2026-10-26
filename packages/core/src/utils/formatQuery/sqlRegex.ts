import { lc } from '../misc';
import { getSQLConcat, sanitizeRegexFlags, toInlineFlagsRegex } from './utils';

/**
 * SQL presets w/ native regex support. Others ('ansi', 'mssql') fall back to `contains`.
 */
const sqlRegexPresets = new Set(['postgresql', 'mysql', 'oracle', 'sqlite']);

/**
 * Whether the SQL preset supports regular expressions natively.
 *
 * @group Export
 */
export const isSQLRegexPreset = (preset?: string): boolean => sqlRegexPresets.has(preset ?? '');

/**
 * Inline flag prefix for presets w/o a (complete) flags argument. SQLite: `(?ims)`.
 * PostgreSQL: `m` → `(?w)` (ARE "weird" newline-sensitive: `^`/`$` match at line breaks).
 */
const getInlineFlagsPrefix = (preset: string | undefined, flags: unknown): string => {
  if (preset === 'sqlite') return toInlineFlagsRegex('', flags, { whitelist: 'ims' });
  if (preset === 'postgresql') return sanitizeRegexFlags(flags, 'm') ? '(?w)' : '';
  return '';
};

/**
 * Pre-processes a literal regex pattern value for the preset, inlining flags the preset can't
 * pass as an argument (see {@link buildSQLRegex}).
 */
export const getSQLRegexPatternValue = (
  preset: string | undefined,
  value: unknown,
  flags: unknown
): unknown =>
  typeof value === 'string' ? `${getInlineFlagsPrefix(preset, flags)}${value}` : value;

/**
 * Builds a regex match expression for a supported SQL preset. `pattern` must already be a SQL
 * literal, field name, or bind placeholder. Set `flagsInlined` when `pattern` came from
 * {@link getSQLRegexPatternValue}; otherwise inline flags are prepended via SQL concatenation.
 *
 * - postgresql: `f ~ p`, `f ~* p` (`i`), `f !~ p`, `f !~* p` (`m` inlined as `(?w)`)
 * - mysql: `f REGEXP p`, or `f REGEXP CONCAT('(?flags)', p)` w/ flags (inline `s` valid in both
 *   MySQL ICU and MariaDB PCRE)
 * - oracle: `REGEXP_LIKE(f, p[, 'flags'])` (`s` → `n`)
 * - sqlite: `f REGEXP p` (flags inlined; requires a `regexp` extension)
 */
export const buildSQLRegex = ({
  preset,
  field,
  pattern,
  flags,
  operator,
  flagsInlined = false,
}: {
  preset: string | undefined;
  field: string;
  pattern: string;
  flags: unknown;
  operator: string;
  flagsInlined?: boolean;
}): string => {
  const not = lc(operator) === 'doesnotmatch';
  const prefix = flagsInlined ? '' : getInlineFlagsPrefix(preset, flags);
  const p = prefix ? `('${prefix}' || ${pattern})` : pattern;
  switch (preset) {
    case 'postgresql': {
      const i = sanitizeRegexFlags(flags, 'i') ? '*' : '';
      return `${field} ${not ? '!' : ''}~${i} ${p}`;
    }
    case 'mysql': {
      const f = sanitizeRegexFlags(flags, 'ims');
      return `${field} ${not ? 'not ' : ''}regexp ${f ? getSQLConcat('CONCAT')(`'(?${f})'`, pattern) : pattern}`;
    }
    case 'oracle': {
      const f = sanitizeRegexFlags(flags, 'ims').replace('s', 'n');
      return `${not ? 'not ' : ''}regexp_like(${field}, ${pattern}${f ? `, '${f}'` : ''})`;
    }
    // sqlite
    default:
      return `${field} ${not ? 'not ' : ''}regexp ${p}`;
  }
};
