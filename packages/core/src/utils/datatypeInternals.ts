// Internal (not exported from barrel)
import type { DatatypeCategoryMap, FieldDatatypeCategory } from '../types';
import { toArray } from './arrayUtils';

const categoryNames: ReadonlySet<string> = new Set<FieldDatatypeCategory>([
  'string',
  'number',
  'bigint',
  'boolean',
  'date',
  'datetime',
  'time',
  'enum',
  'array',
  'object',
  'unknown',
]);

// Order matters (e.g. `timestamp` before `time`, `bigint` before `int`)
const categoryMatchers: [RegExp, FieldDatatypeCategory][] = [
  [/\[\]$|^array\b|^set$/, 'array'],
  [/^(json\w*|object|map|struct|record)$/, 'object'],
  [/^(bool(ean)?|bit)$/, 'boolean'],
  [/^(datetime\w*|smalldatetime|timestamp\w*)\b/, 'datetime'],
  [/^date(string)?$/, 'date'],
  [/^time(tz)?\b/, 'time'],
  [/^(bigint\w*|int8|u?int64|long|bigserial|serial8)(\s+unsigned)?$/, 'bigint'],
  [
    /^(u?int(eger)?\d*|tinyint|smallint|mediumint|number|numeric|decimal|dec|float\d*|double(\s*precision)?|real|small(money|serial)|money|serial\d?)(\s+(unsigned|signed|zerofill))*$/,
    'number',
  ],
  [/^enum\w*$/, 'enum'],
  [/char|text$|^(string|clob|nclob|uuid|uniqueidentifier|citext)$/, 'string'],
];

// Drizzle-style class names (`PgVarchar`, `MySqlInt`, `SQLiteText`)
const ormPrefix = /^(Pg|MySql|SQLite|SingleStore|Gel)(?=[A-Z])/;

const lookupMap = (
  map: DatatypeCategoryMap | undefined,
  key: string
): FieldDatatypeCategory | undefined => {
  if (!map) return undefined;
  if (map[key]) return map[key];
  const lc = key.toLowerCase();
  for (const k in map) {
    if (k.toLowerCase() === lc) return map[k];
  }
  return undefined;
};

const categorizePart = (part: string, map?: DatatypeCategoryMap) => {
  const custom = lookupMap(map, part);
  if (custom) return custom;
  const norm = part.replace(ormPrefix, '').toLowerCase().replaceAll(/\s+/g, ' ');
  if (categoryNames.has(norm)) return norm as FieldDatatypeCategory;
  for (const [re, cat] of categoryMatchers) {
    if (re.test(norm)) return cat;
  }
  return undefined;
};

/**
 * Categorizes a raw `datatype` string. Returns `null` when no part is recognized.
 */
export const categorizeDatatype = (
  datatype: unknown,
  map?: DatatypeCategoryMap
): FieldDatatypeCategory[] | null => {
  if (typeof datatype !== 'string' || !datatype.trim()) return null;
  const whole = lookupMap(map, datatype.trim());
  if (whole) return [whole];
  const parts = toArray(datatype.replaceAll(/\([^)]*\)/g, ''), { splitChar: '|' });
  const cats = new Set<FieldDatatypeCategory>();
  for (const p of parts) {
    const c = categorizePart(p, map);
    if (c) cats.add(c);
  }
  return cats.size > 0 ? [...cats] : null;
};

/** `number` | `bigint` */
export const isNumericCategory = (c: FieldDatatypeCategory): c is 'number' | 'bigint' =>
  c === 'number' || c === 'bigint';

/** `date` | `datetime` */
export const isTemporalDateCategory = (c: FieldDatatypeCategory): c is 'date' | 'datetime' =>
  c === 'date' || c === 'datetime';

/** Family representative (`bigint`→`number`, `datetime`→`date`), else self. */
export const categoryFamily = (c: FieldDatatypeCategory): FieldDatatypeCategory =>
  isNumericCategory(c) ? 'number' : isTemporalDateCategory(c) ? 'date' : c;

/** Dedup set for dev warnings. */
export const warnedFields: Set<string> = new Set();

export const isDev = (): boolean => process.env.NODE_ENV !== 'production';
