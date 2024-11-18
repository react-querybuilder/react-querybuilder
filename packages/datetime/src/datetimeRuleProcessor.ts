import dayjs from 'dayjs';
import type { RuleProcessor, SQLPreset, ValueProcessorByRule } from 'react-querybuilder';
import {
  defaultValueProcessorByRule,
  defaultRuleProcessorSQL,
  toArray,
  getQuotedFieldName,
  mapSQLOperator,
} from 'react-querybuilder';

type DateTimeValueProcessor = (
  rule: Omit<Parameters<ValueProcessorByRule>[0], 'value'> & { value: dayjs.Dayjs },
  opts?: Parameters<ValueProcessorByRule>[1]
) => ReturnType<ValueProcessorByRule>;

export const datetimeValueProcessorANSI: DateTimeValueProcessor = (rule, opts) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(opts?.context?.originalValue)) {
    return defaultValueProcessorByRule({ ...rule, value: rule.value.format('YYYY-MM-DD') }, opts);
  }
  return defaultValueProcessorByRule({ ...rule, value: rule.value.toISOString() }, opts);
};

export const datetimeValueProcessorMSSQL: DateTimeValueProcessor = (rule, opts) => {
  const datatype = /^(?:small)?datetime/i.test(opts?.fieldData?.datatype as string)
    ? 'datetimeoffset'
    : 'date';
  const value =
    datatype === 'datetimeoffset' ? rule.value.toISOString() : rule.value.format('YYYY-MM-DD');
  return defaultValueProcessorByRule(
    { ...rule, value },
    { ...opts, wrapValueWith: [`cast(`, ` as ${datatype})`] }
  );
};

export const datetimeValueProcessorMySQL: DateTimeValueProcessor = (rule, opts) => {
  const datatype = /^(?:datetime|timestamp)/i.test(opts?.fieldData?.datatype as string)
    ? 'datetime'
    : 'date';
  const value =
    datatype === 'datetime' ? rule.value.toISOString() : rule.value.format('YYYY-MM-DD');
  return defaultValueProcessorByRule(
    { ...rule, value },
    { ...opts, wrapValueWith: [`cast(`, ` as ${datatype})`] }
  );
};

export const datetimeValueProcessorOracle: DateTimeValueProcessor = (rule, opts) => {
  // Oracle date format for _reading_ ISO 8601: 'YYYY-MM-DD"T"HH24:MI:SS.ff3"Z"'
  const datatype = /^timestamp/i.test(opts?.fieldData?.datatype as string) ? 'timestamp' : 'date';
  const value =
    datatype === 'timestamp'
      ? rule.value.toISOString().replaceAll('T', ' ').replace('Z', ' UTC')
      : rule.value.format('YYYY-MM-DD');
  return defaultValueProcessorByRule(
    { ...rule, value },
    { ...opts, wrapValueWith: [datatype, ``] }
  );
};

export const datetimeValueProcessorPostgreSQL: DateTimeValueProcessor = (rule, opts) => {
  const datatype = /^timestamp/i.test(opts?.fieldData?.datatype as string) ? 'timestamp' : 'date';
  const value =
    datatype === 'timestamp' ? rule.value.toISOString() : rule.value.format('YYYY-MM-DD');
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
} satisfies Record<SQLPreset, DateTimeValueProcessor>;

export const datetimeRuleProcessor: RuleProcessor = (rule, options) => {
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

  const valueProcessor = presetToValueProcessorMap[opts.preset!];

  const valueAsArray: string[] = toArray(rule.value, { retainEmptyStrings: false });
  const valueAsDateArray = valueAsArray
    .map((v): [string, dayjs.Dayjs] => [v, dayjs(v)])
    .filter(v => v[1].isValid());

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
        const orderedArray = first[1].isBefore(second[1]) ? [first, second] : [second, first];
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
