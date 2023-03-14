import type { RuleType, ValueProcessorByRule, ValueProcessorOptions } from '@react-querybuilder/ts';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';
import { mapSQLOperator } from './utils';

type DefaultRuleProcessorSqlParams = ValueProcessorOptions & {
  valueProcessor?: ValueProcessorByRule;
  quoteFieldNamesWith?: string | [string, string];
};

export const defaultRuleProcessorSQL = (
  rule: RuleType,
  {
    parseNumbers,
    escapeQuotes,
    quoteFieldNamesWith = ['', ''],
    valueProcessor = defaultValueProcessorByRule,
  }: DefaultRuleProcessorSqlParams = {}
) => {
  const value = valueProcessor(rule, { parseNumbers, escapeQuotes });
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

  // Ignore this in tests because formatQuery only ever sends an array
  // istanbul ignore next
  const [qFNWpre, qFNWpost] = Array.isArray(quoteFieldNamesWith)
    ? quoteFieldNamesWith
    : typeof quoteFieldNamesWith === 'string'
    ? [quoteFieldNamesWith, quoteFieldNamesWith]
    : quoteFieldNamesWith;

  return `${qFNWpre}${rule.field}${qFNWpost} ${operator} ${value}`.trim();
};
