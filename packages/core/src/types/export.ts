import type { RulesLogic } from 'json-logic-js';
import type { Except } from 'type-fest';
import type {
  FullField,
  FullOperator,
  InputType,
  ParseNumbersPropConfig,
  ValueSource,
} from './basic';
import type { FlexibleOptionList, FullOptionList } from './options';
import type { DefaultOperatorName, RuleType } from './ruleGroups';
import type { RuleGroupTypeAny } from './ruleGroupsIC';
import type { QueryValidator, RuleValidator, ValidationMap, ValidationResult } from './validation';

/**
 * Available export formats for {@link formatQuery}.
 *
 * @group Export
 */
export type ExportFormat =
  | 'json'
  | 'sql'
  | 'json_without_ids'
  | 'parameterized'
  | 'parameterized_named'
  | 'mongodb'
  | 'mongodb_query'
  | 'cel'
  | 'jsonlogic'
  | 'spel'
  | 'elasticsearch'
  | 'jsonata'
  | 'natural_language'
  | 'ldap'
  | 'drizzle'
  | 'prisma'
  | 'sequelize';

/**
 * Export formats for {@link formatQuery} that produce objects instead of strings.
 *
 * @group Export
 */
export type ExportObjectFormats =
  | 'parameterized'
  | 'parameterized_named'
  | 'jsonlogic'
  | 'elasticsearch'
  | 'jsonata'
  | 'mongodb_query';

/**
 * Available presets for the "sql" export format.
 *
 * @group Export
 */
export type SQLPreset = 'ansi' | 'sqlite' | 'postgresql' | 'mysql' | 'mssql' | 'oracle';

/**
 * A map of operators to strings to be used in the output of {@link formatQuery}. If the
 * result can differ based on the `valueSource`, the key should map to an array where the
 * second element represents the string to be used when `valueSource` is "field". The first
 * element will be used in all other cases.
 *
 * @group Export
 */
export type ExportOperatorMap = Partial<
  Record<Lowercase<DefaultOperatorName> | DefaultOperatorName, string | [string, string]>
>;

/**
 * Options object shape for {@link formatQuery}.
 *
 * @group Export
 */
