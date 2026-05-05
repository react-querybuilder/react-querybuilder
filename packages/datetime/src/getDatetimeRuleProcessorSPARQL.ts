import type { RuleProcessor } from 'react-querybuilder';
import { defaultRuleProcessorSPARQL, lc, toArray } from 'react-querybuilder';
import type { RQBDateTimeLibraryAPI } from './types';
import { isISOStringDateOnly, processIsDateField } from './utils';

const shouldNegate = (op: string) => /^(does)?not/i.test(op);

/**
 * Wraps a date string in the appropriate SPARQL typed literal.
 * - Date-only strings (YYYY-MM-DD) become `"..."^^xsd:date`
 * - Full ISO strings become `"..."^^xsd:dateTime`
 */
const sparqlTemporal = (iso: string, dateOnly: boolean): string =>
  dateOnly ? `"${iso}"^^xsd:date` : `"${iso}"^^xsd:dateTime`;

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "sparql" format.
 *
 * Supports:
 * - Standard comparison operators (`=`, `!=`, `<`, `>`, `<=`, `>=`)
 * - Range operators (between, notBetween, in, notIn)
 * - Duration math via custom operators: `olderThanDuration` and `withinDuration`
 *   (e.g., value `"P30D"` → `NOW() - ?field > "P30D"^^xsd:duration`)
 */
export const getDatetimeRuleProcessorSPARQL =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* v8 ignore start -- @preserve */ {} /* v8 ignore stop -- @preserve */;
    const { context = {} } = opts;

    if (rule.valueSource === 'field' || !processIsDateField(context.isDateField, rule, opts)) {
      return defaultRuleProcessorSPARQL(rule, opts);
    }

    const { field, operator, value } = rule;
    const operatorTL = lc(operator);

    // Duration math operators — compare elapsed time against an xsd:duration literal
    if (operatorTL === 'olderthanduration') {
      return `NOW() - ${field} > "${value}"^^xsd:duration`;
    }
    if (operatorTL === 'withinduration') {
      return `NOW() - ${field} <= "${value}"^^xsd:duration`;
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
      return sparqlTemporal(iso, dateOnly);
    };

    switch (operatorTL) {
      case 'in':
      case 'notin': {
        if (valueAsDateArray.length === 0) return '';
        const items = valueAsDateArray.map(([orig]) => fmtDate(orig));
        const joiner = shouldNegate(operatorTL) ? ' && ' : ' || ';
        const op = shouldNegate(operatorTL) ? '!=' : '=';
        return items.map(item => `${field} ${op} ${item}`).join(joiner);
      }

      case 'between':
      case 'notbetween': {
        if (valueAsDateArray.length < 2) return '';
        const [first, second] = valueAsDateArray;
        const [lo, hi] = apiFns.isBefore(first[1], second[1]) ? [first, second] : [second, first];
        if (operatorTL === 'notbetween') {
          return `(${field} < ${fmtDate(lo[0])} || ${field} > ${fmtDate(hi[0])})`;
        }
        return `${field} >= ${fmtDate(lo[0])} && ${field} <= ${fmtDate(hi[0])}`;
      }

      default: {
        // Standard comparison: =, !=, <, >, <=, >=
        if (valueAsDateArray.length === 0) return '';
        const [orig] = valueAsDateArray[0];
        const op = operatorTL === '<>' ? '!=' : operatorTL;
        return `${field} ${op} ${fmtDate(orig)}`;
      }
    }
  };
