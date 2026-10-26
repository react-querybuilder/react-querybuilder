import { lc } from '../misc';
import { getSQLConcat, sanitizeRegexFlags, toInlineFlagsRegex } from './utils';

/**
 * SQL presets w/ native regex support. Others ("ansi", "mssql") fall back to `contains`.
 */
const sqlRegexPresets = new Set(['postgresql', 'mysql', 'oracle', 'sqlite']);

/**
 * Whether the SQL preset supports regular expressions natively.
 *
 * @group Export
 */
export const isSQLRegexPreset = (preset?: string): boolean => sqlRegexPresets.has(preset ?? '');

/**
 * Pre-processes a regex pattern value for the preset. SQLite has no flags argument, so flags
 * are inlined (`(?i)`).
 */
export const getSQLRegexPatternValue = (
  preset: string | undefined,
  value: unknown,
  flags: unknown
): unknown =>
  preset === 'sqlite' && typeof value === 'string'
    ? toInlineFlagsRegex(value, flags, { whitelist: 'ims' })
    : value;

/**
 * Builds a regex match expression for a supported SQL preset. `pattern` must already be a SQL
 * literal, field name, or bind placeholder.
 *
 * - postgresql: `f ~ p`, `f ~* p` (`i`), `f !~ p`, `f !~* p`
 * - mysql: `f REGEXP p`, or `REGEXP_LIKE(f, p, 'flags')` w/ flags (`s` → `n`)
 * - oracle: `REGEXP_LIKE(f, p[, 'flags'])` (`s` → `n`)
 * - sqlite: `f REGEXP p` (flags inlined into pattern; requires a `regexp` extension)
 */
export const buildSQLRegex = ({
  preset,
  field,
  pattern,
  flags,
  operator,
}: {
  preset: string | undefined;
  field: string;
  pattern: string;
  flags: unknown;
  operator: string;
}): string => {
  const not = lc(operator) === 'doesnotmatch';
  switch (preset) {
    case 'postgresql': {
      const i = sanitizeRegexFlags(flags, 'i') ? '*' : '';
      return `${field} ${not ? '!' : ''}~${i} ${pattern}`;
    }
    case 'mysql': {
      const f = sanitizeRegexFlags(flags, 'ims').replace('s', 'n');
      return `${field} ${not ? 'not ' : ''}regexp ${f ? getSQLConcat('CONCAT')(`'(?${f})'`, pattern) : pattern}`;
    }
    case 'oracle': {
      const f = sanitizeRegexFlags(flags, 'ims').replace('s', 'n');
      return `${not ? 'not ' : ''}regexp_like(${field}, ${pattern}${f ? `, '${f}'` : ''})`;
    }
    // sqlite
    default:
      return `${field} ${not ? 'not ' : ''}regexp ${pattern}`;
  }
};
