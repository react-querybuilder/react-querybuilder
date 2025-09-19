import type {
  DefaultOperatorName,
  ExportOperatorMap,
  FormatQueryFinalOptions,
  FullOption,
  RuleProcessor,
} from '../../types';
import { lc } from '../misc';
import { getOption, toFullOptionList } from '../optGroupUtils';
import { defaultRuleGroupProcessorNL } from './defaultRuleGroupProcessorNL';
import { defaultValueProcessorNL } from './defaultValueProcessorNL';
import { getQuotedFieldName, normalizeConstituentWordOrder, processMatchMode } from './utils';

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
  const { field, operator, valueSource = 'value' } = rule;
  // istanbul ignore next
  const {
    getOperators = defaultGetOperators,
    operatorMap: operatorMapParam = defaultExportOperatorMap,
  } = opts;

  const mapOperatorMap = new Map<string, string | [string, string]>(
    Object.entries(defaultExportOperatorMap)
  );
  for (const [key, value] of Object.entries(operatorMapParam)) {
    mapOperatorMap.set(lc(key), value);
  }
  const operatorMap = Object.fromEntries(mapOperatorMap);

  const { value: operatorNL, label } = getOption(
    toFullOptionList(
      getOperators(field, {
        fieldData: opts.fieldData ?? {
          name: field,
          value: field,
          label: field,
        },
      }) ?? /* istanbul ignore next */ []
    ) as FullOption[],
    operator
  ) ?? {
    name: operator,
    value: operator,
    label: operator,
  };

  const operatorTL = operatorMap[operatorNL as DefaultOperatorName] ??
    operatorMap[lc(operatorNL) as Lowercase<DefaultOperatorName>] ?? [label, label];

  return typeof operatorTL === 'string' ? operatorTL : operatorTL[valueSource === 'field' ? 1 : 0];
};

/**
 * Default rule processor used by {@link formatQuery} for "natural_language" format.
 *
 * @group Export
 */
export const defaultRuleProcessorNL: RuleProcessor = (rule, opts) => {
  const { field, operator } = rule;
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

  const processedField = getQuotedFieldName(fieldData?.label ?? field, {
    quoteFieldNamesWith,
    fieldIdentifierSeparator,
  });

  const matchEval = processMatchMode(rule);

  if (matchEval === false) {
    return '';
  } else if (matchEval) {
    const { mode, threshold } = matchEval;

    const nestedArrayFilter = defaultRuleGroupProcessorNL(rule.value, {
      ...(opts as FormatQueryFinalOptions),
      fields: toFullOptionList(fieldData?.subproperties ?? []),
    });

    // (H)as (S)ub(P)roperties
    const hsp = (fieldData?.subproperties?.length ?? 0) > 0;

    switch (mode) {
      case 'all':
        return `(${hsp ? 'for ' : ''}every item in ${processedField}${hsp ? ',' : ''} ${nestedArrayFilter})`;

      case 'none':
        return `(${hsp ? 'for ' : ''}no item in ${processedField}${hsp ? ',' : ''} ${nestedArrayFilter})`;

      case 'some':
        return `(${hsp ? 'for ' : ''}at least one item in ${processedField}${hsp ? ',' : ''} ${nestedArrayFilter})`;

      case 'atleast':
      case 'atmost':
      case 'exactly': {
        const mm = mode.replace('at', 'at ');
        if (threshold > 0 && threshold < 1) {
          return `(${hsp ? 'for ' : ''}${mm} ${threshold * 100}% of the items in ${processedField}${hsp ? ',' : ''} ${nestedArrayFilter})`;
        }
        return `(${hsp ? 'for ' : ''}${mm} ${threshold} of the items in ${processedField}${hsp ? ',' : ''} ${nestedArrayFilter})`;
      }
    }
  }

  const value = valueProcessor(rule, {
    ...opts,
    quoteFieldNamesWith,
    fieldIdentifierSeparator,
    quoteValuesWith,
    concatOperator,
  });

  const operatorLC = lc(operator);
  if (
    (operatorLC === 'in' ||
      operatorLC === 'notin' ||
      operatorLC === 'between' ||
      operatorLC === 'notbetween') &&
    !value
  ) {
    return '';
  }

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
