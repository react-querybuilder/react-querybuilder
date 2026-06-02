import type { RuleProcessor, SQLPreset, ValueProcessorByRule } from 'react-querybuilder';
import {
  defaultRuleProcessorSQL,
  defaultValueProcessorByRule,
  getQuotedFieldName,
  lc,
  mapSQLOperator,
  toArray,
} from 'react-querybuilder';
import { getRelativeDateTimeSQL } from './getRelativeDateTimeSQL';
import type { RQBDateTimeLibraryAPI } from './types';
import {
  isISOStringDateOnly,
  isRelativeDateTimeValue,
  materializeRelativeValues,
  processIsDateField,
} from './utils';

/**
 * Generates a value processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "sql" format and "ansi" preset.
 */
export const getDatetimeValueProcessorANSI =
  ({ toISOStringDateOnly, toISOString }: RQBDateTimeLibraryAPI): ValueProcessorByRule =>
  (rule, opts) => {
    if (isISOStringDateOnly(opts?.context?.originalValue)) {
      return defaultValueProcessorByRule({ ...rule, value: toISOStringDateOnly(rule.value) }, opts);
    }
    return defaultValueProcessorByRule({ ...rule, value: toISOString(rule.value as Date) }, opts);
  };

/**
 * Generates a value processor with date/time features for use by {@link @react-querybuilder/core!formatQuery formatQuery} with
 * the "sql" format and "mssql" preset.
 */
export const getDatetimeValueProcessorMSSQL =
  ({ toISOStringDateOnly, toISOString }: RQBDateTimeLibraryAPI): ValueProcessorByRule =>
  (rule, opts) => {
    const datatype = /^(?:small)?datetime/i.test(opts?.fieldData?.datatype as string)
      ? 'datetimeoffset'
      : 'date';
    const value =
      datatype === 'datetimeoffset' ? toISOString(rule.value) : toISOStringDateOnly(rule.value);
    return defaultValueProcessorByRule(
      { ...rule, value },
      { ...opts, wrapValueWith: [`cast(`, ` as ${datatype})`] }
    );
  };

/**
 * Generates a value processor with date/time features for use by {@link @react-querybuilder/core!formatQuery formatQuery} with
 * the "sql" format and "mysql" preset.
 */
export const getDatetimeValueProcessorMySQL =
  ({ toISOStringDateOnly, toISOString }: RQBDateTimeLibraryAPI): ValueProcessorByRule =>
  (rule, opts) => {
    const datatype = /^(?:datetime|timestamp)/i.test(opts?.fieldData?.datatype as string)
      ? 'datetime'
      : 'date';
    const value =
      datatype === 'datetime' ? toISOString(rule.value) : toISOStringDateOnly(rule.value);
    return defaultValueProcessorByRule(
      { ...rule, value },
      { ...opts, wrapValueWith: [`cast(`, ` as ${datatype})`] }
    );
  };

/**
 * Generates a value processor with date/time features for use by {@link @react-querybuilder/core!formatQuery formatQuery} with
 * the "sql" format and "oracle" preset.
 */
export const getDatetimeValueProcessorOracle =
  ({ toISOStringDateOnly, toISOString }: RQBDateTimeLibraryAPI): ValueProcessorByRule =>
  (rule, opts) => {
    // Oracle date format for _reading_ ISO 8601: 'YYYY-MM-DD"T"HH24:MI:SS.ff3"Z"'
    const datatype = /^timestamp/i.test(opts?.fieldData?.datatype as string) ? 'timestamp' : 'date';
    const value =
      datatype === 'timestamp'
        ? toISOString(rule.value).replaceAll('T', ' ').replace('Z', ' UTC')
        : toISOStringDateOnly(rule.value);
    return defaultValueProcessorByRule(
      { ...rule, value },
      { ...opts, wrapValueWith: [datatype, ``] }
    );
  };

/**
 * Generates a value processor with date/time features for use by {@link @react-querybuilder/core!formatQuery formatQuery} with
 * the "sql" format and "postgresql" preset.
 */
export const getDatetimeValueProcessorPostgreSQL =
  ({ toISOStringDateOnly, toISOString }: RQBDateTimeLibraryAPI): ValueProcessorByRule =>
  (rule, opts) => {
    const datatype = /^timestamp/i.test(opts?.fieldData?.datatype as string) ? 'timestamp' : 'date';
    const value =
      datatype === 'timestamp' ? toISOString(rule.value) : toISOStringDateOnly(rule.value);
    return defaultValueProcessorByRule(
      { ...rule, value },
      { ...opts, wrapValueWith: [datatype, ``] }
    );
  };

