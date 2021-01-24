import { ExportFormat, RuleGroupType, ValueProcessor } from '../types';
interface FormatQueryOptions {
    format?: ExportFormat;
    valueProcessor?: ValueProcessor;
    quoteFieldNamesWith?: string;
}
export declare const defaultValueProcessor: ValueProcessor;
/**
 * Formats a query in the requested output format.  The optional
 * `valueProcessor` argument can be used to format the values differently
 * based on a given field, operator, and value.  By default, values are
 * processed assuming the default operators are being used.
 */
declare const formatQuery: (ruleGroup: RuleGroupType, options?: "json" | "sql" | "json_without_ids" | "parameterized" | FormatQueryOptions | undefined) => string | {
    sql: string;
    params: string[];
};
export default formatQuery;
