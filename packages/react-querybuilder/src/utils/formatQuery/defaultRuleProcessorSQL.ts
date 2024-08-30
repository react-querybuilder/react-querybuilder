import type { RuleProcessor } from '../../types/index.noReact';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';
import { mapSQLOperator, quoteFieldName } from './utils';

/**
 * Default rule processor used by {@link formatQuery} for "sql" format.
 */
export const defaultRuleProcessorSQL: RuleProcessor = (rule, opts) => {
  const {
    parseNumbers,
    escapeQuotes,
    quoteFieldNamesWith = ['', ''] as [string, string],
    fieldIdentifierSeparator = '',
    quoteValuesWith = `'`,
    valueProcessor = defaultValueProcessorByRule,
    concatOperator = '||',
  } = opts ?? {};
  const value = valueProcessor(rule, {
    parseNumbers,
    escapeQuotes,
    quoteFieldNamesWith,
    fieldIdentifierSeparator,
    quoteValuesWith,
    concatOperator,
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

  return `${quoteFieldName(rule.field, { quoteFieldNamesWith, fieldIdentifierSeparator })} ${operator} ${value}`.trim();
};
