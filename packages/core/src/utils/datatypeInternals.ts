// Internal (not exported from barrel)
import type { DatatypeCategoryMap, FieldDatatypeCategory } from '../types';

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
const ormPrefix = /^(pg|mysql|sqlite|singlestore|gel)(?=[a-z])/i;

const lookupMap = (
  map: DatatypeCategoryMap | undefined,
  key: string
): FieldDatatypeCategory | undefined => {
  if (!map) return undefined;
  if (Object.hasOwn(map, key) && map[key]) return map[key];
  const lc = key.toLowerCase();
  for (const k of Object.keys(map)) {
    if (k.toLowerCase() === lc && map[k]) return map[k];
  }
  return undefined;
};

// Linear-time `(…)` stripping (regex alternative is polynomial on many `(`)
const stripParens = (s: string): string => {
  let out = '';
  let depth = 0;
  for (const ch of s) {
    if (ch === '(') depth++;
    else if (ch === ')' && depth > 0) depth--;
    else if (depth === 0) out += ch;
  }
  return out.trim();
};

// Splits on `|` outside parens
const splitUnion = (s: string): string[] => {
  const parts: string[] = [];
  let cur = '';
  let depth = 0;
  for (const ch of s) {
    if (ch === '(') depth++;
    else if (ch === ')' && depth > 0) depth--;
    if (ch === '|' && depth === 0) {
      parts.push(cur);
      cur = '';
    } else cur += ch;
  }
  parts.push(cur);
  return parts.map(p => p.trim()).filter(Boolean);
};

const categorizePart = (part: string, map?: DatatypeCategoryMap) => {
  const custom = lookupMap(map, part) ?? lookupMap(map, stripParens(part));
  if (custom) return custom;
  const norm = stripParens(part).replace(ormPrefix, '').toLowerCase().replaceAll(/\s+/g, ' ');
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
  const parts = splitUnion(datatype);
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
