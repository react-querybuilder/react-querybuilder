/**
 * Converts a given query object into one of the supported {@link index!ExportFormat ExportFormat} formats.
 *
 * @module formatQuery
 */

import type { RuleProcessor, ValueProcessorLegacy } from '../../types/index.noReact';
import { defaultRuleProcessorCEL } from './defaultRuleProcessorCEL';
import { defaultRuleProcessorMongoDB } from './defaultRuleProcessorMongoDB';
import { defaultRuleProcessorSpEL } from './defaultRuleProcessorSpEL';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';

const internalValueProcessors = {
  default: defaultValueProcessorByRule,
  mongodb: defaultRuleProcessorMongoDB,
  cel: defaultRuleProcessorCEL,
  spel: defaultRuleProcessorSpEL,
} as const;

const generateValueProcessor =
  (format: 'default' | 'mongodb' | 'cel' | 'spel'): ValueProcessorLegacy =>
  (field, operator, value, valueSource) =>
    internalValueProcessors[format](
      { field, operator, value, valueSource },
      { parseNumbers: false }
    );
// TODO: Deprecate defaultValueProcessor.
/**
 * Default value processor used by {@link formatQuery} for "sql" format.
 *
 * @group Export
 */
export const defaultValueProcessor: ValueProcessorLegacy = generateValueProcessor('default');
/**
 * @deprecated Prefer {@link defaultRuleProcessorMongoDB}.
 *
 * @group Export
 */
export const defaultMongoDBValueProcessor: ValueProcessorLegacy = generateValueProcessor('mongodb');
/**
 * @deprecated Prefer {@link defaultRuleProcessorCEL}.
 *
 * @group Export
 */
export const defaultCELValueProcessor: ValueProcessorLegacy = generateValueProcessor('cel');
/**
 * @deprecated Prefer {@link defaultRuleProcessorSpEL}.
 *
 * @group Export
 */
export const defaultSpELValueProcessor: ValueProcessorLegacy = generateValueProcessor('spel');

export { defaultRuleProcessorElasticSearch } from './defaultRuleProcessorElasticSearch';
export { defaultRuleProcessorJSONata } from './defaultRuleProcessorJSONata';
export { defaultRuleProcessorJsonLogic } from './defaultRuleProcessorJsonLogic';
export { defaultRuleProcessorParameterized } from './defaultRuleProcessorParameterized';
export { defaultRuleProcessorMongoDBQuery } from './defaultRuleProcessorMongoDBQuery';
export { defaultRuleProcessorSQL } from './defaultRuleProcessorSQL';
export * from './formatQuery';
export * from './utils';
export {
  defaultRuleProcessorCEL,
  defaultRuleProcessorMongoDB,
  defaultRuleProcessorSpEL,
  defaultValueProcessorByRule,
};
/**
 * @deprecated Renamed to {@link defaultRuleProcessorCEL}.
 *
 * @group Export
 */
export const defaultValueProcessorCELByRule: RuleProcessor = defaultRuleProcessorCEL;
/**
 * @deprecated Renamed to {@link defaultRuleProcessorMongoDB}.
 *
 * @group Export
 */
export const defaultValueProcessorMongoDBByRule: RuleProcessor = defaultRuleProcessorMongoDB;
/**
 * @deprecated Renamed to {@link defaultRuleProcessorSpEL}.
 *
 * @group Export
 */
export const defaultValueProcessorSpELByRule: RuleProcessor = defaultRuleProcessorSpEL;
