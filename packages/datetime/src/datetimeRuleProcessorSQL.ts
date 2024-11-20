import type { RuleProcessor, SQLPreset, ValueProcessorByRule } from 'react-querybuilder';
import {
  defaultRuleProcessorSQL,
  defaultValueProcessorByRule,
  getQuotedFieldName,
  mapSQLOperator,
  toArray,
} from 'react-querybuilder';
import type { RQBDateTimeOperators } from './types';
import { isISOStringDateOnly } from './utils';

export const datetimeValueProcessorANSI =
  ({ format, iso8601DateOnly, toISOString }: RQBDateTimeOperators): ValueProcessorByRule =>
  (rule, opts) => {
    if (isISOStringDateOnly(opts?.context?.originalValue)) {
      return defaultValueProcessorByRule(
        { ...rule, value: format(rule.value, iso8601DateOnly) },
        opts
      );
    }
    return defaultValueProcessorByRule({ ...rule, value: toISOString(rule.value as Date) }, opts);
  };

export const datetimeValueProcessorMSSQL =
  ({ format, iso8601DateOnly, toISOString }: RQBDateTimeOperators): ValueProcessorByRule =>
  (rule, opts) => {
    const datatype = /^(?:small)?datetime/i.test(opts?.fieldData?.datatype as string)
      ? 'datetimeoffset'
      : 'date';
    const value =
      datatype === 'datetimeoffset' ? toISOString(rule.value) : format(rule.value, iso8601DateOnly);
    return defaultValueProcessorByRule(
      { ...rule, value },
      { ...opts, wrapValueWith: [`cast(`, ` as ${datatype})`] }
    );
  };

export const datetimeValueProcessorMySQL =
  ({ format, iso8601DateOnly, toISOString }: RQBDateTimeOperators): ValueProcessorByRule =>
  (rule, opts) => {
    const datatype = /^(?:datetime|timestamp)/i.test(opts?.fieldData?.datatype as string)
      ? 'datetime'
      : 'date';
    const value =
      datatype === 'datetime' ? toISOString(rule.value) : format(rule.value, iso8601DateOnly);
    return defaultValueProcessorByRule(
      { ...rule, value },
      { ...opts, wrapValueWith: [`cast(`, ` as ${datatype})`] }
    );
  };

export const datetimeValueProcessorOracle =
  ({ format, iso8601DateOnly, toISOString }: RQBDateTimeOperators): ValueProcessorByRule =>
  (rule, opts) => {
    // Oracle date format for _reading_ ISO 8601: 'YYYY-MM-DD"T"HH24:MI:SS.ff3"Z"'
    const datatype = /^timestamp/i.test(opts?.fieldData?.datatype as string) ? 'timestamp' : 'date';
    const value =
      datatype === 'timestamp'
        ? toISOString(rule.value).replaceAll('T', ' ').replace('Z', ' UTC')
        : format(rule.value, iso8601DateOnly);
    return defaultValueProcessorByRule(
      { ...rule, value },
      { ...opts, wrapValueWith: [datatype, ``] }
    );
  };

export const datetimeValueProcessorPostgreSQL =
  ({ format, iso8601DateOnly, toISOString }: RQBDateTimeOperators): ValueProcessorByRule =>
  (rule, opts) => {
    const datatype = /^timestamp/i.test(opts?.fieldData?.datatype as string) ? 'timestamp' : 'date';
    const value =
      datatype === 'timestamp' ? toISOString(rule.value) : format(rule.value, iso8601DateOnly);
    return defaultValueProcessorByRule(
      { ...rule, value },
      { ...opts, wrapValueWith: [datatype, ``] }
    );
  };

const presetToValueProcessorMap = {
  ansi: datetimeValueProcessorANSI,
  mssql: datetimeValueProcessorMSSQL,
  mysql: datetimeValueProcessorMySQL,
  oracle: datetimeValueProcessorOracle,
  postgresql: datetimeValueProcessorPostgreSQL,
  sqlite: datetimeValueProcessorANSI,
} satisfies Record<SQLPreset, (ops: RQBDateTimeOperators) => ValueProcessorByRule>;

export const datetimeRuleProcessorSQL =
  (ops: RQBDateTimeOperators): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* istanbul ignore next */ {};
    const operator = mapSQLOperator(rule.operator);
    const operatorLowerCase = operator.toLowerCase();
    // istanbul ignore next
    const { quoteFieldNamesWith = ['', ''] as [string, string], fieldIdentifierSeparator = '' } =
      opts;
    let finalValue = '';

    if (
      rule.valueSource === 'field' ||
      !/^(?:date|datetime|datetimeoffset|timestamp)\b/i.test(opts.fieldData?.datatype as string)
    ) {
      return defaultRuleProcessorSQL(rule, opts);
    }

    const valueProcessor = presetToValueProcessorMap[opts.preset!](ops);

    const valueAsArray: string[] = toArray(rule.value, { retainEmptyStrings: false });
    const valueAsDateArray = valueAsArray
      .map((v): [string, Date] => [v, ops.toDate(v)])
      .filter(v => ops.isValid(v[1]));

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
          const orderedArray = ops.isBefore(first[1], second[1])
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
