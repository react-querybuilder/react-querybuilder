import type { RuleProcessor } from '../../types';
import { toArray, trimIfString } from '../arrayUtils';
import { shouldRenderAsNumber } from './utils';

const escapeDoubleQuotes = (v: unknown, escapeQuotes?: boolean) =>
  typeof v !== 'string' || !escapeQuotes ? `${v}` : v.replaceAll(`"`, `\\"`);

/** Auto-prefix a SPARQL variable name with `?` unless it's already prefixed, a URI, or a prefixed name.
 *
 * @group Export
 */
export const sparqlVar = (name: string): string =>
  /^[?<]/.test(name) || name.includes(':') ? name : `?${name}`;

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
  const { field: rawField, operator, value, valueSource } = rule;
  const valueIsField = valueSource === 'field';
  const operatorTL = operator.toLowerCase();
  const field = sparqlVar(rawField);

  const fmtVal = (v: unknown): string => {
    if (v === null || v === undefined) return '""';
    if (typeof v === 'boolean') return `"${v}"^^xsd:boolean`;
    if (typeof v === 'bigint') return String(v);
    if (valueIsField) return sparqlVar(trimIfString(v) as string);
    if (typeof v === 'number' || shouldRenderAsNumber(v, parseNumbers))
      return trimIfString(v) as string;
    /* v8 ignore start -- @preserve */
    const s = typeof v === 'string' ? v : (JSON.stringify(v) ?? '');
    /* v8 ignore stop -- @preserve */
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
      return `${field} IN (${items.join(', ')})`;
    }
    case 'notin': {
      const items = toArray(value).map(fmtVal);
      if (!items.length) return '';
      return `${field} NOT IN (${items.join(', ')})`;
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
