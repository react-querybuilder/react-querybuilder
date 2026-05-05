import type { RuleProcessor } from 'react-querybuilder';
import { defaultRuleProcessorCypher, lc, toArray } from 'react-querybuilder';
import type { RQBDateTimeLibraryAPI } from './types';
import { isISOStringDateOnly, processIsDateField } from './utils';

const shouldNegate = (op: string) => /^(does)?not/i.test(op);

/**
 * Wraps a date string in the appropriate Cypher temporal constructor.
 * - Date-only strings (YYYY-MM-DD) become `date('...')`
 * - Full ISO strings become `datetime('...')`
 */
const cypherTemporal = (iso: string, dateOnly: boolean): string =>
  dateOnly ? `date('${iso}')` : `datetime('${iso}')`;

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "cypher" or "gql" format.
 *
 * Supports:
 * - Standard comparison operators (`=`, `!=`, `<`, `>`, `<=`, `>=`)
 * - Range operators (between, notBetween, in, notIn)
 * - Duration math via custom operators: `olderThanDuration` and `withinDuration`
 *   (e.g., value `"P30D"` → `datetime() - field > duration('P30D')`)
 */
export const getDatetimeRuleProcessorCypher =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* v8 ignore start -- @preserve */ {} /* v8 ignore stop -- @preserve */;
    const { context = {} } = opts;

    if (rule.valueSource === 'field' || !processIsDateField(context.isDateField, rule, opts)) {
      return defaultRuleProcessorCypher(rule, opts);
    }

    const { field, operator, value } = rule;
    const operatorTL = lc(operator);

    // Duration math operators — compare elapsed time against a duration literal
    if (operatorTL === 'olderthanduration') {
      return `datetime() - ${field} > duration('${value}')`;
    }
    if (operatorTL === 'withinduration') {
      return `datetime() - ${field} <= duration('${value}')`;
    }

    const valueAsArray: string[] = toArray(value, { retainEmptyStrings: false });
    const valueAsDateArray = valueAsArray
      .map((v): [string, Date] => [v, apiFns.toDate(v)])
      .filter(([, d]) => apiFns.isValid(d));

    const fmtDate = (originalValue: string): string => {
      const dateOnly = isISOStringDateOnly(originalValue);
      const iso = dateOnly
        ? apiFns.toISOStringDateOnly(originalValue)
        : apiFns.toISOString(originalValue);
      return cypherTemporal(iso, dateOnly);
    };

    switch (operatorTL) {
      case 'in':
      case 'notin': {
        if (valueAsDateArray.length === 0) return '';
        const items = valueAsDateArray.map(([orig]) => fmtDate(orig));
        const prefix = shouldNegate(operatorTL) ? 'NOT ' : '';
        return `${prefix}${field} IN [${items.join(', ')}]`;
      }

      case 'between':
      case 'notbetween': {
        if (valueAsDateArray.length < 2) return '';
        const [first, second] = valueAsDateArray;
        const [lo, hi] = apiFns.isBefore(first[1], second[1]) ? [first, second] : [second, first];
        const expr = `${fmtDate(lo[0])} <= ${field} AND ${field} <= ${fmtDate(hi[0])}`;
        return operatorTL === 'notbetween' ? `NOT (${expr})` : expr;
      }

      default: {
        // Standard comparison: =, !=, <, >, <=, >=
        if (valueAsDateArray.length === 0) return '';
        const [orig] = valueAsDateArray[0];
        const op = operatorTL === '<>' ? '<>' : operatorTL;
        return `${field} ${op} ${fmtDate(orig)}`;
      }
    }
  };
