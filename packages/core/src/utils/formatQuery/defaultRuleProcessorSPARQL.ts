import type { RuleProcessor } from '../../types';
import { toArray, trimIfString } from '../arrayUtils';
import { shouldRenderAsNumber } from './utils';

// oxlint-disable-next-line no-explicit-any
const escapeDoubleQuotes = (v: any, escapeQuotes?: boolean) =>
  typeof v !== 'string' || !escapeQuotes ? `${v}` : v.replaceAll(`"`, `\\"`);

/**
 * Default rule processor used by {@link formatQuery} for "sparql" format.
 *
 * @group Export
 */
export const defaultRuleProcessorSPARQL: RuleProcessor = (
  rule,
  // v8 ignore next
  opts = {}
) => {
  const { escapeQuotes, parseNumbers } = opts;
  const { field, operator, value, valueSource } = rule;
  const valueIsField = valueSource === 'field';
  const operatorTL = operator.toLowerCase();

  const fmtVal = (v: unknown): string => {
    if (v === null || v === undefined) return '""';
    if (typeof v === 'boolean') return `"${v}"^^xsd:boolean`;
    if (typeof v === 'bigint') return String(v);
    if (valueIsField) return trimIfString(v);
    if (typeof v === 'number' || shouldRenderAsNumber(v, parseNumbers)) return trimIfString(v);
    const s =
      typeof v === 'string' ? v : /* v8 ignore next -- @preserve */ (JSON.stringify(v) ?? '');
    // Don't quote variable references or URIs
    if (s.startsWith('?') || s.startsWith('<') || s.includes(':')) return s;
    return `"${escapeDoubleQuotes(s, escapeQuotes)}"`;
  };

  switch (operatorTL) {
    case '=':
    case '!=':
    case '<':
    case '>':
    case '<=':
    case '>=':
      return `${field} ${operatorTL} ${fmtVal(value)}`;
    case '<>':
      return `${field} != ${fmtVal(value)}`;
    case 'contains':
      return `CONTAINS(${field}, ${fmtVal(value)})`;
    case 'doesnotcontain':
      return `!CONTAINS(${field}, ${fmtVal(value)})`;
    case 'beginswith':
      return `STRSTARTS(${field}, ${fmtVal(value)})`;
    case 'doesnotbeginwith':
      return `!STRSTARTS(${field}, ${fmtVal(value)})`;
    case 'endswith':
      return `STRENDS(${field}, ${fmtVal(value)})`;
    case 'doesnotendwith':
      return `!STRENDS(${field}, ${fmtVal(value)})`;
    case 'null':
      return `!BOUND(${field})`;
    case 'notnull':
      return `BOUND(${field})`;
    case 'in': {
      const items = toArray(value).map(fmtVal);
      if (!items.length) return '';
      return items.map(item => `${field} = ${item}`).join(' || ');
    }
    case 'notin': {
      const items = toArray(value).map(fmtVal);
      if (!items.length) return '';
      return items.map(item => `${field} != ${item}`).join(' && ');
    }
    case 'between': {
      const arr = toArray(value);
      if (arr.length < 2) return '';
      return `${field} >= ${fmtVal(arr[0])} && ${field} <= ${fmtVal(arr[1])}`;
    }
    case 'notbetween': {
      const arr = toArray(value);
      if (arr.length < 2) return '';
      return `(${field} < ${fmtVal(arr[0])} || ${field} > ${fmtVal(arr[1])})`;
    }
    default:
      return `${field} ${operator} ${fmtVal(value)}`;
  }
};
