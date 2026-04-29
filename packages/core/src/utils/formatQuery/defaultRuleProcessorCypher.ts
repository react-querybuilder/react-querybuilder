import type { RuleProcessor } from '../../types';
import { toArray, trimIfString } from '../arrayUtils';
import { shouldRenderAsNumber } from './utils';

// oxlint-disable-next-line no-explicit-any
const escapeSingleQuotes = (v: any, escapeQuotes?: boolean) =>
  typeof v !== 'string' || !escapeQuotes ? `${v}` : v.replaceAll("'", "\\'");

/**
 * Default rule processor used by {@link formatQuery} for "cypher" and "gql" formats.
 *
 * @group Export
 */
export const defaultRuleProcessorCypher: RuleProcessor = (
  rule,
  // v8 ignore next
  opts = {}
) => {
  const { escapeQuotes, parseNumbers } = opts;
  const { field, operator, value, valueSource } = rule;
  const valueIsField = valueSource === 'field';
  const operatorTL = operator.toLowerCase();

  const fmtVal = (v: unknown): string => {
    if (v === null || v === undefined) return 'null';
    if (typeof v === 'boolean' || typeof v === 'bigint') return String(v);
    if (valueIsField) return trimIfString(v);
    if (typeof v === 'number' || shouldRenderAsNumber(v, parseNumbers)) return trimIfString(v);
    return `'${escapeSingleQuotes(v, escapeQuotes)}'`;
  };

  switch (operatorTL) {
    case '=':
      return `${field} = ${fmtVal(value)}`;
    case '!=':
    case '<>':
      return `${field} <> ${fmtVal(value)}`;
    case '<':
    case '>':
    case '<=':
    case '>=':
      return `${field} ${operatorTL} ${fmtVal(value)}`;
    case 'contains':
      return `${field} CONTAINS ${fmtVal(value)}`;
    case 'doesnotcontain':
      return `NOT ${field} CONTAINS ${fmtVal(value)}`;
    case 'beginswith':
      return `${field} STARTS WITH ${fmtVal(value)}`;
    case 'doesnotbeginwith':
      return `NOT ${field} STARTS WITH ${fmtVal(value)}`;
    case 'endswith':
      return `${field} ENDS WITH ${fmtVal(value)}`;
    case 'doesnotendwith':
      return `NOT ${field} ENDS WITH ${fmtVal(value)}`;
    case 'null':
      return `${field} IS NULL`;
    case 'notnull':
      return `${field} IS NOT NULL`;
    case 'in':
    case 'notin': {
      const values = toArray(value).map(fmtVal);
      if (!values.length) return '';
      const prefix = operatorTL === 'notin' ? 'NOT ' : '';
      return `${prefix}${field} IN [${values.join(', ')}]`;
    }
    case 'between':
    case 'notbetween': {
      const arr = toArray(value);
      if (arr.length < 2) return '';
      const [low, high] = [fmtVal(arr[0]), fmtVal(arr[1])];
      const expr = `${low} <= ${field} AND ${field} <= ${high}`;
      return operatorTL === 'notbetween' ? `NOT (${expr})` : expr;
    }
    default:
      return `${field} ${operator} ${fmtVal(value)}`;
  }
};
