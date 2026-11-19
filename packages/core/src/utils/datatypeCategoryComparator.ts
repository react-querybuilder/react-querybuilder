import type { FieldDatatypeCategory, FullField } from '../types';
import { categoryFamily } from './datatypeInternals';
import { getDatatypeCategory } from './getDatatypeCategory';

const familyCache = new WeakMap<object, Set<FieldDatatypeCategory> | null>();

const getFamilies = (field: FullField) => {
  if (familyCache.has(field)) return familyCache.get(field)!;
  const cat = getDatatypeCategory(field);
  const fams =
    cat === null ? null : new Set((Array.isArray(cat) ? cat : [cat]).map(categoryFamily));
  familyCache.set(field, fams);
  return fams;
};

/**
 * Ready-made `comparator` for fields: includes only fields whose datatype category (see
 * {@link getDatatypeCategory}) is compatible with the field in question. `number` ≈ `bigint`,
 * `date` ≈ `datetime`; multi-type fields match on any overlap. Fields with no category are
 * excluded.
 *
 * @example
 * { name: 'age', datatype: 'int', valueSources: ['field'], comparator: datatypeCategoryComparator }
 *
 * @group Option Lists
 */
export const datatypeCategoryComparator = (
  f: FullField,
  _operator: string,
  meta?: { fieldData: FullField }
): boolean => {
  if (!meta?.fieldData) return false;
  const a = getFamilies(meta.fieldData);
  const b = getFamilies(f);
  if (!a || !b) return false;
  for (const c of a) {
    if (b.has(c)) return true;
  }
  return false;
};
