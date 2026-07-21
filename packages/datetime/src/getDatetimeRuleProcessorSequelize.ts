import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorSequelize } from '@react-querybuilder/core';
import type { RQBDateTimeLibraryAPI } from './types';
import { materializeForExport, processIsDateField } from './utils';

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "sequelize" format.
 * Relative values are materialized and all date/time values are converted to `Date`
 * objects (Sequelize `where` clauses use native `Date` values for date columns).
 */
export const getDatetimeRuleProcessorSequelize =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* v8 ignore start -- @preserve */ {}; /* v8 ignore stop -- @preserve */
    const { context = {} } = opts;

    if (rule.valueSource === 'field' || !processIsDateField(context.isDateField, rule, opts)) {
      return defaultRuleProcessorSequelize(rule, opts);
    }

    const { operator, value } = materializeForExport(apiFns, rule, opts, true);
    return defaultRuleProcessorSequelize({ ...rule, operator, value }, opts);
  };
