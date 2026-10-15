import type { FormatQueryFinalOptions, RuleGroupType, RuleProcessor } from '../../types';
import { toArray } from '../arrayUtils';
import { isRuleGroup } from '../isRuleGroup';
import { lc } from '../misc';
import { defaultRuleGroupProcessorQdrant } from './defaultRuleGroupProcessorQdrant';
import { formatCapabilities, getUnsupportedRuleFeature } from './formatCapabilities';
import { processMatchMode } from './utils';
import { coerceBoolean, coerceNumber, isDateInputType, toRFC3339 } from './vectorValueUtils';

type QdrantCondition = Record<string, unknown>;
type QdrantScalar = string | number | boolean;

const rangeOps = { '<': 'lt', '<=': 'lte', '>': 'gt', '>=': 'gte' } as const;

/**
 * Default rule processor used by {@link formatQuery} for "qdrant" format. Returns a Qdrant
 * filter condition, or `false` if the rule can't be expressed (see
 * {@link formatCapabilities}).
 *
 * - `contains`/`doesNotContain` use `match.text`, which requires a full-text payload index
 *   and matches tokens, not substrings.
 * - Range operators always coerce values to numbers (or RFC 3339 datetimes for `date`/
 *   `datetime-local` input types); non-coercible values are skipped.
 * - Float equality is emitted as `range: { gte: v, lte: v }` (`match.value` only accepts
 *   strings, integers, and booleans).
 * - Match modes `some`/`none` map to `nested` (arrays of objects only).
 *
 * @see https://qdrant.tech/documentation/concepts/filtering/
 *
 * @group Export
 */
export const defaultRuleProcessorQdrant: RuleProcessor = (
  rule,
  options = {}
): QdrantCondition | false => {
  if (getUnsupportedRuleFeature(rule, formatCapabilities.qdrant!)) return false;

  const { field: key, operator, value } = rule;
  const { parseNumbers, preserveValueOrder, fieldData } = options;
  const op = lc(operator);

  const matchEval = processMatchMode(rule);
  if (matchEval === false) return false;
  if (matchEval) {
    const sub = value as RuleGroupType;
    // `nested` keys are relative to array elements; element-level (empty field) rules unsupported
    if (sub.rules.some(r => !isRuleGroup(r) && !r.field)) return false;
    const filter = defaultRuleGroupProcessorQdrant(sub, options as FormatQueryFinalOptions);
    if (Object.keys(filter).length === 0) return false;
    const nested = { nested: { key, filter } };
    return matchEval.mode === 'some' ? nested : { must_not: [nested] };
  }

  const isDate = isDateInputType(fieldData?.inputType);
  const vet =
    typeof fieldData?.valueEditorType === 'function'
      ? fieldData.valueEditorType(operator)
      : fieldData?.valueEditorType;
  const isBool = vet === 'checkbox' || vet === 'switch';

  const toScalar = (v: unknown): QdrantScalar | undefined =>
    isBool
      ? coerceBoolean(v)
      : typeof v === 'boolean'
        ? v
        : (coerceNumber(v, !!parseNumbers) ?? (typeof v === 'string' ? v : undefined));

  const eq = (v: unknown): QdrantCondition | false => {
    if (isDate) {
      const d = toRFC3339(v);
      return d ? { key, range: { gte: d, lte: d } } : false;
    }
    const s = toScalar(v);
    if (s === undefined) return false;
    return typeof s === 'number' && !Number.isInteger(s)
      ? { key, range: { gte: s, lte: s } }
      : { key, match: { value: s } };
  };

  switch (op) {
    case '=':
      return eq(value);

    case '!=': {
      const c = eq(value);
      return c && { must_not: [c] };
    }

    case '<':
    case '<=':
    case '>':
    case '>=': {
      const v = isDate ? toRFC3339(value) : coerceNumber(value);
      return v === undefined ? false : { key, range: { [rangeOps[op]]: v } };
    }

    case 'in':
    case 'notin': {
      const list = toArray(value);
      if (list.length === 0) return false;
      const scalars = isDate ? [] : list.map(toScalar);
      const anyable =
        scalars.length > 0 &&
        (scalars.every(s => typeof s === 'string') ||
          scalars.every(s => typeof s === 'number' && Number.isInteger(s)));
      if (anyable) {
        return { key, match: { [op === 'in' ? 'any' : 'except']: scalars } };
      }
      const conds = list.map(eq);
      if (conds.some(c => !c)) return false;
      return op === 'in' ? { should: conds } : { must_not: conds };
    }

    case 'between':
    case 'notbetween': {
      const list = toArray(value);
      if (list.length < 2) return false;
      let [a, b] = isDate
        ? [toRFC3339(list[0]), toRFC3339(list[1])]
        : [coerceNumber(list[0]), coerceNumber(list[1])];
      if (a === undefined || b === undefined) return false;
      if (!preserveValueOrder && (isDate ? Date.parse(`${b}`) < Date.parse(`${a}`) : b < a)) {
        [a, b] = [b, a];
      }
      return op === 'between'
        ? { key, range: { gte: a, lte: b } }
        : {
            should: [
              { key, range: { lt: a } },
              { key, range: { gt: b } },
            ],
          };
    }

    case 'null':
      return { is_null: { key } };

    case 'notnull':
      return { must_not: [{ is_null: { key } }] };

    case 'contains':
    case 'doesnotcontain': {
      if (typeof value !== 'string' || !value) return false;
      const c = { key, match: { text: value } };
      return op === 'contains' ? c : { must_not: [c] };
    }
  }

  /* v8 ignore next -- @preserve */
  return false;
};
