import { lc } from '../misc';
import { shouldRenderAsNumber } from './utils';

// Internal value helpers for vector DB formats (not re-exported).

/**
 * Coerces a value to a `number` for formats that require numeric values (e.g. vector DB
 * range filters). Returns `undefined` if not numeric. `bigint` values are converted with
 * `Number()` (precision loss beyond `Number.MAX_SAFE_INTEGER`). Numeric strings are only
 * parsed when `parseNumbers` is truthy (default `true`).
 *
 * @internal
 */
export const coerceNumber = (value: unknown, parseNumbers = true): number | undefined => {
  if (typeof value === 'number') return Number.isNaN(value) ? undefined : value;
  if (typeof value === 'bigint') return Number(value);
  return shouldRenderAsNumber(typeof value === 'string' ? value.trim() : value, parseNumbers)
    ? Number.parseFloat(value as string)
    : undefined;
};

/**
 * Whether the input type represents a date/datetime (`"date"` or `"datetime-local"`).
 * `"time"` is excluded (treated as a plain string).
 *
 * @internal
 */
export const isDateInputType = (inputType?: string | null): boolean =>
  inputType === 'date' || inputType === 'datetime-local';

const rfcDateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
const rfcDateTimeRegex =
  /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(:\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$/i;

/**
 * Converts a date/datetime value to RFC 3339. `YYYY-MM-DD` → `YYYY-MM-DDT00:00:00Z`;
 * datetimes without seconds get `:00`; datetimes without offset get `Z`; `Date` objects
 * use `toISOString()`. Returns `undefined` for unrecognized values.
 *
 * @internal
 */
export const toRFC3339 = (value: unknown): string | undefined => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  if (typeof value !== 'string') return undefined;
  const v = value.trim();
  if (rfcDateOnlyRegex.test(v)) return `${v}T00:00:00Z`;
  const m = rfcDateTimeRegex.exec(v);
  if (!m) return undefined;
  const [, d, hm, s, tz] = m;
  return `${d}T${hm}${s ?? ':00'}${tz ? tz.toUpperCase() : 'Z'}`;
};

/**
 * Coerces `boolean`s and `"true"`/`"false"` strings (case-insensitive) to `boolean`.
 * Returns `undefined` otherwise.
 *
 * @internal
 */
export const coerceBoolean = (value: unknown): boolean | undefined =>
  typeof value === 'boolean'
    ? value
    : typeof value === 'string' && /^\s*(true|false)\s*$/i.test(value)
      ? lc(value.trim()) === 'true'
      : undefined;
