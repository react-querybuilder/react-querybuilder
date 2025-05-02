/**
 * Converts a given query object into one of the supported {@link index!ExportFormat ExportFormat} formats.
 *
 * @module formatQuery
 */

import type {
  RuleProcessor,
  ValueProcessorByRule,
  ValueProcessorLegacy,
} from '../../types/index.noReact';
import { defaultRuleProcessorCEL } from './defaultRuleProcessorCEL';
import { defaultRuleProcessorMongoDB } from './defaultRuleProcessorMongoDB';
import { defaultRuleProcessorSpEL } from './defaultRuleProcessorSpEL';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';

const generateValueProcessor =
  (vpbr: ValueProcessorByRule): ValueProcessorLegacy =>
  (field, operator, value, valueSource) =>
    vpbr({ field, operator, value, valueSource }, { parseNumbers: false });
// TODO: Deprecate defaultValueProcessor.
/**
 * Default value processor used by {@link formatQuery} for "sql" format.
 *
 * @group Export
 */
export const defaultValueProcessor: ValueProcessorLegacy = generateValueProcessor(
  defaultValueProcessorByRule
);
/**
 * @deprecated Prefer {@link defaultRuleProcessorMongoDB}.
 *
 * @group Export
 */
export const defaultMongoDBValueProcessor: ValueProcessorLegacy = generateValueProcessor(
  defaultRuleProcessorMongoDB
);
/**
 * @deprecated Prefer {@link defaultRuleProcessorCEL}.
 *
 * @group Export
 */
export const defaultCELValueProcessor: ValueProcessorLegacy =
  generateValueProcessor(defaultRuleProcessorCEL);
/**
 * @deprecated Prefer {@link defaultRuleProcessorSpEL}.
 *
 * @group Export
 */
export const defaultSpELValueProcessor: ValueProcessorLegacy =
  generateValueProcessor(defaultRuleProcessorSpEL);

export * from './defaultRuleGroupProcessorCEL';
export * from './defaultRuleGroupProcessorElasticSearch';
export * from './defaultRuleGroupProcessorJSONata';
export * from './defaultRuleGroupProcessorJsonLogic';
export * from './defaultRuleGroupProcessorLDAP';
export * from './defaultRuleGroupProcessorMongoDB';
export * from './defaultRuleGroupProcessorMongoDBQuery';
export * from './defaultRuleGroupProcessorNL';
export * from './defaultRuleGroupProcessorParameterized';
export * from './defaultRuleGroupProcessorSpEL';
export * from './defaultRuleGroupProcessorSQL';
export * from './defaultRuleProcessorElasticSearch';
export * from './defaultRuleProcessorJSONata';
export * from './defaultRuleProcessorJsonLogic';
export * from './defaultRuleProcessorLDAP';
export * from './defaultRuleProcessorMongoDBQuery';
export * from './defaultRuleProcessorNL';
export * from './defaultRuleProcessorParameterized';
export * from './defaultRuleProcessorSQL';
export * from './defaultValueProcessorNL';
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