export interface FormatQueryOptions {
  /**
   * The {@link ExportFormat}.
   */
  format?: ExportFormat;
  /**
   * This function will be used to process the `operator` from each rule
   * for query language formats. If not defined, the appropriate
   * `defaultOperatorProcessor*` for the format will be used.
   */
  operatorProcessor?: RuleProcessor;
  /**
   * This function will be used to process the `value` from each rule
   * for query language formats. If not defined, the appropriate
   * `defaultValueProcessor*` for the format will be used.
   */
  valueProcessor?: ValueProcessorLegacy | ValueProcessorByRule;
  /**
   * This function will be used to process each rule. If not defined, the appropriate
   * `defaultRuleProcessor*` for the given format will be used.
   */
  ruleProcessor?: RuleProcessor;
  /**
   * This function will be used to process each rule group. If not defined, the appropriate
   * `defaultRuleGroupProcessor*` for the format will be used.
   *
   * If this function is defined, it will override the `format` option. This also allows
   * `formatQuery` to produce completely custom output formats.
   */
  ruleGroupProcessor?: RuleGroupProcessor;
  /**
   * In the "sql", "parameterized", "parameterized_named", and "jsonata" export
   * formats, field names will be bracketed by this string. If an array of strings
   * is passed, field names will be preceded by the first element and
   * succeeded by the second element.
   *
   * Tip: Use `fieldIdentifierSeparator` to bracket identifiers individually within field names.
   *
   * @default '' // the empty string
   *
   * @example
   * formatQuery(query, { format: 'sql', quoteFieldNamesWith: '"' })
   * // `"First name" = 'Steve'`
   *
   * @example
   * formatQuery(query, { format: 'sql', quoteFieldNamesWith: ['[', ']'] })
   * // "[First name] = 'Steve'"
   */
  quoteFieldNamesWith?: string | [string, string];
  /**
   * When used in conjunction with the `quoteFieldNamesWith` option, field names will
   * be split by this string, each part being individually processed as per the rules
   * of the `quoteFieldNamesWith` configuration. The parts will then be re-joined
   * by the same string.
   *
   * A common value for this option is `'.'`.
   *
   * A value of `''` (the empty string) will disable splitting/rejoining.
   *
   * @default ''
   *
   * @example
   * formatQuery(query, {
   *   format: 'sql',
   *   quoteFieldNamesWith: ['[', ']'],
   *   fieldIdentifierSeparator: '.',
   * })
   * // "[dbo].[Musicians].[First name] = 'Steve'"
   */
  fieldIdentifierSeparator?: string;
  /**
   * Character to use for quoting string values in the SQL format.
   * @default `'`
   */
  quoteValuesWith?: string;
  /**
   * Validator function for the entire query. Can be the same function passed
   * as `validator` prop to {@link react-querybuilder!QueryBuilder QueryBuilder}.
   */
  validator?: QueryValidator;
  /**
   * This can be the same {@link FullField} array passed to {@link react-querybuilder!QueryBuilder QueryBuilder}, but
   * really all you need to provide is the `name` and `validator` for each field.
   *
   * The full field object from this array, where the field's identifying property
   * matches the rule's `field`, will be passed to the rule processor.
   */
  fields?: FlexibleOptionList<FullField>;
  /**
   * This can be the same `getOperators` function passed to {@link react-querybuilder!QueryBuilder QueryBuilder}.
   *
   * The full operator object from this array, where the operator's identifying property
   * matches the rule's `operator`, will be passed to the rule processor.
   */
  getOperators?(
    field: string,
    misc: { fieldData: FullField }
  ): FlexibleOptionList<FullOperator> | null;
  /**
   * This string will be inserted in place of invalid groups for non-JSON formats.
   * Defaults to `'(1 = 1)'` for "sql"/"parameterized"/"parameterized_named" and
   * `'$and:[{$expr:true}]'` for "mongodb".
   */
  fallbackExpression?: string;
  /**
   * This string will be placed in front of named parameters (aka bind variables)
   * when using the "parameterized_named" export format.
   *
   * @default ":"
   */
  paramPrefix?: string;
  /**
   * Maintains the parameter prefix in the `params` object keys when using the
   * "parameterized_named" export format. Recommended when using SQLite.
   *
   * @default false
   *
   * @example
   * console.log(formatQuery(query, {
   *   format: "parameterized_named",
   *   paramPrefix: "$",
   *   paramsKeepPrefix: true
   * }).params)
   * // { $firstName: "Stev" }
   * // Default (`paramsKeepPrefix` is `false`):
   * // { firstName: "Stev" }
   */
  paramsKeepPrefix?: boolean;
  /**
   * Renders parameter placeholders as a series of sequential numbers
   * instead of '?' like the default. This option will respect the
   * `paramPrefix` option like the 'parameterized_named' format.
   *
   * @default false
   */
  numberedParams?: boolean;
  /**
   * Preserves the order of values for "between" and "notBetween" rules, even if a larger
   * value comes before a smaller value (which will always evaluate to false).
   */
  preserveValueOrder?: boolean;
  /**
   * Renders values as either `number`-types or unquoted strings, as
   * appropriate and when possible. Each `string`-type value is evaluated
   * against {@link numericRegex} to determine if it can be represented as a
   * plain numeric value. If so, `parseFloat` is used to convert it to a number.
   */
  parseNumbers?: ParseNumbersPropConfig;
  /**
   * Any rules where the field is equal to this value will be ignored.
   *
   * @default '~'
   */
  placeholderFieldName?: string;
  /**
   * Any rules where the operator is equal to this value will be ignored.
   *
   * @default '~'
   */
  placeholderOperatorName?: string;
  /**
   * Any rules where the value is equal to this value will be ignored.
   *
   * @default '~'
   */
  placeholderValueName?: string;
  /**
   * Operator to use when concatenating wildcard characters and field names in "sql" format.
   * The ANSI standard is `||`, while SQL Server uses `+`. MySQL does not implement a concatenation
   * operator by default, and therefore requires use of the `CONCAT` function.
   *
   * If `concatOperator` is set to `"CONCAT"` (case-insensitive), the `CONCAT` function will be
   * used. Note that Oracle SQL does not support more than two values in the `CONCAT` function,
   * so this option should not be used in that context. The default setting (`"||"`) is already
   * compatible with Oracle SQL.
   *
   * @default '||'
   */
  concatOperator?: '||' | '+' | 'CONCAT' | (string & {});
  /**
   * Option presets to maximize compatibility with various SQL dialects.
   */
  preset?: SQLPreset;
  /**
   * Map of operators to their translations for the "natural_language" format. If the
   * result can differ based on the `valueSource`, the key should map to an array where the
   * second element represents the string to be used when `valueSource` is "field". The first
   * element will be used in all other cases.
   */
  operatorMap?: ExportOperatorMap;
  /**
   * [Constituent word order](https://en.wikipedia.org/wiki/Word_order#Constituent_word_orders)
   * for the "natural_language" format. Can be abbreviated like "SVO" or spelled out like
   * "subject-verb-object".
   *
   * - Subject = field
   * - Verb = operator
   * - Object = value
   */
  wordOrder?: ConstituentWordOrderString | Lowercase<ConstituentWordOrderString> | ({} & string);
  /**
   * Translatable strings used by the "natural_language" format.
   */
  translations?: Partial<Record<NLTranslationKey, string>>;
  // oxlint-disable-next-line typescript/no-explicit-any
  context?: Record<string, any>;
}

