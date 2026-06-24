import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorMongoDBQuery, mongoOperators, toArray } from '@react-querybuilder/core';
import type { RQBDateTimeLibraryAPI } from './types';
import { materializeRelativeValues, processIsDateField, resolveDatetimeOperator } from './utils';

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "mongodb_query" format.
 */
export const getDatetimeRuleProcessorMongoDBQuery =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* v8 ignore start -- @preserve */ {} /* v8 ignore stop -- @preserve */;
    const { field, valueSource } = rule;
    const operator = resolveDatetimeOperator(rule, opts);

    if (valueSource === 'field' || !processIsDateField(opts.context?.isDateField, rule, opts)) {
      return defaultRuleProcessorMongoDBQuery(rule, opts);
    }

    // Resolve any relative value(s) to concrete literals (MongoDB queries use concrete dates).
    const value = materializeRelativeValues(apiFns, rule.value, opts);

    if (operator === '=') {
      return { [field]: apiFns.toDate(value as string | Date) };
    }

    switch (operator) {
      case '<':
      case '<=':
      case '!=':
      case '>':
      case '>=':
        return { [field]: { [mongoOperators[operator]]: apiFns.toDate(value as string | Date) } };
    }

    const valueAsArray: string[] = toArray(value, { retainEmptyStrings: false });
    const valueAsDateArray = valueAsArray
      .map(v => apiFns.toDate(v))
      .filter(dateVal => apiFns.isValid(dateVal));

    switch (operator) {
      case 'in':
      case 'notIn':
        return { [field]: { [mongoOperators[operator]]: valueAsDateArray } };

      case 'between':
      case 'notBetween': {
        if (valueAsDateArray.length < 2) return '';
        const [first, second] = valueAsDateArray;
        const orderedArray = apiFns.isBefore(first, second) ? [first, second] : [second, first];
        return operator === 'between'
          ? { [field]: { $gte: orderedArray[0], $lte: orderedArray[1] } }
          : {
              $or: [{ [field]: { $lt: orderedArray[0] } }, { [field]: { $gt: orderedArray[1] } }],
            };
      }
    }

    return defaultRuleProcessorMongoDBQuery(rule, opts);
  };
