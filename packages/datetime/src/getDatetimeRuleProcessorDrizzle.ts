import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorDrizzle } from '@react-querybuilder/core';
import type { RQBDateTimeLibraryAPI } from './types';
import { materializeForExport, processIsDateField } from './utils';

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "drizzle" format.
 * Relative values are materialized and all date/time values are converted to `Date`
 * objects (Drizzle column operators compare against native `Date` values).
 */
export const getDatetimeRuleProcessorDrizzle =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* v8 ignore start -- @preserve */ {}; /* v8 ignore stop -- @preserve */
    const { context = {} } = opts;

    if (rule.valueSource === 'field' || !processIsDateField(context.isDateField, rule, opts)) {
      return defaultRuleProcessorDrizzle(rule, opts);
    }

    const { operator, value } = materializeForExport(apiFns, rule, opts, true);
    return defaultRuleProcessorDrizzle({ ...rule, operator, value }, opts);
  };
