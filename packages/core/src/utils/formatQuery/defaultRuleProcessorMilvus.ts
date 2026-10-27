import type { RuleProcessor } from '../../types';
import { toArray } from '../arrayUtils';
import { lc } from '../misc';
import { formatCapabilities, getUnsupportedRuleFeature } from './formatCapabilities';
import { regexFallbackRule } from './utils';
import { coerceBoolean, coerceNumber, isBooleanEditor } from './vectorValueUtils';

const cmpOps = { '=': '==', '!=': '!=', '<': '<', '<=': '<=', '>': '>', '>=': '>=' } as const;

const likePatterns: Record<string, (v: string) => string> = {
  contains: v => `%${v}%`,
  beginswith: v => `${v}%`,
  endswith: v => `%${v}`,
};

const negatedLikeOps: Record<string, string> = {
  doesnotcontain: 'contains',
  doesnotbeginwith: 'beginswith',
  doesnotendwith: 'endswith',
};

/** Double-quoted Milvus string literal (escapes `\` and `"`). */
const quote = (s: string) => `"${s.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;

/** Escapes `like` wildcards/escape char so user values match literally. */
const escapeLike = (s: string) => s.replaceAll(/[\\%_]/g, '\\$&');

/**
 * Default rule processor used by {@link formatQuery} for "milvus" format. Returns a Milvus
 * boolean filter expression, or `""` if the rule can't be expressed (see
 * {@link formatCapabilities}).
 *
 * - Field names are emitted verbatim (incl. JSON paths like `meta["k"]`). They are **not**
 *   escaped; whitelist field names.
 * - Strings are double-quoted (`\` and `"` escaped). String operators use `like`; `%`, `_`,
 *   and `\` in values are escaped.
 * - Range operators (incl. `between`) coerce numeric strings to numbers; other strings are
 *   compared as strings. Store dates as epoch ms numbers.
 * - `null`/`notNull` → `is null`/`is not null` (Milvus 2.5+).
 * - `valueSource: "field"` is supported for comparison operators and `between`/
 *   `notBetween` only.
 * - Match modes are skipped.
 *
 * @see https://milvus.io/docs/boolean.md
 *
 * @group Export
 */
export const defaultRuleProcessorMilvus: RuleProcessor = (rule, options = {}): string => {
  if (getUnsupportedRuleFeature(rule, formatCapabilities.milvus!)) return '';

  const { field, operator, value, valueSource } = regexFallbackRule(rule);
  const { parseNumbers, preserveValueOrder, fieldData } = options;
  const op = lc(operator);
  const isField = valueSource === 'field';
  const isBool = isBooleanEditor(fieldData, operator);

  const literal = (v: unknown, forceNumber = false): string | undefined => {
    if (isField) return typeof v === 'string' && v ? v : undefined;
    if (isBool) {
      const b = coerceBoolean(v);
      return b === undefined ? undefined : `${b}`;
    }
    if (typeof v === 'boolean' || typeof v === 'bigint') return `${v}`;
    const n = coerceNumber(v, forceNumber || !!parseNumbers);
    if (n !== undefined) return `${n}`;
    return typeof v === 'string' ? quote(v) : undefined;
  };

  switch (op) {
    case '=':
    case '!=':
    case '<':
    case '<=':
    case '>':
    case '>=': {
      const v = literal(value, op !== '=' && op !== '!=');
      return v === undefined ? '' : `${field} ${cmpOps[op]} ${v}`;
    }

    case 'in':
    case 'notin': {
      // `valueSource: "field"` gated by `formatCapabilities`
      const list = toArray(value).map(v => literal(v));
      if (list.length === 0 || list.some(v => v === undefined)) return '';
      return `${field} ${op === 'in' ? 'in' : 'not in'} [${list.join(', ')}]`;
    }

    case 'between':
    case 'notbetween': {
      const list = toArray(value);
      if (list.length < 2) return '';
      const nums = isField ? [] : [coerceNumber(list[0]), coerceNumber(list[1])];
      let [a, b] = [literal(list[0], true), literal(list[1], true)];
      if (a === undefined || b === undefined) return '';
      if (!preserveValueOrder && nums.length > 0 && nums[0]! > nums[1]!) [a, b] = [b, a];
      return op === 'between'
        ? `(${field} >= ${a} and ${field} <= ${b})`
        : `(${field} < ${a} or ${field} > ${b})`;
    }

    case 'null':
      return `${field} is null`;

    case 'notnull':
      return `${field} is not null`;

    case 'contains':
    case 'beginswith':
    case 'endswith':
    case 'doesnotcontain':
    case 'doesnotbeginwith':
    case 'doesnotendwith': {
      if (typeof value !== 'string' || !value) return '';
      const base = negatedLikeOps[op] ?? op;
      const like = `${field} like ${quote(likePatterns[base](escapeLike(value)))}`;
      return base === op ? like : `not (${like})`;
    }
  }

  /* v8 ignore next -- @preserve */
  return '';
};
