import type { SetRequired } from 'type-fest';
import type {
  DefaultCombinatorName,
  FormatQueryOptions,
  FullField,
  OptionList,
  RuleGroupTypeAny,
  ValueProcessorByRule,
  ValueProcessorLegacy,
  ValueProcessorOptions,
} from '../../types/index.noReact';
import { joinWith, splitBy, toArray } from '../arrayUtils';
import { getParseNumberMethod } from '../getParseNumberMethod';
import { isRuleGroup } from '../isRuleGroup';
import { numericRegex } from '../misc';
import { getOption } from '../optGroupUtils';
import { parseNumber } from '../parseNumber';

/**
 * Maps a {@link DefaultOperatorName} to a SQL operator.
 */
export const mapSQLOperator = (rqbOperator: string): string => {
  switch (rqbOperator.toLowerCase()) {
    case 'null':
      return 'is null';
    case 'notnull':
      return 'is not null';
    case 'notin':
      return 'not in';
    case 'notbetween':
      return 'not between';
    case 'contains':
    case 'beginswith':
    case 'endswith':
      return 'like';
    case 'doesnotcontain':
    case 'doesnotbeginwith':
    case 'doesnotendwith':
      return 'not like';
    default:
      return rqbOperator;
  }
};

/**
 * Maps a {@link DefaultOperatorName} to a MongoDB operator.
 */
export const mongoOperators = {
  '=': '$eq',
  '!=': '$ne',
  '<': '$lt',
  '<=': '$lte',
  '>': '$gt',
  '>=': '$gte',
  in: '$in',
  notin: '$nin',
  notIn: '$nin', // only here for backwards compatibility
};

/**
 * Maps a {@link DefaultCombinatorName} to a CEL combinator.
 */
export const celCombinatorMap: {
  and: '&&';
  or: '||';
} = {
  and: '&&',
  or: '||',
} satisfies Record<DefaultCombinatorName, '&&' | '||'>;

/**
 * Register these operators with `jsonLogic` before applying the result
 * of `formatQuery(query, 'jsonlogic')`.
 *
 * @example
 * ```
 * for (const [op, func] of Object.entries(jsonLogicAdditionalOperators)) {
 *   jsonLogic.add_operation(op, func);
 * }
 * jsonLogic.apply({ "startsWith": [{ "var": "firstName" }, "Stev"] }, data);
 * ```
 */
export const jsonLogicAdditionalOperators: Record<
  'startsWith' | 'endsWith',
  (a: string, b: string) => boolean
> = {
  startsWith: (a: string, b: string) => typeof a === 'string' && a.startsWith(b),
  endsWith: (a: string, b: string) => typeof a === 'string' && a.endsWith(b),
};

/**
 * Converts all `string`-type `value` properties of a query object into `number` where appropriate.
 *
 * Used by {@link formatQuery} for the `json*` formats when `parseNumbers` is `true`.
 */
export const numerifyValues = (
  rg: RuleGroupTypeAny,
  options: SetRequired<FormatQueryOptions, 'fields'>
): RuleGroupTypeAny => ({
  ...rg,
  // @ts-expect-error TS doesn't keep track of odd/even indexes here
  rules: rg.rules.map(r => {
    if (typeof r === 'string') {
      return r;
    }

    if (isRuleGroup(r)) {
      return numerifyValues(r, options);
    }

    const fieldData = getOption(options.fields as OptionList<FullField>, r.field);
    const parseNumbers = getParseNumberMethod({
      parseNumbers: options.parseNumbers,
      inputType: fieldData?.inputType,
    });

    if (Array.isArray(r.value)) {
      return { ...r, value: r.value.map(v => parseNumber(v, { parseNumbers })) };
    }

    const valAsArray = toArray(r.value, { retainEmptyStrings: true }).map(v =>
      parseNumber(v, { parseNumbers })
    );
    if (valAsArray.every(v => typeof v === 'number')) {
      // istanbul ignore else
      if (valAsArray.length > 1) {
        return { ...r, value: valAsArray };
      } else if (valAsArray.length === 1) {
        return { ...r, value: valAsArray[0] };
      }
    }

    return r;
  }),
});

/**
 * Determines whether a value is _anything_ except an empty `string` or `NaN`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isValidValue = (value: any): boolean =>
  (typeof value === 'string' && value.length > 0) ||
  (typeof value === 'number' && !isNaN(value)) ||
  (typeof value !== 'string' && typeof value !== 'number');

/**
 * Determines whether {@link formatQuery} should render the given value as a number.
 * As long as `parseNumbers` is `true`, `number` and `bigint` values will return `true` and
 * `string` values will return `true` if they test positive against {@link numericRegex}.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const shouldRenderAsNumber = (value: any, parseNumbers?: boolean | undefined): boolean =>
  !!parseNumbers &&
  (typeof value === 'number' ||
    typeof value === 'bigint' ||
    (typeof value === 'string' && numericRegex.test(value)));

/**
 * Used by {@link formatQuery} to determine whether the given value processor is a
 * "legacy" value processor by counting the number of arguments. Legacy value
 * processors take 3 arguments (not counting any arguments with default values), while
 * rule-based value processors take no more than 2 arguments.
 */
export const isValueProcessorLegacy = (
  valueProcessor: ValueProcessorLegacy | ValueProcessorByRule
): valueProcessor is ValueProcessorLegacy => valueProcessor.length >= 3;

/**
 * Converts the `quoteFieldNamesWith` option into an array of two strings.
 * If the option is a string, the array elements are both that string.
 *
 * @default
 * ['', '']
 */
export const getQuoteFieldNamesWithArray = (
  // istanbul ignore next
  quoteFieldNamesWith: null | string | [string, string] = ['', '']
): [string, string] =>
  Array.isArray(quoteFieldNamesWith)
    ? quoteFieldNamesWith
    : typeof quoteFieldNamesWith === 'string'
      ? [quoteFieldNamesWith, quoteFieldNamesWith]
      : (quoteFieldNamesWith ?? ['', '']);

/**
 * Given a field name and relevant {@link ValueProcessorOptions}, returns the field name
 * wrapped in the configured quote character(s).
 */
export const getQuotedFieldName = (
  fieldName: string,
  { quoteFieldNamesWith, fieldIdentifierSeparator }: ValueProcessorOptions
): string => {
  const [qPre, qPost] = getQuoteFieldNamesWithArray(quoteFieldNamesWith);
  return typeof fieldIdentifierSeparator === 'string' && fieldIdentifierSeparator.length > 0
    ? joinWith(
        splitBy(fieldName, fieldIdentifierSeparator).map(part => `${qPre}${part}${qPost}`),
        fieldIdentifierSeparator
      )
    : `${qPre}${fieldName}${qPost}`;
};

/**
 * Simple helper to determine whether a value is null, undefined, or an empty string.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nullOrUndefinedOrEmpty = (value: any): value is null | undefined | '' =>
  value === null || value === undefined || value === '';
