import type { DefaultOperatorName } from '@react-querybuilder/ts';
import type { MongoDbSupportedOperators } from './types';

export const getRegExStr = (re: string | RegExp) => (typeof re === 'string' ? re : re.source);

export const isPrimitive = (v: any): v is string | number | boolean =>
  typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';

export const isPojo = (obj: any): obj is Record<string, any> =>
  obj === null || typeof obj !== 'object' ? false : Object.getPrototypeOf(obj) === Object.prototype;

export const mongoDbToRqbOperatorMap: { [o in MongoDbSupportedOperators]?: DefaultOperatorName } = {
  $eq: '=',
  $ne: '!=',
  $gt: '>',
  $gte: '>=',
  $lt: '<',
  $lte: '<=',
};
