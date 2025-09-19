import type { RuleProcessor } from '../../types';
import { defaultRuleProcessorMongoDBQuery } from './defaultRuleProcessorMongoDBQuery';

/**
 * Default rule processor used by {@link formatQuery} for "mongodb" format.
 *
 * Note that the "mongodb" format is deprecated in favor of the "mongodb_query" format.
 *
 * @group Export
 */
export const defaultRuleProcessorMongoDB: RuleProcessor = (rule, options) => {
  const queryObj = defaultRuleProcessorMongoDBQuery(rule, options);
  return queryObj ? JSON.stringify(queryObj) : '';
};
