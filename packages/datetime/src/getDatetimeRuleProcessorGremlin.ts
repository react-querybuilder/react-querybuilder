import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorGremlin } from '@react-querybuilder/core';
import type { RQBDateTimeLibraryAPI } from './types';
import { materializeForExport, processIsDateField } from './utils';

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "gremlin" format.
 * Relative values are materialized to concrete ISO 8601 strings (Gremlin has no symbolic
 * relative form); absolute values pass through.
 */
export const getDatetimeRuleProcessorGremlin =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* v8 ignore start -- @preserve */ {}; /* v8 ignore stop -- @preserve */
    const { context = {} } = opts;

    if (rule.valueSource === 'field' || !processIsDateField(context.isDateField, rule, opts)) {
      return defaultRuleProcessorGremlin(rule, opts);
    }

    const { operator, value } = materializeForExport(apiFns, rule, opts);
    return defaultRuleProcessorGremlin({ ...rule, operator, value }, opts);
  };
