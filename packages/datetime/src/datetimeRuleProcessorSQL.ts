import type { RuleProcessor, SQLPreset, ValueProcessorByRule } from 'react-querybuilder';
import {
  defaultRuleProcessorSQL,
  defaultValueProcessorByRule,
  getQuotedFieldName,
  mapSQLOperator,
  toArray,
} from 'react-querybuilder';
import type { RQBDateTimeLibraryAPI } from './types';
import { isISOStringDateOnly, processIsDateField } from './utils';

export const getDatetimeValueProcessorANSI =
  ({ toISOStringDateOnly, toISOString }: RQBDateTimeLibraryAPI): ValueProcessorByRule =>
  (rule, opts) => {
    if (isISOStringDateOnly(opts?.context?.originalValue)) {
      return defaultValueProcessorByRule({ ...rule, value: toISOStringDateOnly(rule.value) }, opts);
    }
    return defaultValueProcessorByRule({ ...rule, value: toISOString(rule.value as Date) }, opts);
  };

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

export const getDatetimeRuleProcessorSQL =
  (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* istanbul ignore next */ {};
    const operator = mapSQLOperator(rule.operator);
    const operatorLowerCase = operator.toLowerCase();
    // istanbul ignore next
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

    const valueAsArray: string[] = toArray(rule.value, { retainEmptyStrings: false });
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
        const [originalValue, value] = valueAsDateArray[0];
        finalValue = valueProcessor(
          { field: rule.field, operator: '=', value },
          { ...opts, context: { originalValue } }
        );
      }
    }

    return `${getQuotedFieldName(rule.field, { quoteFieldNamesWith, fieldIdentifierSeparator })} ${operator} ${finalValue}`.trim();
  };
