/**
 * Converts a MongoDB query object or parseable string into a
 * {@link index!DefaultRuleGroupType DefaultRuleGroupType} or {@link index!DefaultRuleGroupTypeIC DefaultRuleGroupTypeIC}.
 *
 * @module parseMongoDB
 */

export * from './parseMongoDB';
export * from './types';
export { isMongoDBExpressionOperand, mongoDbFieldRef } from './utils';
