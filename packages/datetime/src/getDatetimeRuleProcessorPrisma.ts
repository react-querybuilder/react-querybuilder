import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorPrisma } from '@react-querybuilder/core';
import type { RQBDateTimeLibraryAPI } from './types';
import { materializeForExport, processIsDateField } from './utils';

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "prisma" format.
 * Relative values are materialized and all date/time values are converted to `Date`
 * objects (Prisma's `where` clauses use native `Date` values for date columns).
 */
export const getDatetimeRuleProcessorPrisma =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* v8 ignore start -- @preserve */ {} /* v8 ignore stop -- @preserve */;
    const { context = {} } = opts;

    if (rule.valueSource === 'field' || !processIsDateField(context.isDateField, rule, opts)) {
      return defaultRuleProcessorPrisma(rule, opts);
    }

    const { operator, value } = materializeForExport(apiFns, rule, opts, true);
    return defaultRuleProcessorPrisma({ ...rule, operator, value }, opts);
  };
