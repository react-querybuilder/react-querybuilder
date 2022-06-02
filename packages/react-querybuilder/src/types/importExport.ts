import type { RulesLogic } from 'json-logic-js';
import type { Field, OptionGroup, ValueSource, ValueSources } from './basic';
import type { RuleType } from './ruleGroups';
import type { QueryValidator } from './validation';

export type ExportFormat =
  | 'json'
  | 'sql'
  | 'json_without_ids'
  | 'parameterized'
  | 'parameterized_named'
  | 'mongodb'
  | 'cel'
  | 'jsonlogic'
  | 'spel';

export interface FormatQueryOptions {
  /**
   * The export format.
   */
  format?: ExportFormat;
  /**
   * This function will be used to process the `value` from each rule
   * when using the "sql"/"parameterized"/"parameterized_named" export
   * formats. If not defined, `defaultValueProcessor` will be used.
   */
  valueProcessor?: ValueProcessor;
  /**
   * In the "sql"/"parameterized"/"parameterized_named" export formats,
   * field names will be bracketed by this string. Defaults to the empty
   * string (''). A common value for this option is the backtick ('`').
   */
  quoteFieldNamesWith?: string;
  /**
   * Validator function for the entire query. Can be the same function passed
   * as `validator` prop to `<QueryBuilder />`.
   */
  validator?: QueryValidator;
  /**
   * This can be the same Field[] passed to <QueryBuilder />, but really
   * all you need to provide is the name and validator for each field.
   */
  fields?: (Pick<Field, 'name' | 'validator'> & Record<string, any>)[];
  /**
   * This string will be inserted in place of invalid groups for "sql",
   * "parameterized", "parameterized_named", and "mongodb" formats.
   * Defaults to '(1 = 1)' for "sql"/"parameterized"/"parameterized_named",
   * '$and:[{$expr:true}]' for "mongodb".
   */
  fallbackExpression?: string;
  /**
   * This string will be placed in front of named parameters (aka bind variables)
   * when using the "parameterized_named" export format. Default is ":".
   */
  paramPrefix?: string;
  /**
   * Renders values as either `number`-types or unquoted strings, as
   * appropriate and when possible. Each `string`-type value is passed
   * to `parseFloat` to determine if it can be represented as a plain
   * numeric value.
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

export type ValueProcessorOptions = Pick<FormatQueryOptions, 'parseNumbers'>;

export type ValueProcessorInternal = (rule: RuleType, options: ValueProcessorOptions) => string;

export type ValueProcessor = (
  field: string,
  operator: string,
  value: any,
  valueSource?: ValueSource
) => string;

export interface ParameterizedSQL {
  sql: string;
  params: any[];
}

export interface ParameterizedNamedSQL {
  sql: string;
  params: Record<string, any>;
}

export type RQBJsonLogic = RulesLogic<
  | { startsWith: [RQBJsonLogic, RQBJsonLogic, ...RQBJsonLogic[]] }
  | { endsWith: [RQBJsonLogic, RQBJsonLogic, ...RQBJsonLogic[]] }
>;

export interface ParseSQLOptions {
  independentCombinators?: boolean;
  paramPrefix?: string;
  params?: any[] | Record<string, any>;
  listsAsArrays?: boolean;
  fields?: Field[] | OptionGroup<Field>[] | Record<string, Field>;
  getValueSources?: (field: string, operator: string) => ValueSources;
}
