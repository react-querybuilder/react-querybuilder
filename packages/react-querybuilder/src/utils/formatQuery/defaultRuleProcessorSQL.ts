import type {
  RuleType,
  ValueProcessorByRule,
  ValueProcessorOptions,
} from '../../types/index.noReact';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';
import { mapSQLOperator, quoteFieldNamesWithArray } from './utils';

type DefaultRuleProcessorSqlParams = ValueProcessorOptions & {
  valueProcessor?: ValueProcessorByRule;
  quoteFieldNamesWith?: string | [string, string];
};

/**
 * Default rule processor used by {@link formatQuery} for "sql" format.
 */
export const defaultRuleProcessorSQL = (
  rule: RuleType,
  {
    parseNumbers,
    escapeQuotes,
    quoteFieldNamesWith = ['', ''],
    valueProcessor = defaultValueProcessorByRule,
  }: DefaultRuleProcessorSqlParams = {}
) => {
  const value = valueProcessor(rule, { parseNumbers, escapeQuotes, quoteFieldNamesWith });
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

  const [qFNWpre, qFNWpost] = quoteFieldNamesWithArray(quoteFieldNamesWith);

  return `${qFNWpre}${rule.field}${qFNWpost} ${operator} ${value}`.trim();
};
