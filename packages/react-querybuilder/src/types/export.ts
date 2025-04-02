import type { RulesLogic } from 'json-logic-js';
import type { FullField, FullOperator, ParseNumbersPropConfig, ValueSource } from './basic';
import type { FlexibleOptionList } from './options';
import type { RuleType } from './ruleGroups';
import type { QueryValidator } from './validation';

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
  | 'natural_language';

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
   * This function will be used to process each rule for query language
   * formats. If not defined, the appropriate `defaultRuleProcessor*`
   * for the format will be used.
   */
  ruleProcessor?: RuleProcessor;
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
   * as `validator` prop to {@link QueryBuilder}.
   */
  validator?: QueryValidator;
  /**
   * This can be the same {@link FullField} array passed to {@link QueryBuilder}, but
   * really all you need to provide is the `name` and `validator` for each field.
   *
   * The full field object from this array, where the field's identifying property
   * matches the rule's `field`, will be passed to the rule processor.
   */
  fields?: FlexibleOptionList<FullField>;
  /**
   * This can be the same `getOperators` function passed to {@link QueryBuilder}.
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * | `jsonata`                | {@link defaultRuleProcessorJSONata} |
 *
 * @group Export
 */
export type RuleProcessor = (
  rule: RuleType,
  options?: ValueProcessorOptions,
  meta?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processedParams?: Record<string, any> | any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: Record<string, any>;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export type ConstituentWordOrder =
  | ['S', 'V', 'O']
  | ['S', 'O', 'V']
  | ['O', 'S', 'V']
  | ['O', 'V', 'S']
  | ['V', 'S', 'O']
  | ['V', 'O', 'S'];

export type ConstituentWordOrderString = 'SVO' | 'SOV' | 'OSV' | 'OVS' | 'VSO' | 'VOS';

// Update the number after `Depth['length'] extends` if/when another condition is added:
type RepeatStrings<S extends string[], Depth extends number[] = []> = Depth['length'] extends 2
  ? ''
  : '' | `_${S[number]}${RepeatStrings<S, [...Depth, 1]>}`;
type ZeroOrMoreGroupVariants = RepeatStrings<['xor', 'not']>;

export type GroupVariantCondition = 'not' | 'xor';
export type NLTranslationKey =
  | 'and'
  | 'or'
  | 'true'
  | 'false'
  | `groupPrefix${ZeroOrMoreGroupVariants}`
  | `groupSuffix${ZeroOrMoreGroupVariants}`;

export type NLTranslations = Partial<Record<NLTranslationKey, string>>;
