import type { DefaultCombinatorNameExtended, DefaultOperatorName, MatchMode } from '../../types';
import type {
  RAQBChildren,
  RAQBFuncArgValue,
  RAQBFuncValue,
  RAQBJsonItem,
  RAQBListValue,
  RAQBRelativeDateTimeValue,
  RAQBTreeValue,
} from './types';

/**
 * Maps RAQB operator keys to {@link DefaultOperatorName}s.
 *
 * `is_empty`/`is_not_empty` map to `=`/`!=` and are paired with a forced empty-string value
 * (see {@link raqbEmptyValueOperators}) since RQB has no dedicated "is empty" operator.
 */
export const raqbToRqbOperatorMap: Record<string, DefaultOperatorName> = {
  equal: '=',
  not_equal: '!=',
  less: '<',
  less_or_equal: '<=',
  greater: '>',
  greater_or_equal: '>=',
  like: 'contains',
  not_like: 'doesNotContain',
  starts_with: 'beginsWith',
  ends_with: 'endsWith',
  between: 'between',
  not_between: 'notBetween',
  is_null: 'null',
  is_not_null: 'notNull',
  is_empty: '=',
  is_not_empty: '!=',
  select_equals: '=',
  select_not_equals: '!=',
  select_any_in: 'in',
  select_not_any_in: 'notIn',
  multiselect_equals: '=',
  multiselect_not_equals: '!=',
  multiselect_contains: 'contains',
  multiselect_not_contains: 'doesNotContain',
};

/**
 * Maps {@link DefaultOperatorName}s to RAQB operator keys. This is the inverse of
 * {@link raqbToRqbOperatorMap}, which is many-to-one, so the entries here are the "scalar"
 * variants. See {@link rqbToRaqbSelectOperatorMap} and {@link rqbToRaqbMultiselectOperatorMap}
 * for the variants preferred when the field renders as a select.
 *
 * RQB's `doesNotBeginWith`/`doesNotEndWith` are intentionally absent — RAQB's default config
 * defines no `not_starts_with`/`not_ends_with`.
 */
export const rqbToRaqbOperatorMap: Partial<Record<DefaultOperatorName, string>> = {
  '=': 'equal',
  '!=': 'not_equal',
  '<': 'less',
  '<=': 'less_or_equal',
  '>': 'greater',
  '>=': 'greater_or_equal',
  contains: 'like',
  doesNotContain: 'not_like',
  beginsWith: 'starts_with',
  endsWith: 'ends_with',
  between: 'between',
  notBetween: 'not_between',
  null: 'is_null',
  notNull: 'is_not_null',
  in: 'select_any_in',
  notIn: 'select_not_any_in',
};

/** RAQB operator keys preferred when the rule's field renders as a single-value select. */
export const rqbToRaqbSelectOperatorMap: Partial<Record<DefaultOperatorName, string>> = {
  '=': 'select_equals',
  '!=': 'select_not_equals',
};

/** RAQB operator keys preferred when the rule's field renders as a multiselect. */
export const rqbToRaqbMultiselectOperatorMap: Partial<Record<DefaultOperatorName, string>> = {
  '=': 'multiselect_equals',
  '!=': 'multiselect_not_equals',
  contains: 'multiselect_contains',
  doesNotContain: 'multiselect_not_contains',
};

/**
 * Maps lowercased {@link MatchMode}s to RAQB `!group` operators. Threshold-based modes
 * (`atleast`/`atmost`/`exactly`) additionally require the threshold in `properties.value[0]`.
 */
export const matchModeToRaqbOperatorMap: Record<string, string> = {
  all: 'all',
  some: 'some',
  none: 'none',
  atleast: 'greater_or_equal',
  atmost: 'less_or_equal',
  exactly: 'equal',
};

/** RAQB `!group` operators that require a numeric threshold operand. */
export const raqbThresholdOperators: Set<string> = new Set([
  'equal',
  'greater_or_equal',
  'less_or_equal',
]);

/** RAQB operators that carry no operand in RQB. */
export const raqbNullaryOperators: Set<string> = new Set(['is_null', 'is_not_null']);

