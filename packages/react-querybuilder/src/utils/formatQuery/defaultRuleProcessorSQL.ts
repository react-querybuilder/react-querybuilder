import type {
  FormatQueryFinalOptions,
  RuleGroupType,
  RuleProcessor,
} from '../../types/index.noReact';
import { isRuleGroup } from '../isRuleGroup';
import { transformQuery } from '../transformQuery';
import { defaultRuleGroupProcessorSQL } from './defaultRuleGroupProcessorSQL';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';
import { mapSQLOperator, getQuotedFieldName } from './utils';

/**
 * Default operator processor used by {@link formatQuery} for "sql" and "parameterized*" formats.
 *
 * @group Export
 */
export const defaultOperatorProcessorSQL: RuleProcessor = rule =>
  mapSQLOperator(rule.operator).toLowerCase();

/**
 * Default rule processor used by {@link formatQuery} for "sql" format.
 *
 * @group Export
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

  const wrapFieldName = (v: string) =>
    getQuotedFieldName(v, { quoteFieldNamesWith, fieldIdentifierSeparator });

  const ruleField = wrapFieldName(rule.field);

  // We only support PostgreSQL nested arrays
  const { mode, threshold } = rule.match ?? {};

  if (mode) {
    if (opts.preset !== 'postgresql' || !isRuleGroup(rule.value)) return false;

    const matchModeLC = mode?.toLowerCase();

    const matchModeCoerced =
      matchModeLC === 'atleast' && rule.match?.threshold === 1
        ? 'some'
        : matchModeLC === 'atmost' && rule.match?.threshold === 0
          ? 'none'
          : matchModeLC;

    // TODO?: Randomize this alias
    const arrayElementAlias = 'elem_alias';

    const nestedArrayFilter = defaultRuleGroupProcessorSQL(
      transformQuery(rule.value as RuleGroupType, {
        ruleProcessor: r => ({ ...r, field: arrayElementAlias }),
      }),
      opts as FormatQueryFinalOptions
    );

    switch (matchModeCoerced) {
      case 'all':
        return `(select count(*) from unnest(${ruleField}) as ${wrapFieldName(arrayElementAlias)} where ${nestedArrayFilter}) = array_length(${ruleField}, 1)`;

      case 'none':
        return `not exists (select 1 from unnest(${ruleField}) as ${wrapFieldName(arrayElementAlias)} where ${nestedArrayFilter})`;

      case 'some':
        return `exists (select 1 from unnest(${ruleField}) as ${wrapFieldName(arrayElementAlias)} where ${nestedArrayFilter})`;

      case 'atleast':
      case 'atmost':
      case 'exactly': {
        if (typeof threshold !== 'number' || threshold < 0) return '';

        const op =
          matchModeCoerced === 'atleast' ? '>=' : matchModeCoerced === 'atmost' ? '<=' : '=';

        return `(select count(*)${threshold > 0 && threshold < 1 ? ` / array_length(${ruleField}, 1)` : ''} from unnest(${ruleField}) as ${wrapFieldName(arrayElementAlias)} where ${nestedArrayFilter}) ${op} ${threshold}`;
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

  return `${ruleField} ${operator} ${value}`.trim();
};
