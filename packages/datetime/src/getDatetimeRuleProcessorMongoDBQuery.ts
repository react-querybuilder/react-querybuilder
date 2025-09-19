import type { RuleProcessor } from 'react-querybuilder';
import { defaultRuleProcessorMongoDBQuery, mongoOperators, toArray } from 'react-querybuilder';
import type { RQBDateTimeLibraryAPI } from './types';
import { processIsDateField } from './utils';

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "mongodb_query" format.
 */
export const getDatetimeRuleProcessorMongoDBQuery =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* istanbul ignore next */ {};
    const { field, operator, value, valueSource } = rule;

    if (valueSource === 'field' || !processIsDateField(opts.context?.isDateField, rule, opts)) {
      return defaultRuleProcessorMongoDBQuery(rule, opts);
    }

    if (operator === '=') {
      return { [field]: apiFns.toDate(value) };
    }

    switch (operator) {
      case '<':
      case '<=':
      case '!=':
      case '>':
      case '>=':
        return { [field]: { [mongoOperators[operator]]: apiFns.toDate(value) } };
    }

    const valueAsArray: string[] = toArray(rule.value, { retainEmptyStrings: false });
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
