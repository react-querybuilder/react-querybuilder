import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorWeaviate } from '@react-querybuilder/core';
import type { RQBDateTimeLibraryAPI } from './types';
import { isNonDateValueSource, materializeForExport, processIsDateField } from './utils';

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "weaviate" format.
 * Relative values are materialized to concrete ISO 8601 strings, and date fields are routed
 * to RFC 3339 `valueDate` values regardless of `inputType`.
 */
export const getDatetimeRuleProcessorWeaviate =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* v8 ignore start -- @preserve */ {}; /* v8 ignore stop -- @preserve */
    const { context = {} } = opts;

    if (
      isNonDateValueSource(rule.valueSource) ||
      !processIsDateField(context.isDateField, rule, opts)
    ) {
      return defaultRuleProcessorWeaviate(rule, opts);
    }

    const { operator, value } = materializeForExport(apiFns, rule, opts);
    // core emits RFC 3339 `valueDate` by `inputType`; force it for date fields
    const inputType = opts.fieldData?.inputType === 'date' ? 'date' : 'datetime-local';
    return defaultRuleProcessorWeaviate(
      { ...rule, operator, value },
      {
        ...opts,
        fieldData: {
          name: rule.field,
          value: rule.field,
          label: rule.field,
          ...opts.fieldData,
          inputType,
        },
      }
    );
  };
