import { defaultOperatorLabelMap, defaultOperators } from '../defaults';
import type {
  DatatypeCategoryMap,
  FieldDatatypeCategory,
  FlexibleOption,
  FlexibleOptionList,
  FullField,
  FullOperator,
} from '../types';
import { categoryFamily, isDev, warnedFields } from './datatypeInternals';
import { getDatatypeCategory } from './getDatatypeCategory';
import { isFlexibleOptionGroupArray } from './optGroupUtils';

/**
 * Datatype category → whitelisted (default) operator names. Categories without an entry
 * are not filtered.
 */
export type InferOperatorsMap = Partial<Record<FieldDatatypeCategory, string[]>>;

/**
 * Datatype category → operator name → label.
 */
export type DatatypeOperatorLabels = Partial<
  Record<FieldDatatypeCategory, Partial<Record<string, string>>>
>;

/**
 * Options for {@link inferOperators}.
 */
export interface InferOperatorsOptions<O extends FullOperator = FullOperator> {
  /** Operator list to narrow. Default {@link defaultOperators}. */
  operators?: FlexibleOptionList<O>;
  /** Merged over {@link defaultInferOperatorsMap} (per-category replacement). */
  map?: InferOperatorsMap;
  /** Custom raw datatype → category map. */
  datatypeMap?: DatatypeCategoryMap;
  /**
   * Drop operators whose names are not in {@link defaultOperators} (i.e. custom operators).
   * Default `false`.
   */
  dropUnknownOperators?: boolean;
  /**
   * Dev-only `console.warn` when `fieldData.operators` lists operators incompatible with
   * the field's datatype. Default `false`.
   */
  warn?: boolean;
  /**
   * Type-specific operator labels. `true` → {@link defaultDatatypeOperatorLabels}.
   * Only labels still equal to the default label are replaced.
   */
  labels?: true | DatatypeOperatorLabels;
}

const numericOperators: readonly string[] = Object.freeze([
  '=',
  '!=',
  '<',
  '<=',
  '>',
  '>=',
  'between',
  'notBetween',
  'in',
  'notIn',
]);

/**
 * Default datatype category → operator whitelist for {@link inferOperators}. `null`/`notNull`
 * are always retained. `array`, `object`, and `unknown` are not filtered.
 *
 * @group Defaults
 */
export const defaultInferOperatorsMap: Readonly<InferOperatorsMap> = Object.freeze({
  string: Object.freeze([
    '=',
    '!=',
    'contains',
    'beginsWith',
    'endsWith',
    'doesNotContain',
    'doesNotBeginWith',
    'doesNotEndWith',
    'in',
    'notIn',
  ]),
  number: numericOperators,
  bigint: numericOperators,
  date: numericOperators,
  datetime: numericOperators,
  time: numericOperators,
  boolean: Object.freeze(['=', '!=']),
  enum: Object.freeze(['=', '!=', 'in', 'notIn']),
} as InferOperatorsMap);

const temporalLabels = Object.freeze({
  '<': 'before',
  '<=': 'on or before',
  '>': 'after',
  '>=': 'on or after',
  between: 'between',
});

/**
 * Default type-specific operator labels for {@link inferOperators} (`labels: true`).
 *
 * @group Defaults
 */
export const defaultDatatypeOperatorLabels: Readonly<DatatypeOperatorLabels> = Object.freeze({
  date: temporalLabels,
  datetime: temporalLabels,
  time: temporalLabels,
  boolean: Object.freeze({ '=': 'is', '!=': 'is not' }),
});

const defaultOperatorNames: ReadonlySet<string> = new Set(defaultOperators.map(o => o.name));
const nullOps: ReadonlySet<string> = new Set(['null', 'notNull']);
const multiselectOps: readonly string[] = ['in', 'notIn'];

const getOpName = (op: unknown): string =>
  typeof op === 'string' ? op : ((op as FlexibleOption).value ?? (op as FlexibleOption).name)!;

