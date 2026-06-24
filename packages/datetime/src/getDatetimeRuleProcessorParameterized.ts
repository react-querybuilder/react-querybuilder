import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorParameterized } from '@react-querybuilder/core';
import type { RQBDateTimeLibraryAPI } from './types';
import { materializeForExport, processIsDateField } from './utils';

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "parameterized" and
 * "parameterized_named" formats. Relative values are materialized to concrete ISO 8601
 * strings (these formats have no symbolic relative form); absolute values pass through.
 */
export const getDatetimeRuleProcessorParameterized =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options, meta) => {
    const opts = options ?? /* v8 ignore start -- @preserve */ {} /* v8 ignore stop -- @preserve */;
    const { context = {} } = opts;

    if (rule.valueSource === 'field' || !processIsDateField(context.isDateField, rule, opts)) {
      return defaultRuleProcessorParameterized(rule, opts, meta);
    }

    const { operator, value } = materializeForExport(apiFns, rule, opts);
    return defaultRuleProcessorParameterized({ ...rule, operator, value }, opts, meta);
  };