/** RAQB operators whose RQB equivalent is a comparison against an empty string. */
export const raqbEmptyValueOperators: Set<string> = new Set(['is_empty', 'is_not_empty']);

/** RAQB operators that take two operands. */
export const raqbBinaryOperators: Set<string> = new Set(['between', 'not_between']);

/** RAQB operators whose operand is a list. */
export const raqbListOperators: Set<string> = new Set([
  'select_any_in',
  'select_not_any_in',
  'multiselect_equals',
  'multiselect_not_equals',
  'multiselect_contains',
  'multiselect_not_contains',
]);

/** RAQB `!group` aggregation operators that map directly to a {@link MatchMode}. */
export const raqbAggregateMatchModeMap: Record<string, MatchMode> = {
  some: 'some',
  all: 'all',
  none: 'none',
};

/**
 * RAQB `!group` count operators that map to a threshold-based {@link MatchMode}. RAQB's strict
 * inequalities (`less`/`greater`) have no RQB equivalent and are intentionally absent.
 */
export const raqbCountMatchModeMap: Record<string, MatchMode> = {
  equal: 'exactly',
  greater_or_equal: 'atLeast',
  less_or_equal: 'atMost',
};

/**
 * Maps RAQB's built-in function names to `@react-querybuilder/expr` function names. Functions
 * absent from this map are passed through with their original name.
 */
export const raqbToRqbFunctionMap: Record<string, string> = {
  LOWER: 'lower',
  UPPER: 'upper',
};

/** Inverse of {@link raqbToRqbFunctionMap}. */
export const rqbToRaqbFunctionMap: Record<string, string> = {
  lower: 'LOWER',
  upper: 'UPPER',
};

/**
 * Argument names used by RAQB's built-in functions, keyed by RAQB function name. RQB expressions
 * store arguments in an ordered array, so these names are needed to produce a RAQB `args` object
 * that its own config recognizes. Functions absent from this map get positional `arg0`, `arg1`,
 * ... names, which can be overridden per function.
 */
export const raqbFuncArgNames: Record<string, string[]> = {
  LOWER: ['str'],
  UPPER: ['str'],
  LINEAR_REGRESSION: ['coef', 'val', 'bias'],
  RELATIVE_DATE: ['date', 'op', 'val', 'dim'],
  RELATIVE_DATETIME: ['date', 'op', 'val', 'dim'],
  TRUNCATE_DATETIME: ['date', 'dim'],
};

/** RAQB `!group` field modes that represent a collection sub-query (as opposed to a struct). */
export const raqbSubQueryModes: Set<string> = new Set(['some', 'array']);

/** Normalizes RAQB's `children1` (array or keyed object) to an array, preserving item `id`s. */
export const raqbChildrenToArray = <T extends RAQBJsonItem>(
  children: RAQBChildren<T> | undefined
): T[] =>
  !children
    ? []
    : Array.isArray(children)
      ? children
      : Object.entries(children).map(([id, child]) => Object.assign({ id }, child));

/** Determines whether a value is a RAQB function value (`{ func, args }`). */
export const isRAQBFuncValue = (v: unknown): v is RAQBFuncValue =>
  typeof v === 'object' && v !== null && typeof (v as RAQBFuncValue).func === 'string';

/**
 * Determines whether a value looks like an immutable.js structure. RAQB's internal tree is
 * immutable.js-based; {@link parseRAQB} only accepts the plain-JSON form.
 */
export const isImmutableLike = (v: unknown): boolean =>
  typeof v === 'object' && v !== null && typeof (v as { toJS?: unknown }).toJS === 'function';

/** Normalizes a RAQB list value entry to an RQB option. */
const listValueToOption = (lv: RAQBListValue): { name: string; label: string } => {
  const value = lv.value ?? (lv as { key?: unknown }).key;
  const name = `${value ?? ''}`;
  return { name, label: `${lv.title ?? (lv as { label?: unknown }).label ?? name}` };
};

/**
 * Normalizes RAQB's several accepted `listValues` shapes (array of objects, array of primitives,
 * or a value-to-label record) to an RQB option array.
 */
