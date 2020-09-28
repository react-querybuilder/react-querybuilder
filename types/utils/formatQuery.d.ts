import { ExportFormat, RuleGroupType, ValueProcessor } from '../types';
interface FormatQueryOptions {
    format?: ExportFormat;
    valueProcessor?: ValueProcessor;
    quoteFieldNamesWith?: string;
}
/**
 * Formats a query in the requested output format.  The optional
 * `valueProcessor` argument can be used to format the values differently
 * based on a given field, operator, and value.  By default, values are
 * processed assuming the default operators are being used.
 */
declare const formatQuery: (ruleGroup: RuleGroupType, options?: "json" | FormatQueryOptions | "sql" | "json_without_ids" | "parameterized" | undefined) => string | {
    sql: string;
    params: string[];
};
export default formatQuery;
