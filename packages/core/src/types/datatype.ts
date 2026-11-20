/**
 * Normalized data type category of a field. Raw `datatype` values (e.g. `'VARCHAR(50)'`,
 * `'timestamp with time zone'`) are normalized to one of these categories by
 * `getDatatypeCategory`.
 *
 * - `enum`: fixed value list
 * - `unknown`: no operator narrowing
 */
export type FieldDatatypeCategory =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'time'
  | 'enum'
  | 'array'
  | 'object'
  | 'unknown';

/**
 * Custom raw datatype → category map (keys matched case-insensitively). Checked before
 * built-in normalization.
 */
export type DatatypeCategoryMap = Record<string, FieldDatatypeCategory>;
