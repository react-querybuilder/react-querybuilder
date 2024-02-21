import type { FullField, ValueSource, ValueSources } from './basic';
import type { RulesLogic } from './json-logic-js';
import type { FlexibleOptionList, OptionList } from './options';
import type { RuleGroupType, RuleType } from './ruleGroups';
import type { RuleGroupTypeAny } from './ruleGroupsIC';
import type { QueryValidator } from './validation';

/**
 * Available export formats for {@link formatQuery}.
 */
export type ExportFormat =
  | 'json'
  | 'sql'
  | 'json_without_ids'
  | 'parameterized'
  | 'parameterized_named'
  | 'mongodb'
  | 'cel'
  | 'jsonlogic'
  | 'spel'
  | 'elasticsearch';

/**
 * Options object shape for {@link formatQuery}.
 */
export interface FormatQueryOptions {
  /**
   * The {@link ExportFormat}.
   */
  format?: ExportFormat;
  /**
   * This function will be used to process the `value` from each rule
   * for query language formats. If not defined, the appropriate
   * `defaultValueProcessor` for the format will be used.
   */
  valueProcessor?: ValueProcessorLegacy | ValueProcessorByRule;
  /**
   * This function will be used to process each rule for query language
   * formats. If not defined, the appropriate `defaultRuleProcessor`
   * for the format will be used.
   */
  ruleProcessor?: RuleProcessor;
  /**
   * In the "sql"/"parameterized"/"parameterized_named" export formats,
   * field names will be bracketed by this string. If an array of strings
   * is passed, field names will be preceded by the first element and
   * succeeded by the second element. A common value for this option is
   * the backtick (```'`'```).
   *
   * @default '' // the empty string
   *
   * @example
   * formatQuery(query, { format: 'sql', quoteFieldNamesWith: '`' })
   * // "`First name` = 'Steve'"
   *
   * @example
   * formatQuery(query, { format: 'sql', quoteFieldNamesWith: ['[', ']'] })
   * // "[First name] = 'Steve'"
   */
  quoteFieldNamesWith?: string | [string, string];
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
   * Renders values as either `number`-types or unquoted strings, as
   * appropriate and when possible. Each `string`-type value is evaluated
   * against {@link numericRegex} to determine if it can be represented as a
   * plain numeric value. If so, `parseFloat` is used to convert it to a number.
   */
  parseNumbers?: boolean;
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
}

/**
 * Options object for {@link ValueProcessorByRule} functions.
 */
export interface ValueProcessorOptions
  extends Pick<FormatQueryOptions, 'parseNumbers' | 'quoteFieldNamesWith'> {
  escapeQuotes?: boolean;
  /**
   * The full field object, if `fields` was provided in the
   * {@link formatQuery} options parameter.
   */
  fieldData?: FullField;
}

/**
 * Function that produces a processed value for a given {@link RuleType}.
 */
export type ValueProcessorByRule = (rule: RuleType, options?: ValueProcessorOptions) => string;

/**
 * Function that produces a processed value for a given `field`, `operator`, `value`,
 * and `valueSource`.
 */
export type ValueProcessorLegacy = (
  field: string,
  operator: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  valueSource?: ValueSource
) => string;

export type ValueProcessor = ValueProcessorLegacy;

/**
 * Function to produce a result that {@link formatQuery} uses when processing a
 * {@link RuleType} object.
 */
// TODO: narrow the return type based on options.format? (must add format to options first)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RuleProcessor = (rule: RuleType, options?: ValueProcessorOptions) => any;

/**
 * Object produced by {@link formatQuery} for the `"parameterized"` format.
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

export interface RQBJsonLogicStartsWith {
  startsWith: [RQBJsonLogic, RQBJsonLogic, ...RQBJsonLogic[]];
}
export interface RQBJsonLogicEndsWith {
  endsWith: [RQBJsonLogic, RQBJsonLogic, ...RQBJsonLogic[]];
}
export interface RQBJsonLogicVar {
  var: string;
}
/**
 * JsonLogic rule object with additional operators generated by {@link formatQuery}
 * and accepted by {@link parseJsonLogic}.
 */
export type RQBJsonLogic = RulesLogic<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith>;

/**
 * Options common to all parsers.
 */
interface ParserCommonOptions {
  fields?: OptionList<FullField> | Record<string, FullField>;
  getValueSources?: (field: string, operator: string) => ValueSources;
  listsAsArrays?: boolean;
  independentCombinators?: boolean;
}

/**
 * Options object for {@link parseSQL}.
 */
export interface ParseSQLOptions extends ParserCommonOptions {
  paramPrefix?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any[] | Record<string, any>;
}

/**
 * Options object for {@link parseCEL}.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ParseCELOptions extends ParserCommonOptions {}

/**
 * Options object for {@link parseJsonLogic}.
 */
export interface ParseJsonLogicOptions extends ParserCommonOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonLogicOperations?: Record<string, (value: any) => RuleType | RuleGroupTypeAny>;
}

/**
 * Options object for {@link parseMongoDB}.
 */
export interface ParseMongoDbOptions extends ParserCommonOptions {
  /**
   * When `true`, MongoDB rules in the form of `{ fieldName: { $not: { <...rule> } } }`
   * will be parsed into a rule group with the `not` attribute set to `true`. By default
   * (i.e., when this attribute is `false`), such "`$not`" rules will be parsed into a
   * rule with a negated operator.
   *
   * For example, with `preventOperatorNegation` set to `true`, a MongoDB rule like this...
   *
   * ```ts
   * { fieldName: { $not: { $eq: 1 } } }
   * ```
   *
   * ...would yield a rule group like this:
   *
   * ```ts
   * {
   *   combinator: 'and',
   *   not: true,
   *   rules: [{ field: 'fieldName', operator: '=', value: 1 }]
   * }
   * ```
   *
   * By default, the same MongoDB rule would yield a rule like this:
   *
   * ```ts
   * { field: 'fieldName', operator: '!=', value: 1 }
   * //              negated operator ^
   * ```
   *
   * @default false
   */
  preventOperatorNegation?: boolean;
  /**
   * Map of additional operators to their respective processing functions. Operators
   * must begin with `"$"`. Processing functions should return either a {@link RuleType}
   * or {@link RuleGroupType}.
   *
   * (The functions should _not_ return {@link RuleGroupTypeIC}, even if using independent
   * combinators. If the `independentCombinators` option is `true`, `parseMongoDB`
   * will convert the final query to {@link RuleGroupTypeIC} before returning it.)
   *
   * @default {}
   */
  additionalOperators?: Record<
    `$${string}`,
    (
      field: string,
      operator: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: any,
      options: ParserCommonOptions
    ) => RuleType | RuleGroupType
  >;
}
