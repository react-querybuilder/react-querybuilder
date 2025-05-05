import type {
  DefaultOperatorName,
  ExportOperatorMap,
  FullOption,
  RuleProcessor,
} from '../../types/index.noReact';
import { getOption, toFullOptionList } from '../optGroupUtils';
import { defaultValueProcessorNL } from './defaultValueProcessorNL';
import { getQuotedFieldName, normalizeConstituentWordOrder } from './utils';

/**
 * Default operator map used by {@link formatQuery} for "natural_language" format.
 *
 * @group Export
 */
export const defaultExportOperatorMap: ExportOperatorMap = {
  '=': ['is', 'is the same as the value in'],
  '!=': ['is not', 'is not the same as the value in'],
  '<': ['is less than', 'is less than the value in'],
  '>': ['is greater than', 'is greater than the value in'],
  '<=': ['is less than or equal to', 'is less than or equal to the value in'],
  '>=': ['is greater than or equal to', 'is greater than or equal to the value in'],
  contains: ['contains', 'contains the value in'],
  beginswith: ['starts with', 'starts with the value in'],
  endswith: ['ends with', 'ends with the value in'],
  doesnotcontain: ['does not contain', 'does not contain the value in'],
  doesnotbeginwith: ['does not start with', 'does not start with the value in'],
  doesnotendwith: ['does not end with', 'does not end with the value in'],
  null: 'is null',
  notnull: 'is not null',
  in: ['is one of the values', 'is the same as a value in'],
  notin: ['is not one of the values', 'is not the same as any value in'],
  between: ['is between', 'is between the values in'],
  notbetween: ['is not between', 'is not between the values in'],
};

/* istanbul ignore next */
const defaultGetOperators = () => [];

/**
 * Default operator processor used by {@link formatQuery} for "natural_language" format.
 *
 * @group Export
 */
export const defaultOperatorProcessorNL: RuleProcessor = (
  rule,
  // istanbul ignore next
  opts = {}
) => {
  const { valueSource = 'value' } = rule;
  // istanbul ignore next
  const {
    getOperators = defaultGetOperators,
    operatorMap: operatorMapParam = defaultExportOperatorMap,
  } = opts;

  const mapOperatorMap = new Map<string, string | [string, string]>(
    Object.entries(defaultExportOperatorMap)
  );
  for (const [key, value] of Object.entries(operatorMapParam)) {
    mapOperatorMap.set(key.toLowerCase(), value);
  }
  const operatorMap = Object.fromEntries(mapOperatorMap);

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

  const operatorTL = operatorMap[operator as DefaultOperatorName] ??
    operatorMap[operator.toLowerCase() as Lowercase<DefaultOperatorName>] ?? [label, label];

  return typeof operatorTL === 'string' ? operatorTL : operatorTL[valueSource === 'field' ? 1 : 0];
};

/**
 * Default rule processor used by {@link formatQuery} for "natural_language" format.
 *
 * @group Export
 */
export const defaultRuleProcessorNL: RuleProcessor = (rule, opts) => {
  // istanbul ignore next
  const {
    fieldData,
    quoteFieldNamesWith = ['', ''] as [string, string],
    fieldIdentifierSeparator = '',
    quoteValuesWith = `'`,
    operatorProcessor = defaultOperatorProcessorNL,
    valueProcessor = defaultValueProcessorNL,
    concatOperator = '||',
    wordOrder = 'SVO',
  } = opts ?? /* istanbul ignore next */ {};

  const value = valueProcessor(rule, {
    ...opts,
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

  const wordOrderMap = {
    S: processedField,
    V: processedOperator,
    O: value,
  };

  return normalizeConstituentWordOrder(wordOrder)
    .map(term => `${wordOrderMap[term]}`)
    .join(' ')
    .trim();
};
