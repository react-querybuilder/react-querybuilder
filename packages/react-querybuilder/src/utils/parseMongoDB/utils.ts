import type { DefaultOperatorName } from '../../types';
import type { MongoDbSupportedOperators } from './types';

export const getRegExStr = (re: string | RegExp) => (typeof re === 'string' ? re : re.source);

export const isPrimitive = (v: any): v is string | number | boolean =>
  typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';

export const mongoDbToRqbOperatorMap = {
  $eq: '=',
  $ne: '!=',
  $gt: '>',
  $gte: '>=',
  $lt: '<',
  $lte: '<=',
} satisfies { [o in MongoDbSupportedOperators]?: DefaultOperatorName };
