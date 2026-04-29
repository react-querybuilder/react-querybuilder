import type { RuleProcessor } from '../../types';
import { toArray, trimIfString } from '../arrayUtils';
import { shouldRenderAsNumber } from './utils';

// oxlint-disable-next-line no-explicit-any
const escapeSingleQuotes = (v: any, escapeQuotes?: boolean) =>
  typeof v !== 'string' || !escapeQuotes ? `${v}` : v.replaceAll("'", "\\'");

/**
 * Default rule processor used by {@link formatQuery} for "gremlin" format.
 *
 * Each rule becomes a `.has()` step (or `.hasNot()`/`.has()` for null checks).
 *
 * @group Export
 */
export const defaultRuleProcessorGremlin: RuleProcessor = (
  rule,
  // v8 ignore next
  opts = {}
) => {
  const { escapeQuotes, parseNumbers } = opts;
  const { field, operator, value, valueSource } = rule;
  const valueIsField = valueSource === 'field';
  const operatorTL = operator.toLowerCase();

  // Gremlin uses the last segment of dotted field names as the property key
  const prop = field.includes('.') ? field.split('.').pop()! : field;

  const fmtVal = (v: unknown): string => {
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'boolean' || typeof v === 'bigint') return String(v);
    if (valueIsField) return trimIfString(v);
    if (typeof v === 'number' || shouldRenderAsNumber(v, parseNumbers)) return trimIfString(v);
    return `'${escapeSingleQuotes(v, escapeQuotes)}'`;
  };

  switch (operatorTL) {
    case '=':
      return `.has('${prop}', ${fmtVal(value)})`;
    case '!=':
    case '<>':
      return `.has('${prop}', neq(${fmtVal(value)}))`;
    case '<':
      return `.has('${prop}', lt(${fmtVal(value)}))`;
    case '>':
      return `.has('${prop}', gt(${fmtVal(value)}))`;
    case '<=':
      return `.has('${prop}', lte(${fmtVal(value)}))`;
    case '>=':
      return `.has('${prop}', gte(${fmtVal(value)}))`;
    case 'contains':
      return `.has('${prop}', containing(${fmtVal(value)}))`;
    case 'doesnotcontain':
      return `.has('${prop}', notContaining(${fmtVal(value)}))`;
    case 'beginswith':
      return `.has('${prop}', startingWith(${fmtVal(value)}))`;
    case 'doesnotbeginwith':
      return `.has('${prop}', notStartingWith(${fmtVal(value)}))`;
    case 'endswith':
      return `.has('${prop}', endingWith(${fmtVal(value)}))`;
    case 'doesnotendwith':
      return `.has('${prop}', notEndingWith(${fmtVal(value)}))`;
    case 'null':
      return `.hasNot('${prop}')`;
    case 'notnull':
      return `.has('${prop}')`;
    case 'in': {
      const items = toArray(value).map(fmtVal);
      if (!items.length) return '';
      return `.has('${prop}', within(${items.join(', ')}))`;
    }
    case 'notin': {
      const items = toArray(value).map(fmtVal);
      if (!items.length) return '';
      return `.has('${prop}', without(${items.join(', ')}))`;
    }
    case 'between': {
      const arr = toArray(value);
      if (arr.length < 2) return '';
      return `.has('${prop}', between(${fmtVal(arr[0])}, ${fmtVal(arr[1])}))`;
    }
    case 'notbetween': {
      const arr = toArray(value);
      if (arr.length < 2) return '';
      return `.has('${prop}', outside(${fmtVal(arr[0])}, ${fmtVal(arr[1])}))`;
    }
    default:
      return `.has('${prop}', ${fmtVal(value)})`;
  }
};
