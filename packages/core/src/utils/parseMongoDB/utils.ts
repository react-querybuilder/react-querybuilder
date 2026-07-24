import type { DefaultOperatorName } from '../../types';
import { isPojo } from '../misc';
import type { MongoDbSupportedOperators } from './types';

export const getRegExStr = (re: string | RegExp): string =>
  typeof re === 'string' ? re : re.source;

export const isPrimitive = (v: unknown): v is string | number | boolean =>
  typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';

export const mongoDbToRqbOperatorMap: Partial<
  Record<MongoDbSupportedOperators, DefaultOperatorName>
> = {
  $eq: '=',
  $ne: '!=',
  $gt: '>',
  $gte: '>=',
  $lt: '<',
  $lte: '<=',
} satisfies Partial<Record<MongoDbSupportedOperators, DefaultOperatorName>>;

/** Comparison aggregation operators that can carry expression operands, mapped to RQB operators. */
export const mongoDbExprComparisonMap: Record<string, DefaultOperatorName> = {
  $eq: '=',
  $ne: '!=',
  $gt: '>',
  $gte: '>=',
  $lt: '<',
  $lte: '<=',
};

/** Flips a comparison operator (for operand order reversal); non-comparisons pass through. */
export const flipMongoDbOperator = (op: DefaultOperatorName): DefaultOperatorName =>
  op === '<' ? '>' : op === '<=' ? '>=' : op === '>' ? '<' : op === '>=' ? '<=' : op;

/**
 * A MongoDB `$expr` comparison operand that is a candidate expression subtree: an
 * aggregation-operator object (e.g. `{ $multiply: [...] }`). Bare `"$field"` strings and
 * literals are not expression operands. The expr-supplied `getExpression` handler decides
 * whether it maps to a known function.
 */
export const isMongoDBExpressionOperand = (operand: unknown): boolean => isPojo(operand);

/** Reads a MongoDB field-path operand (`"$field"`), returning the field name or `null`. */
export const mongoDbFieldRef = (operand: unknown): string | null =>
  typeof operand === 'string' && operand.startsWith('$') ? operand.slice(1) : null;
