import type { RuleProcessor } from 'react-querybuilder';
import { getDatetimeRuleProcessorMongoDBQuery } from './getDatetimeRuleProcessorMongoDBQuery';
import type { RQBDateTimeLibraryAPI } from './types';

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the (deprecated) "mongodb"
 * format. Delegates to the "mongodb_query" date/time processor and serializes the result;
 * `Date` values serialize to ISO 8601 strings.
 */
export const getDatetimeRuleProcessorMongoDB = (apiFns: RQBDateTimeLibraryAPI): RuleProcessor => {
  const mongoDBQueryProcessor = getDatetimeRuleProcessorMongoDBQuery(apiFns);
  return (rule, options) => {
    const queryObj = mongoDBQueryProcessor(rule, options);
    return queryObj ? JSON.stringify(queryObj) : '';
  };
};
