import type { DatatypeCategoryMap, FieldDatatypeCategory, FullField } from '../types';
import { categoryFamily } from './datatypeInternals';
import { getDatatypeCategory } from './getDatatypeCategory';

/**
 * Options for {@link getDatatypeCategoryComparator}.
 */
export interface DatatypeCategoryComparatorOptions {
  /** Custom raw datatype → category map (see {@link getDatatypeCategory}). */
  datatypeMap?: DatatypeCategoryMap;
}

type DatatypeCategoryComparator = (
  f: FullField,
  operator: string,
  meta?: { fieldData: FullField }
) => boolean;

/**
 * Creates a `comparator` like {@link datatypeCategoryComparator}, with options (e.g. a custom
 * `datatypeMap`). Create once (outside render) and reuse; each instance caches categories per
 * field object.
 *
 * @example
 * const comparator = getDatatypeCategoryComparator({ datatypeMap: { geography: 'object' } });
 *
 * @group Option Lists
 */
export const getDatatypeCategoryComparator = ({
  datatypeMap,
}: DatatypeCategoryComparatorOptions = {}): DatatypeCategoryComparator => {
  // Per-instance cache (categories depend on `datatypeMap`)
  const familyCache = new WeakMap<object, Set<FieldDatatypeCategory> | null>();

  const getFamilies = (field: FullField) => {
    if (familyCache.has(field)) return familyCache.get(field)!;
    const cat = getDatatypeCategory(field, { datatypeMap });
    const fams =
      cat === null ? null : new Set((Array.isArray(cat) ? cat : [cat]).map(categoryFamily));
    familyCache.set(field, fams);
    return fams;
  };

  return (f, _operator, meta) => {
    if (!meta?.fieldData) return false;
    const a = getFamilies(meta.fieldData);
    const b = getFamilies(f);
    if (!a || !b) return false;
    for (const c of a) {
      if (b.has(c)) return true;
    }
    return false;
  };
};

/**
 * Ready-made `comparator` for fields: includes only fields whose datatype category (see
 * {@link getDatatypeCategory}) is compatible with the field in question. `number` ≈ `bigint`,
 * `date` ≈ `datetime`; multi-type fields match on any overlap. Fields with no category are
 * excluded. Use {@link getDatatypeCategoryComparator} for a custom `datatypeMap`.
 *
 * @example
 * { name: 'age', datatype: 'int', valueSources: ['field'], comparator: datatypeCategoryComparator }
 *
 * @group Option Lists
 */
export const datatypeCategoryComparator: DatatypeCategoryComparator =
  getDatatypeCategoryComparator();
