import type {
  ConstituentWordOrder,
  DefaultCombinatorName,
  FormatQueryOptions,
  FullField,
  GroupVariantCondition,
  MatchMode,
  NLTranslationKey,
  NLTranslations,
  OptionList,
  RuleGroupTypeAny,
  RuleType,
  SetRequired,
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
 *
 * @group Export
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
 * Maps a (lowercase) {@link DefaultOperatorName} to a MongoDB operator.
 *
 * @group Export
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
 * Maps a (lowercase) {@link DefaultOperatorName} to a Prisma ORM operator.
 *
 * @group Export
 */
export const prismaOperators = {
  '=': 'equals',
  '!=': 'not',
  '<': 'lt',
  '<=': 'lte',
  '>': 'gt',
  '>=': 'gte',
  in: 'in',
  notin: 'notIn',
};

/**
 * Maps a {@link DefaultCombinatorName} to a CEL combinator.
 *
 * @group Export
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
 *
 * @group Export
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
 *
 * @group Export
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
 *
 * @group Export
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
 *
 * @group Export
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
 *
 * @group Export
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
 *
 * @group Export
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
 *
 * @group Export
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

const defaultWordOrder = ['S', 'V', 'O'];

/**
 * Given a [Constituent word order](https://en.wikipedia.org/wiki/Word_order#Constituent_word_orders)
 * like "svo" or "sov", returns a permutation of `["S", "V", "O"]` based on the first occurrence of
 * each letter in the input string (case insensitive). This widens the valid input from abbreviations
 * like "svo" to more expressive strings like "subject-verb-object" or "sub ver obj". Any missing
 * letters are appended in the default order "SVO" (e.g., "object" would yield `["O", "S", "V"]`).
 *
 * @group Export
 */
export const normalizeConstituentWordOrder = (input: string): ConstituentWordOrder => {
  const result: string[] = [];
  const letterSet = new Set(defaultWordOrder);

  for (const char of input.toUpperCase()) {
    if (letterSet.has(char)) {
      result.push(char);
      letterSet.delete(char);
      if (letterSet.size === 0) break;
    }
  }

  // Add any missing letters in default order
  for (const letter of defaultWordOrder) {
    if (letterSet.has(letter)) {
      result.push(letter);
    }
  }

  return result as ConstituentWordOrder;
};

/**
 * Default translations used by {@link formatQuery} for "natural_language" format.
 *
 * @group Export
 */
// The ones commented below are unnecessary for the default implementation,
// but they can be overridden for customized implementations.
export const defaultNLTranslations: NLTranslations = {
  // and: 'and',
  // or: 'or',
  // true: 'true',
  // false: 'false',
  groupPrefix: '',
  // groupPrefix_not: '',
  groupPrefix_not_xor: 'either zero or more than one of',
  groupPrefix_xor: 'exactly one of',
  groupSuffix: 'is true',
  groupSuffix_not: 'is not true',
  // groupSuffix_not_xor: 'is true',
  // groupSuffix_xor: 'is true',
};

/**
 * Note: This function assumes `conditions.length > 0`
 */
const translationMatchFilter = (
  key: NLTranslationKey,
  keyToTest: string,
  conditions: GroupVariantCondition[]
) =>
  // The translation matches the base key
  keyToTest.startsWith(key) &&
  // The translation specifies all conditions
  conditions.every(
    c =>
      // This translation specifies _this_ condition
      keyToTest.includes(`_${c}`) &&
      // This translation specifies the same _total number_ of conditions
      keyToTest.match(/_/g)?.length === conditions.length
  );

/**
 * Used by {@link formatQuery} to get a translation based on certain conditions
 * for the "natural_language" format.
 *
 * @group Export
 */
export const getNLTranslataion = (
  key: NLTranslationKey,
  translations: NLTranslations,
  conditions: GroupVariantCondition[] = []
): string =>
  conditions.length === 0
    ? (translations[key] ?? defaultNLTranslations[key] ?? /* istanbul ignore next */ '')
    : (Object.entries(translations).find(([keyToTest]) =>
        translationMatchFilter(key, keyToTest, conditions)
      )?.[1] ??
      Object.entries(defaultNLTranslations).find(([keyToTest]) =>
        translationMatchFilter(key, keyToTest, conditions)
      )?.[1] ??
      defaultNLTranslations[key] ??
      /* istanbul ignore next */ '');

type ProcessedMatchMode =
  | { mode: 'all'; threshold?: number | null | undefined }
  | { mode: 'none'; threshold?: number | null | undefined }
  | { mode: 'some'; threshold?: number | null | undefined }
  | { mode: 'atleast'; threshold: number }
  | { mode: 'atmost'; threshold: number }
  | { mode: 'exactly'; threshold: number };

export const processMatchMode = (rule: RuleType): void | false | ProcessedMatchMode => {
  const { mode, threshold } = rule.match ?? {};

  if (mode) {
    if (!isRuleGroup(rule.value)) return false;

    const matchModeLC = mode.toLowerCase() as Lowercase<MatchMode>;

    const matchModeCoerced =
      matchModeLC === 'atleast' && threshold === 1
        ? 'some'
        : matchModeLC === 'atmost' && threshold === 0
          ? 'none'
          : matchModeLC;

    if (
      (matchModeCoerced === 'atleast' ||
        matchModeCoerced === 'atmost' ||
        matchModeCoerced === 'exactly') &&
      (typeof threshold !== 'number' || threshold < 0)
    ) {
      return false;
    }

    return { mode: matchModeCoerced, threshold: threshold! };
  }
};
