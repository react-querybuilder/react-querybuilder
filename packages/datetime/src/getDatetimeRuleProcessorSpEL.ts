import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorSpEL } from '@react-querybuilder/core';
import type { RQBDateTimeLibraryAPI } from './types';
import { isNonDateValueSource, materializeForExport, processIsDateField } from './utils';

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "spel" format.
 * Relative values are materialized to concrete ISO 8601 strings (SpEL has no symbolic
 * relative form); absolute values pass through.
 */
export const getDatetimeRuleProcessorSpEL =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* v8 ignore start -- @preserve */ {}; /* v8 ignore stop -- @preserve */
    const { context = {} } = opts;

    if (
      isNonDateValueSource(rule.valueSource) ||
      !processIsDateField(context.isDateField, rule, opts)
    ) {
      return defaultRuleProcessorSpEL(rule, opts);
    }

    const { operator, value } = materializeForExport(apiFns, rule, opts);
    return defaultRuleProcessorSpEL({ ...rule, operator, value }, opts);
  };
