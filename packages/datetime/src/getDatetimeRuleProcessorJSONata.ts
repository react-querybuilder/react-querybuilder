import type { RuleProcessor } from '@react-querybuilder/core';
import {
  defaultRuleProcessorJSONata,
  getQuotedFieldName,
  nullOrUndefinedOrEmpty,
  toArray,
} from '@react-querybuilder/core';
import type { RQBDateTimeLibraryAPI } from './types';
import { materializeRelativeValues, processIsDateField, resolveDatetimeOperator } from './utils';

const shouldNegate = (op: string) => /^(does)?not/i.test(op);

const negate = (clause: string, neg: boolean) => (neg ? `$not(${clause})` : `${clause}`);

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "jsonata" format.
 */
export const getDatetimeRuleProcessorJSONata =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* v8 ignore start -- @preserve */ {} /* v8 ignore stop -- @preserve */;
    const { context = {} } = opts;

    // v8 ignore next
    const { quoteFieldNamesWith = ['', ''] as [string, string], fieldIdentifierSeparator = '' } =
      opts;
    const { field, valueSource } = rule;
    const operator = resolveDatetimeOperator(rule, opts);

    if (!processIsDateField(context.isDateField, rule, opts)) {
      return defaultRuleProcessorJSONata(rule, opts);
    }

    const valueIsField = valueSource === 'field';

    // Resolve any relative value(s) to concrete literals (JSONata has no symbolic relative form).
    // Field-source values are field names and pass through untouched.
    const value = valueIsField ? rule.value : materializeRelativeValues(apiFns, rule.value, opts);

    const fldToMs = (f: string) =>
      `$toMillis(${getQuotedFieldName(f, { quoteFieldNamesWith, fieldIdentifierSeparator })})`;
    const valToMs = (v: string | Date) => `$toMillis("${apiFns.toISOString(v)}")`;

    switch (operator) {
      case '<':
      case '<=':
      case '=':
      case '!=':
      case '>':
      case '>=':
        return `${fldToMs(field)} ${operator} ${valueIsField ? fldToMs(value as string) : valToMs(value as string | Date)}`;
    }

    const valueAsArray: string[] = toArray(value, { retainEmptyStrings: false });
    const valueAsDateArray = valueAsArray
      .map(v => apiFns.toDate(v))
      .filter(dateVal => apiFns.isValid(dateVal));

    switch (operator) {
      case 'in':
      case 'notIn': {
        if (valueIsField) {
          if (valueAsArray.length === 0) return '';
          return negate(
            `${fldToMs(field)} in [${valueAsArray.map(val => fldToMs(val)).join(', ')}]`,
            shouldNegate(operator)
          );
        }
        if (valueAsDateArray.length === 0) return '';
        return negate(
          `${fldToMs(field)} in [${valueAsDateArray.map(val => valToMs(val)).join(', ')}]`,
          shouldNegate(operator)
        );
      }

      case 'between':
      case 'notBetween': {
        if (
          valueAsArray.length < 2 ||
          nullOrUndefinedOrEmpty(valueAsArray[0]) ||
          nullOrUndefinedOrEmpty(valueAsArray[1]) ||
          (!valueIsField && valueAsDateArray.length < 2)
        ) {
          return '';
        }

        if (valueIsField) {
          const [firstValue, secondValue] = valueAsArray;
          const expression = `${fldToMs(field)} >= ${fldToMs(firstValue)} and ${fldToMs(field)} <= ${fldToMs(secondValue)}`;
          return operator === 'between' ? `(${expression})` : negate(expression, true);
        }

        const [first, second] = valueAsDateArray;
        const [firstDate, secondDate] = apiFns.isBefore(first, second)
          ? [first, second]
          : [second, first];
        const expression = `${fldToMs(field)} >= ${valToMs(firstDate)} and ${fldToMs(field)} <= ${valToMs(secondDate)}`;
        return operator === 'between' ? `(${expression})` : negate(expression, true);
      }
    }

    return defaultRuleProcessorJSONata(rule, opts);
  };
