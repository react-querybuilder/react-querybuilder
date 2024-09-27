import type { DefaultOperatorName } from '../../types';
import type { MongoDbSupportedOperators } from './types';

export const getRegExStr = (re: string | RegExp): string =>
  typeof re === 'string' ? re : re.source;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPrimitive = (v: any): v is string | number | boolean =>
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
