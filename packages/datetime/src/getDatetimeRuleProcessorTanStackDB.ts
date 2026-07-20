import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorTanStackDB } from '@react-querybuilder/core';
import type { RQBDateTimeLibraryAPI } from './types';
import { materializeForExport, processIsDateField } from './utils';

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "tanstack_db" format.
 * Relative values are materialized and all date/time values are converted to `Date`
 * objects (TanStack DB collection filters compare against native `Date` values).
 */
export const getDatetimeRuleProcessorTanStackDB =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* v8 ignore start -- @preserve */ {}; /* v8 ignore stop -- @preserve */
    const { context = {} } = opts;

    if (rule.valueSource === 'field' || !processIsDateField(context.isDateField, rule, opts)) {
      return defaultRuleProcessorTanStackDB(rule, opts);
    }

    const { operator, value } = materializeForExport(apiFns, rule, opts, true);
    return defaultRuleProcessorTanStackDB({ ...rule, operator, value }, opts);
  };
