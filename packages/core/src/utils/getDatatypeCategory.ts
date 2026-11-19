import type { DatatypeCategoryMap, FieldDatatypeCategory, FullField } from '../types';
import { categorizeDatatype } from './datatypeInternals';

/**
 * Options for {@link getDatatypeCategory}.
 */
export interface GetDatatypeCategoryOptions {
  /** Custom raw datatype → category map (case-insensitive; checked before built-ins). */
  datatypeMap?: DatatypeCategoryMap;
  /**
   * When `false`, only `datatype` is considered (no fallback to `inputType`,
   * `valueEditorType`, `values`, etc.). Default `true`.
   */
  hints?: boolean;
}

const inputTypeCategories: Record<string, FieldDatatypeCategory> = {
  number: 'number',
  range: 'number',
  date: 'date',
  month: 'date',
  week: 'date',
  'datetime-local': 'datetime',
  time: 'time',
  text: 'string',
  email: 'string',
  url: 'string',
  tel: 'string',
  search: 'string',
};

const valueEditorTypeCategories: Record<string, FieldDatatypeCategory> = {
  checkbox: 'boolean',
  switch: 'boolean',
  select: 'enum',
  radio: 'enum',
  multiselect: 'enum',
};

/**
 * Determines the {@link FieldDatatypeCategory} of a field. `datatype` is normalized first
 * (case-insensitive; `(…)` stripped; `|` separates multiple types), then hints are checked
 * in order: `matchModes`/`subproperties` (→ `array`), string `valueEditorType`, non-empty
 * `values` (→ `enum`), explicit `inputType`.
 *
 * Returns `null` when no hints are available, or an array when the field has multiple
 * distinct categories (e.g. `datatype: 'string|number'`).
 *
 * @group Option Lists
 */
export const getDatatypeCategory = (
  fieldData: FullField,
  { datatypeMap, hints = true }: GetDatatypeCategoryOptions = {}
): FieldDatatypeCategory | FieldDatatypeCategory[] | null => {
  const cats = categorizeDatatype(fieldData?.datatype, datatypeMap);
  if (cats) return cats.length === 1 ? cats[0] : cats;
  if (!hints || !fieldData) return null;

  const { matchModes, subproperties, valueEditorType, values, inputType } = fieldData;
  if (
    (Array.isArray(matchModes) ? matchModes.length > 0 : !!matchModes) ||
    (Array.isArray(subproperties) && subproperties.length > 0)
  ) {
    return 'array';
  }
  if (
    typeof valueEditorType === 'string' &&
    Object.hasOwn(valueEditorTypeCategories, valueEditorType)
  ) {
    return valueEditorTypeCategories[valueEditorType];
  }
  if (Array.isArray(values) && values.length > 0) return 'enum';
  if (typeof inputType === 'string' && Object.hasOwn(inputTypeCategories, inputType)) {
    return inputTypeCategories[inputType];
  }
  return null;
};