const toCategoryArray = (
  c: FieldDatatypeCategory | FieldDatatypeCategory[] | null
): FieldDatatypeCategory[] | null => (c === null ? null : Array.isArray(c) ? c : [c]);

const ownLabel = (table: object | undefined, key: string): string | undefined =>
  table && Object.hasOwn(table, key) ? (table as Record<string, string>)[key] : undefined;

const sameNonLabelProps = (src: object, copy: object): boolean => {
  const srcKeys = Object.keys(src).filter(k => k !== 'label');
  return (
    srcKeys.length === Object.keys(copy).filter(k => k !== 'label').length &&
    srcKeys.every(
      k =>
        Object.hasOwn(copy, k) &&
        (copy as Record<string, unknown>)[k] === (src as Record<string, unknown>)[k]
    )
  );
};

// Relabeled op cache (stable refs across calls for memoization)
const relabeledObjects = new WeakMap<object, Map<string, unknown>>();
const relabeledStrings = new Map<string, Map<string, unknown>>();

const relabel = <Op>(op: Op, label: string): Op => {
  const byLabel =
    typeof op === 'string' ? relabeledStrings.get(op) : relabeledObjects.get(op as object);
  const cached = byLabel?.get(label);
  // Reuse only if source props unchanged (source may be mutated: changed/added/deleted keys)
  if (cached && (typeof op === 'string' || sameNonLabelProps(op as object, cached))) {
    return cached as Op;
  }
  const result =
    typeof op === 'string' ? { name: op, value: op, label } : { ...(op as object), label };
  const map = byLabel ?? new Map<string, unknown>();
  map.set(label, result);
  if (!byLabel) {
    if (typeof op === 'string') relabeledStrings.set(op, map);
    else relabeledObjects.set(op as object, map);
  }
  return result as Op;
};

/**
 * Computes the operator whitelist for a field (`null` = no filtering). Internal.
 */
export const getDatatypeOperatorWhitelist = (
  fieldData: FullField,
  { map, datatypeMap }: Pick<InferOperatorsOptions, 'map' | 'datatypeMap'> = {}
): { categories: FieldDatatypeCategory[] | null; whitelist: Set<string> | null } => {
  const categories = toCategoryArray(getDatatypeCategory(fieldData, { datatypeMap }));
  if (!categories) return { categories, whitelist: null };
  const whitelist = new Set<string>();
  const fullMap: InferOperatorsMap = { ...defaultInferOperatorsMap, ...map };
  // Unfiltered category (array/object/unknown or unmapped) → no filtering, even for multiselect
  if (categories.some(c => !fullMap[c])) return { categories, whitelist: null };
  if (fieldData.valueEditorType === 'multiselect') {
    // Multiselect stores a list; only list ops export correctly. Explicit `map` entries (own
    // keys) narrow further; defaults ignored (scalar whitelists may lack in/notIn).
    const explicit = categories.filter(c => map && Object.hasOwn(map, c) && map[c]);
    const ops = explicit.length > 0 ? explicit.flatMap(c => map![c]!) : multiselectOps;
    for (const op of ops) if (multiselectOps.includes(op)) whitelist.add(op);
  } else {
    for (const c of categories) for (const op of fullMap[c]!) whitelist.add(op);
  }
  for (const op of nullOps) whitelist.add(op);
  return { categories, whitelist };
};

/**
 * Determines whether an operator name is allowed by a whitelist (see
 * {@link getDatatypeOperatorWhitelist}). Internal.
 */
export const isOperatorAllowed = (
  name: string,
  whitelist: Set<string> | null,
  dropUnknownOperators?: boolean
): boolean =>
  defaultOperatorNames.has(name) ? !whitelist || whitelist.has(name) : !dropUnknownOperators;

