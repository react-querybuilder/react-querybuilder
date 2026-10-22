import type { RuleProcessor } from '../../types';
import { toArray } from '../arrayUtils';
import { lc } from '../misc';
import { formatCapabilities, getUnsupportedRuleFeature } from './formatCapabilities';
import { regexFallbackRule } from './utils';
import {
  coerceBoolean,
  coerceNumber,
  isBooleanEditor,
  isDateInputType,
  toRFC3339,
} from './vectorValueUtils';

type WeaviateFilter = Record<string, unknown>;
type ValueKey = 'valueText' | 'valueInt' | 'valueNumber' | 'valueBoolean' | 'valueDate';
type Typed = [ValueKey, string | number | boolean];

const numericInputTypes = new Set(['number', 'range', 'bigint']);

const cmpOps = {
  '=': 'Equal',
  '!=': 'NotEqual',
  '<': 'LessThan',
  '<=': 'LessThanEqual',
  '>': 'GreaterThan',
  '>=': 'GreaterThanEqual',
} as const;

const likePatterns: Record<string, (v: string) => string> = {
  contains: v => `*${v}*`,
  beginswith: v => `${v}*`,
  endswith: v => `*${v}`,
};

const negatedLikeOps: Record<string, string> = {
  doesnotcontain: 'contains',
  doesnotbeginwith: 'beginswith',
  doesnotendwith: 'endswith',
};

const numKey = (n: number): ValueKey => (Number.isInteger(n) ? 'valueInt' : 'valueNumber');

/**
 * Default rule processor used by {@link formatQuery} for "weaviate" format. Returns a
 * Weaviate `where` filter object (GraphQL/REST shape), or `false` if the rule can't be
 * expressed (see {@link formatCapabilities}).
 *
 * - `path` is `[field]`, or `field` split on `fieldIdentifierSeparator` when set (e.g.
 *   cross-references: `"inPublication.Publication.name"` w/ `"."`).
 * - Value key from `inputType`/editor/`parseNumbers`: `date`/`datetime-local` →
 *   `valueDate` (RFC 3339); checkbox/switch → `valueBoolean`; numbers → `valueInt`/
 *   `valueNumber`; else `valueText`.
 * - String operators use `Like`; `*`/`?` in values pass through as wildcards (Weaviate has
 *   no escape). Negated string operators wrap `Like` in `Not`.
 * - `in`/`notIn` → `ContainsAny`/`ContainsNone` w/ an array under the singular value key.
 *   Text values are tokenized per the property's `tokenization`.
 * - `null`/`notNull` → `IsNull` (requires `invertedIndexConfig.indexNullState: true`).
 * - `Not` and `ContainsNone` require Weaviate v1.33+.
 *
 * @see https://docs.weaviate.io/weaviate/api/graphql/filters
 *
 * @group Export
 */
export const defaultRuleProcessorWeaviate: RuleProcessor = (
  rule,
  options = {}
): WeaviateFilter | false => {
  if (getUnsupportedRuleFeature(rule, formatCapabilities.weaviate!)) return false;

  const { field, operator, value } = regexFallbackRule(rule);
  const { parseNumbers, preserveValueOrder, fieldData, fieldIdentifierSeparator } = options;
  const op = lc(operator);
  const path = fieldIdentifierSeparator ? field.split(fieldIdentifierSeparator) : [field];
  const isDate = isDateInputType(fieldData?.inputType);
  const isBool = isBooleanEditor(fieldData, operator);
  const parse = !!parseNumbers || numericInputTypes.has(fieldData?.inputType ?? '');

  const typed = (v: unknown, forceNumber = false): Typed | undefined => {
    if (isDate) {
      const d = toRFC3339(v);
      return d === undefined ? undefined : ['valueDate', d];
    }
    if (isBool) {
      const b = coerceBoolean(v);
      return b === undefined ? undefined : ['valueBoolean', b];
    }
    if (typeof v === 'boolean') return ['valueBoolean', v];
    const n = coerceNumber(v, forceNumber || parse);
    if (n !== undefined) return [numKey(n), n];
    return typeof v === 'string' ? ['valueText', v] : undefined;
  };

  const cond = (wOp: string, t: Typed): WeaviateFilter => ({
    operator: wOp,
    path,
    [t[0]]: t[1],
  });

  switch (op) {
    case '=':
    case '!=':
    case '<':
    case '<=':
    case '>':
    case '>=': {
      const t = typed(value, op !== '=' && op !== '!=');
      return t ? cond(cmpOps[op], t) : false;
    }

    case 'contains':
    case 'beginswith':
    case 'endswith':
    case 'doesnotcontain':
    case 'doesnotbeginwith':
    case 'doesnotendwith': {
      if (typeof value !== 'string' || !value) return false;
      const base = negatedLikeOps[op] ?? op;
      const like = { operator: 'Like', path, valueText: likePatterns[base](value) };
      return base === op ? like : { operator: 'Not', operands: [like] };
    }

    case 'in':
    case 'notin': {
      const list = toArray(value).map(v => typed(v));
      if (list.length === 0 || list.some(t => t === undefined)) return false;
      const ts = list as Typed[];
      // One value key per filter; ints widen to `valueNumber` alongside floats
      const keys = new Set(ts.map(([k]) => (k === 'valueInt' ? 'valueNumber' : k)));
      if (keys.size > 1) return false;
      const [key] = [...keys];
      const finalKey = ts.every(([k]) => k === 'valueInt') ? 'valueInt' : key;
      return {
        operator: op === 'in' ? 'ContainsAny' : 'ContainsNone',
        path,
        [finalKey]: ts.map(([, v]) => v),
      };
    }

    case 'between':
    case 'notbetween': {
      const list = toArray(value);
      if (list.length < 2) return false;
      let [a, b] = [typed(list[0], true), typed(list[1], true)];
      if (!a || !b || a[0] === 'valueText' || b[0] === 'valueText') return false;
      if (a[0] === 'valueBoolean' || b[0] === 'valueBoolean') return false;
      const cmp = (x: Typed) => (x[0] === 'valueDate' ? Date.parse(`${x[1]}`) : (x[1] as number));
      if (!preserveValueOrder && cmp(b) < cmp(a)) [a, b] = [b, a];
      return op === 'between'
        ? {
            operator: 'And',
            operands: [cond('GreaterThanEqual', a), cond('LessThanEqual', b)],
          }
        : { operator: 'Or', operands: [cond('LessThan', a), cond('GreaterThan', b)] };
    }

    case 'null':
    case 'notnull':
      return { operator: 'IsNull', path, valueBoolean: op === 'null' };
  }

  /* v8 ignore next -- @preserve */
  return false;
};
