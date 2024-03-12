import type { ValueProcessorLegacy } from '../../types/index.noReact';
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
 */
export const defaultValueProcessor = generateValueProcessor('default');
/**
 * @deprecated Prefer {@link defaultRuleProcessorMongoDB}.
 */
export const defaultMongoDBValueProcessor = generateValueProcessor('mongodb');
/**
 * @deprecated Prefer {@link defaultRuleProcessorCEL}.
 */
export const defaultCELValueProcessor = generateValueProcessor('cel');
/**
 * @deprecated Prefer {@link defaultRuleProcessorSpEL}.
 */
export const defaultSpELValueProcessor = generateValueProcessor('spel');

export { defaultRuleProcessorElasticSearch } from './defaultRuleProcessorElasticSearch';
export { defaultRuleProcessorJsonLogic } from './defaultRuleProcessorJsonLogic';
export { defaultRuleProcessorParameterized } from './defaultRuleProcessorParameterized';
export { defaultRuleProcessorSQL } from './defaultRuleProcessorSQL';
export * from './formatQuery';
export { jsonLogicAdditionalOperators } from './utils';
export {
  defaultRuleProcessorCEL,
  defaultRuleProcessorMongoDB,
  defaultRuleProcessorSpEL,
  defaultValueProcessorByRule,
};
/**
 * @deprecated Renamed to {@link defaultRuleProcessorCEL}.
 */
export const defaultValueProcessorCELByRule = defaultRuleProcessorCEL;
/**
 * @deprecated Renamed to {@link defaultRuleProcessorMongoDB}.
 */
export const defaultValueProcessorMongoDBByRule = defaultRuleProcessorMongoDB;
/**
 * @deprecated Renamed to {@link defaultRuleProcessorSpEL}.
 */
export const defaultValueProcessorSpELByRule = defaultRuleProcessorSpEL;