const warnIncompatible = (
  fieldData: FullField,
  categories: FieldDatatypeCategory[],
  whitelist: Set<string>
) => {
  const fieldName = fieldData.value ?? fieldData.name;
  const dt = typeof fieldData.datatype === 'string' ? fieldData.datatype : categories.join('|');
  if (fieldData.operators && !warnedFields.has(`ops:${fieldName}`)) {
    const flat = isFlexibleOptionGroupArray(fieldData.operators)
      ? fieldData.operators.flatMap(og => og.options)
      : (fieldData.operators as unknown[]);
    const bad = flat
      .map(op => getOpName(op))
      .filter(n => defaultOperatorNames.has(n) && !whitelist.has(n));
    if (bad.length > 0) {
      warnedFields.add(`ops:${fieldName}`);
      console.warn(
        `[RQB] Field "${fieldName}" (datatype "${dt}") lists operators incompatible w/ datatype: ${bad.join(', ')}`
      );
    }
  }
  if (
    whitelist.size === nullOps.size &&
    [...whitelist].every(op => nullOps.has(op)) &&
    !warnedFields.has(`null:${fieldName}`)
  ) {
    warnedFields.add(`null:${fieldName}`);
    console.warn(
      `[RQB] Field "${fieldName}" (datatype "${dt}") has no inferred operators besides null/notNull`
    );
  }
};

/**
 * Narrows an operator list for a field based on its `datatype` (or `inputType`,
 * `valueEditorType`, `values`, etc. hints; see {@link getDatatypeCategory}). Fields without
 * hints are not filtered. Only default operator names are filtered; custom operators pass
 * through unless `dropUnknownOperators` is `true`. `null`/`notNull` are always retained.
 * Option groups and input order are preserved.
 *
 * @example
 * <QueryBuilder getOperators={(_f, { fieldData }) => inferOperators(fieldData)} />
 *
 * @group Option Lists
 */
export const inferOperators = <O extends FullOperator = FullOperator>(
  fieldData: FullField,
  opts: InferOperatorsOptions<O> = {}
): FlexibleOptionList<O> => {
  const operators = (opts.operators ?? defaultOperators) as FlexibleOptionList<O>;
  const { categories, whitelist } = getDatatypeOperatorWhitelist(fieldData, opts);
  if (!categories) return operators;

  if (opts.warn && whitelist && isDev()) warnIncompatible(fieldData, categories, whitelist);

  const labelTable = opts.labels === true ? defaultDatatypeOperatorLabels : opts.labels;
  const labelCat = labelTable && categories.length === 1 ? categories[0] : null;

  const transform = <Op>(op: Op): Op | null => {
    const name = getOpName(op);
    if (!isOperatorAllowed(name, whitelist, opts.dropUnknownOperators)) return null;
    if (!labelCat) return op;
    const newLabel =
      ownLabel(labelTable![labelCat], name) ??
      ownLabel(labelTable![categoryFamily(labelCat)], name);
    const defLabel = ownLabel(defaultOperatorLabelMap, name);
    if (!newLabel || defLabel === undefined) return op;
    if (typeof op !== 'string' && (op as FlexibleOption).label !== defLabel) return op;
    return relabel(op, newLabel);
  };

  const filterList = <Op>(list: Op[]) =>
    list.map(op => transform(op)).filter((op): op is NonNullable<typeof op> => op !== null);

  if (isFlexibleOptionGroupArray(operators)) {
    return operators
      .map(og => ({ ...og, options: filterList(og.options) }))
      .filter(og => og.options.length > 0);
  }
  return filterList(operators as O[]) as FlexibleOptionList<O>;
};

/**
 * Creates a `getOperators` function that calls {@link inferOperators} with the given options.
 * Create outside render for a stable reference.
 *
 * @group Option Lists
 */
export const getOperatorsByDatatype =
  <O extends FullOperator = FullOperator>(
    opts?: InferOperatorsOptions<O>
  ): ((field: string, misc: { fieldData: FullField }) => FlexibleOptionList<O>) =>
  (_field, { fieldData }) =>
    inferOperators(fieldData, opts);