/**
 * Options object for {@link ValueProcessorByRule} functions.
 *
 * @group Export
 */
export interface ValueProcessorOptions extends FormatQueryOptions {
  valueProcessor?: ValueProcessorByRule;
  escapeQuotes?: boolean;
  /**
   * The full field object, if `fields` was provided in the
   * {@link formatQuery} options parameter.
   */
  fieldData?: FullField;
  /**
   * Included for the "parameterized_named" format only. Keys of this object represent
   * field names and values represent the current list of parameter names for that
   * field based on the query rules processed up to that point. Use this list to
   * ensure that parameter names generated by the custom rule processor are unique.
   */
  fieldParamNames?: Record<string, string[]>;
  /**
   * Included for the "parameterized_named" format only. Call this function with a
   * field name to get a unique parameter name, as yet unused during query processing.
   */
  getNextNamedParam?: (field: string) => string;
  /**
   * Additional prefix and suffix characters to wrap the value in. Useful for augmenting
   * the default value processor results with special syntax (e.g., for dates or function
   * calls).
   */
  wrapValueWith?: [string, string];
  /**
   * Parse numbers in the rule value.
   *
   * @default false
   */
  parseNumbers?: boolean;
}

/**
 * Options object curated by {@link formatQuery} and passed to a {@link RuleGroupProcessor}.
 *
 * @group Export
 */
export interface FormatQueryFinalOptions extends Required<
  Except<
    FormatQueryOptions,
    | 'context'
    | 'valueProcessor'
    | 'validator'
    | 'placeholderValueName'
    | 'ruleGroupProcessor'
    | 'parseNumbers'
  >
> {
  fields: FullOptionList<FullField>;
  getParseNumberBoolean: (inputType?: InputType | null) => boolean | undefined;
  parseNumbers?: ParseNumbersPropConfig | undefined;
  placeholderValueName?: string | undefined;
  valueProcessor: ValueProcessorByRule;
  validator?: QueryValidator;
  validateRule: FormatQueryValidateRule;
  validationMap: ValidationMap;
  context?: Record<string, unknown>;
}

/**
 * Function that produces a processed value for a given {@link RuleType}.
 *
 * @group Export
 */
export type ValueProcessorByRule = (rule: RuleType, options?: ValueProcessorOptions) => string;

/**
 * Function that produces a processed value for a given `field`, `operator`, `value`,
 * and `valueSource`.
 *
 * @group Export
 */
export type ValueProcessorLegacy = (
  field: string,
  operator: string,
  // oxlint-disable-next-line typescript/no-explicit-any
  value: any,
  valueSource?: ValueSource
) => string;

/**
 * @group Export
 */
export type ValueProcessor = ValueProcessorLegacy;

/**
 * Function to produce a result that {@link formatQuery} uses when processing a
 * {@link RuleType} object.
 *
 * See the default rule processor for each format to know what type to return.
 * | Format                   | Default rule processor                    |
 * | ------------------------ | ----------------------------------------- |
 * | `sql`                    | {@link defaultRuleProcessorSQL}           |
 * | `parameterized`          | {@link defaultRuleProcessorParameterized} |
 * | `parameterized_named`    | {@link defaultRuleProcessorParameterized} |
 * | `mongodb` _(deprecated)_ | {@link defaultRuleProcessorMongoDB}       |
 * | `mongodb_query`          | {@link defaultRuleProcessorMongoDBQuery}  |
 * | `cel`                    | {@link defaultRuleProcessorCEL}           |
 * | `spel`                   | {@link defaultRuleProcessorSpEL}          |
 * | `jsonlogic`              | {@link defaultRuleProcessorJsonLogic}     |
 * | `elasticsearch`          | {@link defaultRuleProcessorElasticSearch} |
 * | `jsonata`                | {@link defaultRuleProcessorJSONata}       |
 *
 * @group Export
 */
export type RuleProcessor = (
  rule: RuleType,
  options?: ValueProcessorOptions,
  meta?: {
    // oxlint-disable-next-line typescript/no-explicit-any
    processedParams?: Record<string, any> | any[];
    // oxlint-disable-next-line typescript/no-explicit-any
    context?: Record<string, any>;
  }
  // oxlint-disable-next-line typescript/no-explicit-any
) => any;

