import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorLDAP } from '@react-querybuilder/core';
import type { RQBDateTimeLibraryAPI } from './types';
import { materializeForExport, processIsDateField } from './utils';

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "ldap" format.
 * Relative values are materialized to concrete ISO 8601 strings (LDAP has no symbolic
 * relative form); absolute values pass through.
 */
export const getDatetimeRuleProcessorLDAP =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* v8 ignore start -- @preserve */ {} /* v8 ignore stop -- @preserve */;
    const { context = {} } = opts;

    if (rule.valueSource === 'field' || !processIsDateField(context.isDateField, rule, opts)) {
      return defaultRuleProcessorLDAP(rule, opts);
    }

    const { operator, value } = materializeForExport(apiFns, rule, opts);
    return defaultRuleProcessorLDAP({ ...rule, operator, value }, opts);
  };
