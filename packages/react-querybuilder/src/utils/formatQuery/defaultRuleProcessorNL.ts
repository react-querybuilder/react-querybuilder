import type { FullOption, RuleProcessor } from '../../types/index.noReact';
import { getOption, toFullOptionList } from '../optGroupUtils';
import { defaultValueProcessorNL } from './defaultValueProcessorNL';
import { getQuotedFieldName } from './utils';

const nlOperatorMap: Record<string, [string, string]> = {
  '=': ['is the same as the value in', 'is'],
  '!=': ['is not the same as the value in', 'is not'],
  '<': ['is less than the value in', 'is less than'],
  '>': ['is greater than the value in', 'is greater than'],
  '<=': ['is less than or equal to the value in', 'is less than or equal to'],
  '>=': ['is greater than or equal to the value in', 'is greater than or equal to'],
  contains: ['contains the value in', 'contains'],
  beginswith: ['starts with the value in', 'starts with'],
  endswith: ['ends with the value in', 'ends with'],
  doesnotcontain: ['does not contain the value in', 'does not contain'],
  doesnotbeginwith: ['does not start with the value in', 'does not start with'],
  doesnotendwith: ['does not end with the value in', 'does not end with'],
  null: ['is null', 'is null'],
  notnull: ['is not null', 'is not null'],
  in: ['is the same as a value in', 'is one of the values'],
  notin: ['is not the same as any value in', 'is not one of the values'],
  between: ['is between the values in', 'is between'],
  notbetween: ['is not between the values in', 'is not between'],
};

export const defaultOperatorProcessorNL: RuleProcessor = (
  rule,
  opts = /* istanbul ignore next */ {}
) => {
  const { valueSource = 'value' } = rule;
  const { getOperators = () => [] } = opts;
  const { value: operator, label } = getOption(
    toFullOptionList(
      getOperators(rule.field, {
        fieldData: opts.fieldData ?? {
          name: rule.field,
          value: rule.field,
          label: rule.field,
        },
      }) ?? /* istanbul ignore next */ []
    ) as FullOption[],
    rule.operator
  ) ?? {
    name: rule.operator,
    value: rule.operator,
    label: rule.operator,
  };

  return (nlOperatorMap[operator.toLowerCase()] ?? [label, label])[valueSource === 'field' ? 0 : 1];
};

/**
 * Default rule processor used by {@link formatQuery} for "natural_language" format.
 */
export const defaultRuleProcessorNL: RuleProcessor = (rule, opts) => {
  // istanbul ignore next
  const {
    fields,
    fieldData,
    parseNumbers,
    escapeQuotes,
    quoteFieldNamesWith = ['', ''] as [string, string],
    fieldIdentifierSeparator = '',
    quoteValuesWith = `'`,
    operatorProcessor = defaultOperatorProcessorNL,
    valueProcessor = defaultValueProcessorNL,
    concatOperator = '||',
  } = opts ?? /* istanbul ignore next */ {};

  const value = valueProcessor(rule, {
    fields,
    parseNumbers,
    escapeQuotes,
    quoteFieldNamesWith,
    fieldIdentifierSeparator,
    quoteValuesWith,
    concatOperator,
  });

  const operatorLC = rule.operator.toLowerCase();
  if (
    (operatorLC === 'in' ||
      operatorLC === 'notin' ||
      operatorLC === 'between' ||
      operatorLC === 'notbetween') &&
    !value
  ) {
    return '';
  }

  const processedField = getQuotedFieldName(fieldData?.label ?? rule.field, {
    quoteFieldNamesWith,
    fieldIdentifierSeparator,
  });

  const processedOperator = operatorProcessor(rule, opts);

  return `${processedField} ${processedOperator} ${value}`.trim();
};
