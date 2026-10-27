import type { RuleType, ValueProcessorOptions } from '../../types';
import { toArray } from '../arrayUtils';
import { lc } from '../misc';
import { formatCapabilities, getUnsupportedRuleFeature } from './formatCapabilities';
import { regexFallbackRule } from './utils';
import { coerceBoolean, coerceNumber, isBooleanEditor } from './vectorValueUtils';

type Scalar = string | number | boolean;
export type MongoLikeVectorFlavor = 'pinecone' | 'chroma';

const kind = (s: unknown) =>
  typeof s === 'number' ? (Number.isInteger(s) ? 'int' : 'float') : typeof s;

const cmpOps = { '=': '$eq', '!=': '$ne', '<': '$lt', '<=': '$lte', '>': '$gt', '>=': '$gte' };

/**
 * Rule → Mongo-like metadata filter shared by Pinecone and Chroma.
 *
 * @internal
 */
export const mongoLikeRuleProcessor = (
  flavor: MongoLikeVectorFlavor,
  rule: RuleType,
  options: ValueProcessorOptions = {}
): Record<string, unknown> | false => {
  if (getUnsupportedRuleFeature(rule, formatCapabilities[flavor]!)) return false;

  const { field, operator, value } = regexFallbackRule(rule);
  const { parseNumbers, preserveValueOrder, fieldData } = options;
  const op = lc(operator);
  const isBool = isBooleanEditor(fieldData, operator);

  const toScalar = (v: unknown): Scalar | undefined =>
    isBool
      ? coerceBoolean(v)
      : typeof v === 'boolean'
        ? v
        : (coerceNumber(v, !!parseNumbers) ?? (typeof v === 'string' ? v : undefined));

  const cond = (o: string, v: unknown) => ({ [field]: { [o]: v } });

  switch (op) {
    case '=':
    case '!=': {
      const s = toScalar(value);
      return s === undefined ? false : cond(cmpOps[op], s);
    }

    case '<':
    case '<=':
    case '>':
    case '>=': {
      const n = coerceNumber(value);
      return n === undefined ? false : cond(cmpOps[op], n);
    }

    case 'in':
    case 'notin': {
      const list = toArray(value).map(toScalar);
      if (list.length === 0 || list.some(s => s === undefined)) return false;
      if (flavor === 'pinecone') {
        // Pinecone `$in`/`$nin`: strings and numbers only
        if (list.some(s => typeof s === 'boolean')) return false;
      } else {
        // Chroma: all members must share the first member's type (int ≠ float)
        if (list.some(s => kind(s) !== kind(list[0]))) return false;
      }
      return cond(op === 'in' ? '$in' : '$nin', list);
    }

    case 'between':
    case 'notbetween': {
      const list = toArray(value);
      if (list.length < 2) return false;
      let [a, b] = [coerceNumber(list[0]), coerceNumber(list[1])];
      if (a === undefined || b === undefined) return false;
      if (!preserveValueOrder && b < a) [a, b] = [b, a];
      if (op === 'notbetween') return { $or: [cond('$lt', a), cond('$gt', b)] };
      // Chroma allows one operator per field object
      return flavor === 'pinecone'
        ? { [field]: { $gte: a, $lte: b } }
        : { $and: [cond('$gte', a), cond('$lte', b)] };
    }

    // Pinecone only (Chroma has no `$exists`; filtered by capabilities above)
    case 'null':
    case 'notnull':
      return cond('$exists', op === 'notnull');
  }

  /* v8 ignore next -- @preserve */
  return false;
};
