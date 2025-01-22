import type { RuleProcessor } from '../../types/index.noReact';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';
import { mapSQLOperator, getQuotedFieldName } from './utils';

export const defaultOperatorProcessorSQL: RuleProcessor = rule =>
  mapSQLOperator(rule.operator).toLowerCase();

/**
 * Default rule processor used by {@link formatQuery} for "sql" format.
 */
export const defaultRuleProcessorSQL: RuleProcessor = (rule, opts = {}) => {
  const {
    quoteFieldNamesWith = ['', ''] as [string, string],
    fieldIdentifierSeparator = '',
    quoteValuesWith = `'`,
    operatorProcessor = defaultOperatorProcessorSQL,
    valueProcessor = defaultValueProcessorByRule,
    concatOperator = '||',
  } = opts;

  const value = valueProcessor(rule, {
    ...opts,
    quoteFieldNamesWith,
    fieldIdentifierSeparator,
    quoteValuesWith,
    concatOperator,
  });

  const operator = operatorProcessor(rule, opts);

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

  return `${getQuotedFieldName(rule.field, { quoteFieldNamesWith, fieldIdentifierSeparator })} ${operator} ${value}`.trim();
};
