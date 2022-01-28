import type { ValueSource } from './basic';
import type { QueryValidator, RuleValidator } from './validation';

export type ExportFormat =
  | 'json'
  | 'sql'
  | 'json_without_ids'
  | 'parameterized'
  | 'parameterized_named'
  | 'mongodb';

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
  fields?: { name: string; validator?: RuleValidator; [k: string]: any }[];
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
}

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
  params: { [p: string]: any };
}

export interface ParseSQLOptions {
  independentCombinators?: boolean;
  paramPrefix?: string;
  params?: any[] | { [p: string]: any };
  listsAsArrays?: boolean;
}

export type AnyCase<T extends string> = string extends T
  ? string
  : T extends `${infer F1}${infer F2}${infer R}`
  ? `${Uppercase<F1> | Lowercase<F1>}${Uppercase<F2> | Lowercase<F2>}${AnyCase<R>}`
  : T extends `${infer F}${infer R}`
  ? `${Uppercase<F> | Lowercase<F>}${AnyCase<R>}`
  : '';