export const raqbListValuesToOptions = (
  listValues: RAQBListValue[] | Record<string, string> | string[] | undefined
): { name: string; label: string }[] => {
  if (!listValues) return [];
  if (Array.isArray(listValues)) {
    return listValues.map(lv =>
      typeof lv === 'object' && lv !== null
        ? listValueToOption(lv)
        : { name: `${lv}`, label: `${lv}` }
    );
  }
  return Object.entries(listValues).map(([name, label]) => ({ name, label: `${label}` }));
};

/** Flattens RAQB's `treeValues` (depth-first) to a flat RQB option array. */
export const raqbTreeValuesToOptions = (
  treeValues: RAQBTreeValue[]
): { name: string; label: string }[] => {
  const options: { name: string; label: string }[] = [];
  const walk = (nodes: RAQBTreeValue[]) => {
    for (const node of nodes) {
      options.push(listValueToOption(node));
      if (Array.isArray(node.children)) {
        walk(node.children);
      }
    }
  };
  walk(treeValues);
  return options;
};

/**
 * Converts a RAQB conjunction (`"AND"`/`"OR"`, or a custom key) to an RQB combinator. Unrecognized
 * conjunctions fall back to `"and"`.
 */
export const raqbConjunctionToCombinator = (
  conjunction: string | undefined
): DefaultCombinatorNameExtended => {
  const combinator = (conjunction ?? 'and').toLowerCase();
  return combinator === 'or' || combinator === 'xor' || combinator === 'and' ? combinator : 'and';
};

/**
 * Converts an RQB combinator to a RAQB conjunction. RAQB's default config only defines `AND`
 * and `OR`; `xor` is emitted as `XOR` (RAQB's `checkTree` will flag it unless a matching custom
 * conjunction is configured) rather than silently degraded to `AND`.
 */
export const combinatorToRaqbConjunction = (combinator: string | undefined): string =>
  (combinator ?? 'and').toUpperCase();

/** RAQB dimensions that map to a {@link RAQBRelativeDateTimeValue} `unit`. RQB has no "second". */
export const raqbRelativeDateTimeUnits: Set<string> = new Set([
  'minute',
  'hour',
  'day',
  'week',
  'month',
  'year',
]);

/** RAQB dimensions that map to a `startOf*` {@link RAQBRelativeDateTimeValue} anchor. */
export const raqbTruncationUnits: Set<string> = new Set(['day', 'week', 'month', 'year']);

const nowValue: RAQBRelativeDateTimeValue = {
  mode: 'relative',
  anchor: 'now',
  offset: 0,
  unit: 'day',
};

/**
 * Resolves the `date` argument of `TRUNCATE_DATETIME`/`RELATIVE_DATE(TIME)`, which defaults to
 * `NOW()` when absent.
 */
function raqbRelativeDateTimeBase(
  arg: RAQBFuncArgValue | undefined
): RAQBRelativeDateTimeValue | null {
  if (!arg || arg.value === undefined || arg.value === null) return nowValue;
  if ((arg.valueSrc ?? 'value') !== 'func' || !isRAQBFuncValue(arg.value)) return null;
  return raqbFuncToRelativeDateTime(arg.value);
}

/**
 * Converts one of RAQB's built-in date/time functions to a {@link RAQBRelativeDateTimeValue}, which
 * `@react-querybuilder/datetime` serializes symbolically in every export format. Returns `null` for
 * any other function, or when the arguments fall outside what RQB's relative date/time values can
 * represent (e.g. a "second" dimension, or truncation applied _after_ an offset).
 */
