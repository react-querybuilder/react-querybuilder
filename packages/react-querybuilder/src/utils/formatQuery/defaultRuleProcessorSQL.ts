import type { RuleProcessor } from '../../types/index.noReact';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';
import { mapSQLOperator, quoteFieldNamesWithArray } from './utils';

/**
 * Default rule processor used by {@link formatQuery} for "sql" format.
 */
export const defaultRuleProcessorSQL: RuleProcessor = (rule, opts) => {
  const {
    parseNumbers,
    escapeQuotes,
    quoteFieldNamesWith = ['', ''] as [string, string],
    quoteValuesWith = `'`,
    valueProcessor = defaultValueProcessorByRule,
  } = opts ?? {};
  const value = valueProcessor(rule, {
    parseNumbers,
    escapeQuotes,
    quoteFieldNamesWith,
    quoteValuesWith,
  });
  const operator = mapSQLOperator(rule.operator);

  const operatorLowerCase = operator.toLowerCase();
  if (
    (operatorLowerCase === 'in' ||
      operatorLowerCase === 'not in' ||
      operatorLowerCase === 'between' ||
      operatorLowerCase === 'not between') &&
    !value
  ) {
    return '';
  }

  const [qPre, qPost] = quoteFieldNamesWithArray(quoteFieldNamesWith);

  return `${qPre}${rule.field}${qPost} ${operator} ${value}`.trim();
};
