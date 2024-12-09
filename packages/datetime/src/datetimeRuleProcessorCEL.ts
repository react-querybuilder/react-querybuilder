import type { RuleProcessor } from 'react-querybuilder';
import { defaultRuleProcessorCEL, toArray } from 'react-querybuilder';
import type { RQBDateTimeLibraryAPI } from './types';
import { processIsDateField } from './utils';

const shouldNegate = (op: string) => /^(does)?not/i.test(op);

export const getDatetimeRuleProcessorCEL =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* istanbul ignore next */ {};
    const { context = {} } = opts;

    if (rule.valueSource === 'field' || !processIsDateField(context.isDateField, rule, opts)) {
      return defaultRuleProcessorCEL(rule, opts);
    }

    const ts = (d: string | Date) => `timestamp("${apiFns.toISOString(d)}")`;

    const operatorTL = rule.operator.replace(/^=$/, '==').toLowerCase();

    switch (operatorTL) {
      case '<':
      case '<=':
      case '==':
      case '!=':
      case '>':
      case '>=':
        return `${rule.field} ${operatorTL} ${ts(rule.value)}`;
    }

    const valueAsArray: string[] = toArray(rule.value, { retainEmptyStrings: false });
    const valueAsDateArray = valueAsArray
      .map(v => apiFns.toDate(v))
      .filter(dateVal => apiFns.isValid(dateVal));

    switch (operatorTL) {
      case 'in':
      case 'notin': {
        if (valueAsDateArray.length === 0) return '';
        const [prefix, suffix] = shouldNegate(operatorTL) ? ['!(', ')'] : ['', ''];
        return `${prefix}${rule.field} in [${valueAsDateArray
          .map(val => ts(val))
          .join(', ')}]${suffix}`;
      }

      case 'between':
      case 'notbetween': {
        if (valueAsDateArray.length < 2) return '';
        const [first, second] = valueAsDateArray;
        const [firstDate, secondDate] = apiFns.isBefore(first, second)
          ? [first, second]
          : [second, first];
        return operatorTL === 'between'
          ? `(${rule.field} >= ${ts(firstDate)} && ${rule.field} <= ${ts(secondDate)})`
          : `(${rule.field} < ${ts(firstDate)} || ${rule.field} > ${ts(secondDate)})`;
      }
    }

    return defaultRuleProcessorCEL(rule, opts);
  };