export function raqbFuncToRelativeDateTime(
  funcValue: RAQBFuncValue
): RAQBRelativeDateTimeValue | null {
  const args = funcValue.args ?? {};

  switch (funcValue.func) {
    case 'NOW': {
      return nowValue;
    }

    case 'TODAY':
    case 'START_OF_TODAY': {
      return { mode: 'relative', anchor: 'startOfDay', offset: 0, unit: 'day' };
    }

    case 'TRUNCATE_DATETIME': {
      const base = raqbRelativeDateTimeBase(args.date);
      // RQB applies the anchor before the offset, so truncating an already-offset date
      // (e.g. `TRUNCATE_DATETIME(RELATIVE_DATETIME(NOW, minus, 3, day), month)`) is not
      // representable.
      if (!base || base.anchor !== 'now' || base.offset !== 0) return null;
      const dim = args.dim?.value;
      if (typeof dim !== 'string' || !raqbTruncationUnits.has(dim)) return null;
      return {
        mode: 'relative',
        anchor:
          `startOf${dim[0].toUpperCase()}${dim.slice(1)}` as RAQBRelativeDateTimeValue['anchor'],
        offset: 0,
        unit: 'day',
      };
    }

    case 'RELATIVE_DATE':
    case 'RELATIVE_DATETIME': {
      const base = raqbRelativeDateTimeBase(args.date);
      if (!base || base.offset !== 0) return null;
      const op = args.op?.value;
      if (op !== 'plus' && op !== 'minus') return null;
      const val = Number(args.val?.value);
      if (!Number.isFinite(val)) return null;
      const dim = args.dim?.value;
      if (typeof dim !== 'string' || !raqbRelativeDateTimeUnits.has(dim)) return null;
      return {
        mode: 'relative',
        anchor: base.anchor,
        offset: op === 'minus' ? -val : val,
        unit: dim as RAQBRelativeDateTimeValue['unit'],
      };
    }
  }

  return null;
}

/** Determines whether a value has the {@link RAQBRelativeDateTimeValue} shape. */
export const isRelativeDateTimeValue = (v: unknown): v is RAQBRelativeDateTimeValue =>
  typeof v === 'object' &&
  v !== null &&
  (v as RAQBRelativeDateTimeValue).mode === 'relative' &&
  typeof (v as RAQBRelativeDateTimeValue).anchor === 'string';

/**
 * Converts a relative date/time anchor to the RAQB function that produces it. Returns `null` for
 * `endOf*` anchors, which RAQB's built-in functions cannot express.
 */
const raqbAnchorFunc = (anchor: string): RAQBFuncValue | null => {
  if (anchor === 'now') return { func: 'NOW', args: {} };
  if (anchor === 'startOfDay') return { func: 'START_OF_TODAY', args: {} };

  const truncationUnit = /^startOf(Week|Month|Year)$/.exec(anchor)?.[1].toLowerCase();
  if (!truncationUnit) return null;

  return {
    func: 'TRUNCATE_DATETIME',
    args: {
      date: { value: { func: 'NOW', args: {} }, valueSrc: 'func', valueType: 'datetime' },
      dim: { value: truncationUnit, valueSrc: 'value', valueType: 'select' },
    },
  };
};

/**
 * Converts an `@react-querybuilder/datetime` `RelativeDateTimeValue` to the equivalent RAQB
 * built-in date/time function call. Inverse of {@link raqbFuncToRelativeDateTime}.
 *
 * Returns `null` for values RAQB's built-in functions cannot express (`endOf*` anchors).
 */
export function relativeDateTimeToRaqbFunc(value: unknown): RAQBFuncValue | null {
  if (!isRelativeDateTimeValue(value)) return null;

  const base = raqbAnchorFunc(value.anchor);
  if (!base) return null;

  const { offset } = value;
  if (!Number.isFinite(offset) || offset === 0) return base;
  // An offset RAQB can't dimension is worse than no function at all: emitting `dim` without a
  // value produces a tree `checkTree` rejects, so fall back to the plain value instead.
  if (!raqbRelativeDateTimeUnits.has(value.unit)) return null;

  return {
    func: 'RELATIVE_DATETIME',
    args: {
      date: { value: base, valueSrc: 'func', valueType: 'datetime' },
      op: { value: offset < 0 ? 'minus' : 'plus', valueSrc: 'value', valueType: 'select' },
      val: { value: Math.abs(offset), valueSrc: 'value', valueType: 'number' },
      dim: { value: value.unit, valueSrc: 'value', valueType: 'select' },
    },
  };
}
