import type { FullOption, RuleProcessor, ValueSource } from '../../types/index.noReact';
import { getOption } from '../optGroupUtils';
import { toFullOptionList } from '../toFullOption';
import { defaultValueProcessorNL } from './defaultValueProcessorNL';
import { quoteFieldName } from './utils';

const nlOperator = (operator: FullOption, valueSource: ValueSource = 'value') => {
  switch (operator.value.toLowerCase()) {
    case '=':
      return valueSource === 'field' ? 'is the same as the value in' : 'is';
    case '!=':
      return valueSource === 'field' ? 'is not the same as the value in' : 'is not';
    case '<':
      return valueSource === 'field' ? 'is less than the value in' : 'is less than';
    case '>':
      return valueSource === 'field' ? 'is greater than the value in' : 'is greater than';
    case '<=':
      return valueSource === 'field'
        ? 'is less than or equal to the value in'
        : 'is less than or equal to';
    case '>=':
      return valueSource === 'field'
        ? 'is greater than or equal to the value in'
        : 'is greater than or equal to';
    case 'contains':
      return valueSource === 'field' ? 'contains the value in' : 'contains';
    case 'beginswith':
      return valueSource === 'field' ? 'starts with the value in' : 'starts with';
    case 'endswith':
      return valueSource === 'field' ? 'ends with the value in' : 'ends with';
    case 'doesnotcontain':
      return valueSource === 'field' ? 'does not contain the value in' : 'does not contain';
    case 'doesnotbeginwith':
      return valueSource === 'field' ? 'does not start with the value in' : 'does not start with';
    case 'doesnotendwith':
      return valueSource === 'field' ? 'does not end with the value in' : 'does not end with';
    case 'null':
      return 'is null';
    case 'notnull':
      return 'is not null';
    case 'in':
      return valueSource === 'field' ? 'is the same as a value in' : 'is one of the values';
    case 'notin':
      return valueSource === 'field'
        ? 'is not the same as any value in'
        : 'is not one of the values';
    case 'between':
      return valueSource === 'field' ? 'is between the values in' : 'is between';
    case 'notbetween':
      return valueSource === 'field' ? 'is not between the values in' : 'is not between';
    default:
      return operator.label;
  }
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
    valueProcessor = defaultValueProcessorNL,
    concatOperator = '||',
    getOperators = () => [],
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

  const processedField = quoteFieldName(fieldData?.label ?? rule.field, {
    quoteFieldNamesWith,
    fieldIdentifierSeparator,
  });

  const processedOperator = nlOperator(
    getOption(
      toFullOptionList(
        getOperators(rule.field, {
          fieldData: fieldData ?? {
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
    },
    rule.valueSource
  );

  return `${processedField} ${processedOperator} ${value}`.trim();
};