/**
 * Function to produce a result that {@link formatQuery} uses when processing a
 * {@link RuleGroupType} or {@link RuleGroupTypeIC} object.
 *
 * See the default rule group processor for each format to know what type to return.
 * | Format                   | Default rule group processor                   |
 * | ------------------------ | ---------------------------------------------- |
 * | `sql`                    | {@link defaultRuleGroupProcessorSQL}           |
 * | `parameterized`          | {@link defaultRuleGroupProcessorParameterized} |
 * | `parameterized_named`    | {@link defaultRuleGroupProcessorParameterized} |
 * | `mongodb` _(deprecated)_ | {@link defaultRuleGroupProcessorMongoDB}       |
 * | `mongodb_query`          | {@link defaultRuleGroupProcessorMongoDBQuery}  |
 * | `cel`                    | {@link defaultRuleGroupProcessorCEL}           |
 * | `spel`                   | {@link defaultRuleGroupProcessorSpEL}          |
 * | `jsonlogic`              | {@link defaultRuleGroupProcessorJsonLogic}     |
 * | `elasticsearch`          | {@link defaultRuleGroupProcessorElasticSearch} |
 * | `jsonata`                | {@link defaultRuleGroupProcessorJSONata}       |
 *
 * @group Export
 */
export type RuleGroupProcessor<TResult = unknown> = (
  ruleGroup: RuleGroupTypeAny,
  options: FormatQueryFinalOptions,
  meta?: {
    // oxlint-disable-next-line typescript/no-explicit-any
    processedParams?: Record<string, any> | any[];
    // oxlint-disable-next-line typescript/no-explicit-any
    context?: Record<string, any>;
  }
) => TResult;

/**
 * Rule validator for {@link formatQuery}.
 *
 * @group Export
 */
export type FormatQueryValidateRule = (
  rule: RuleType
) => readonly [boolean | ValidationResult | undefined, RuleValidator | undefined];

/**
 * Object produced by {@link formatQuery} for the `"parameterized"` format.
 *
 * @group Export
 */
export interface ParameterizedSQL {
  /** The SQL `WHERE` clause fragment with `?` placeholders for each value. */
  sql: string;
  /**
   * Parameter values in the same order their respective placeholders
   * appear in the `sql` string.
   */
  // oxlint-disable-next-line typescript/no-explicit-any
  params: any[];
}

/**
 * Object produced by {@link formatQuery} for the `"parameterized_named"` format.
 *
 * @group Export
 */
export interface ParameterizedNamedSQL {
  /** The SQL `WHERE` clause fragment with bind variable placeholders for each value. */
  sql: string;
  /**
   * Map of bind variable names from the `sql` string to the associated values.
   */
  // oxlint-disable-next-line typescript/no-explicit-any
  params: Record<string, any>;
}

/**
 * @group Export
 */
export interface RQBJsonLogicStartsWith {
  startsWith: [RQBJsonLogic, RQBJsonLogic, ...RQBJsonLogic[]];
}
/**
 * @group Export
 */
export interface RQBJsonLogicEndsWith {
  endsWith: [RQBJsonLogic, RQBJsonLogic, ...RQBJsonLogic[]];
}
/**
 * @group Export
 */
export interface RQBJsonLogicVar {
  var: string;
}
/**
 * JsonLogic rule object with additional operators generated by {@link formatQuery}
 * and accepted by {@link parseJsonLogic!parseJsonLogic}.
 *
 * @group Export
 */
export type RQBJsonLogic = RulesLogic<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith>;

/**
 * Constituent word order (as array) for the "natural_language" format.
 *
 * - S (subject) = field
 * - V (verb) = operator
 * - O (object) = value
 *
 * @group Export
 */
export type ConstituentWordOrder =
  | ['S', 'V', 'O']
  | ['S', 'O', 'V']
  | ['O', 'S', 'V']
  | ['O', 'V', 'S']
  | ['V', 'S', 'O']
  | ['V', 'O', 'S'];

/**
 * Constituent word order (as string) for the "natural_language" format.
 *
 * - S (subject) = field
 * - V (verb) = operator
 * - O (object) = value
 *
 * @group Export
 */
export type ConstituentWordOrderString = 'SVO' | 'SOV' | 'OSV' | 'OVS' | 'VSO' | 'VOS';

// Update the number at the end if another condition is added:
type RepeatStrings<S extends string[], Depth extends number[] = []> = Depth['length'] extends 2
  ? ''
  : '' | `_${S[number]}${RepeatStrings<S, [...Depth, 1]>}`;
// Update the array at the end if another condition is added:
type ZeroOrMoreGroupVariants = RepeatStrings<['xor', 'not']>;

/**
 * Rule group condition identifier for the "natural_language" format.
 *
 * @group Export
 */
export type GroupVariantCondition = 'not' | 'xor';

/**
 * Keys for the `translations` config object used by the "natural_language" format.
 *
 * @group Export
 */
export type NLTranslationKey =
  | 'and'
  | 'or'
  | 'true'
  | 'false'
  | `groupPrefix${ZeroOrMoreGroupVariants}`
  | `groupSuffix${ZeroOrMoreGroupVariants}`;

/**
 * `translations` config object for "natural_language" format.
 *
 * @group Export
 */
export type NLTranslations = Partial<Record<NLTranslationKey, string>>;