const presetToValueProcessorMap = {
  ansi: getDatetimeValueProcessorANSI,
  mssql: getDatetimeValueProcessorMSSQL,
  mysql: getDatetimeValueProcessorMySQL,
  oracle: getDatetimeValueProcessorOracle,
  postgresql: getDatetimeValueProcessorPostgreSQL,
  sqlite: getDatetimeValueProcessorANSI,
} satisfies Record<SQLPreset, (apiFns: RQBDateTimeLibraryAPI) => ValueProcessorByRule>;

/**
 * Generates a rule processor with date/time features for use by {@link @react-querybuilder/core!formatQuery formatQuery} with
 * the "sql" format.
 */
export const getDatetimeRuleProcessorSQL =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* v8 ignore start -- @preserve */ {} /* v8 ignore stop -- @preserve */;
    const operator = mapSQLOperator(rule.operator);
    const operatorLowerCase = lc(operator);
    // v8 ignore next
    const {
      quoteFieldNamesWith = ['', ''] as [string, string],
      fieldIdentifierSeparator = '',
      context = {},
    } = opts;
    let finalValue = '';

    if (rule.valueSource === 'field' || !processIsDateField(context.isDateField, rule, opts)) {
      return defaultRuleProcessorSQL(rule, opts);
    }

    const valueProcessor = presetToValueProcessorMap[opts.preset!](apiFns);

    const quotedField = getQuotedFieldName(rule.field, {
      quoteFieldNamesWith,
      fieldIdentifierSeparator,
    });

    // SQL can emit "live" symbolic relative expressions, so relative values stay
    // symbolic by default. When `context.materializeRelativeDateTime` is set, resolve
    // them to concrete literals up front and let the standard literal path handle them.
    const ruleValue = context.materializeRelativeDateTime
      ? materializeRelativeValues(apiFns, rule.value, opts)
      : rule.value;

    // Relative date/time values are stored as objects. Intercept them before
    // `toArray` (which drops objects) and emit symbolic dialect-specific SQL.
    const rawValues = Array.isArray(ruleValue) ? ruleValue : [ruleValue];
    if (rawValues.some(isRelativeDateTimeValue)) {
      const exprFor = (v: unknown): string | undefined => {
        if (isRelativeDateTimeValue(v)) {
          return getRelativeDateTimeSQL(v, opts.preset!, opts.fieldData?.datatype);
        }
        const dateVal = apiFns.toDate(v as string | Date);
        if (!apiFns.isValid(dateVal)) return undefined;
        return valueProcessor(
          { field: rule.field, operator: '=', value: dateVal },
          { ...opts, context: { originalValue: v } }
        );
      };

      switch (operatorLowerCase) {
        case 'in':
        case 'not in': {
          const exprs = rawValues.map(exprFor).filter((e): e is string => e !== undefined);
          // v8 ignore next -- a relative operand always yields an expression
          if (exprs.length === 0) return '';
          finalValue = `(${exprs.join(', ')})`;
          break;
        }

        case 'between':
        case 'not between': {
          // Operand order is preserved — symbolic expressions can't be compared
          // at format time to auto-order them.
          const first = exprFor(rawValues[0]);
          const second = exprFor(rawValues[1]);
          if (first === undefined || second === undefined) return '';
          finalValue = `${first} and ${second}`;
          break;
        }

        default: {
          const expr = exprFor(rawValues[0]);
          // v8 ignore next -- a single relative operand always yields an expression
          if (expr === undefined) return '';
          finalValue = expr;
        }
      }

      return `${quotedField} ${operator} ${finalValue}`.trim();
    }

    const valueAsArray: string[] = toArray(ruleValue, { retainEmptyStrings: false });
    const valueAsDateArray = valueAsArray
      .map((v): [string, Date] => [v, apiFns.toDate(v)])
      .filter(v => apiFns.isValid(v[1]));

    switch (operatorLowerCase) {
      case 'in':
      case 'not in':
        {
          if (valueAsDateArray.length === 0) return '';
          finalValue = `(${valueAsDateArray
            .map(value =>
              valueProcessor(
                { field: rule.field, operator: '=', value: value[1] },
                { ...opts, context: { originalValue: value[0] } }
              )
            )
            .join(', ')})`;
        }
        break;

      case 'between':
      case 'not between':
        {
          if (valueAsDateArray.length < 2) return '';
          const [first, second] = valueAsDateArray;
          const orderedArray = apiFns.isBefore(first[1], second[1])
            ? [first, second]
            : [second, first];
          finalValue = orderedArray
            .map(([originalValue, value]) =>
              valueProcessor(
                { field: rule.field, operator: '=', value },
                { ...opts, context: { originalValue } }
              )
            )
            .join(' and ');
        }
        break;

      default: {
        const [originalValue, value] = valueAsDateArray[0] ?? ['', ''];
        finalValue = valueProcessor(
          { field: rule.field, operator: '=', value },
          { ...opts, context: { originalValue } }
        );
      }
    }

    return `${quotedField} ${operator} ${finalValue}`.trim();
  };
