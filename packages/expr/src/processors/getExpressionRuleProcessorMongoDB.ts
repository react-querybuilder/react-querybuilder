import type { RuleProcessor } from '@react-querybuilder/core';
import type { MongoAggSerializerRegistry } from '../types';
import { getExpressionRuleProcessorMongoDBQuery } from './getExpressionRuleProcessorMongoDBQuery';

/**
 * Generates a rule processor with expression support for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the (deprecated) "mongodb"
 * format. Wraps {@link getExpressionRuleProcessorMongoDBQuery}, JSON-stringifying its output.
 */
export const getExpressionRuleProcessorMongoDB =
  (serializers?: MongoAggSerializerRegistry): RuleProcessor =>
  (rule, options) => {
    const queryObj = getExpressionRuleProcessorMongoDBQuery(serializers)(rule, options);
    return queryObj && typeof queryObj === 'object' ? JSON.stringify(queryObj) : queryObj;
  };
