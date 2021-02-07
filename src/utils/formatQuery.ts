import { isRuleGroup } from '.';
import { ExportFormat, RuleGroupType, RuleType, ValueProcessor } from '../types';

interface FormatQueryOptions {
  format?: ExportFormat;
  valueProcessor?: ValueProcessor;
  quoteFieldNamesWith?: string;
}

const mapOperator = (op: string) => {
  switch (op.toLowerCase()) {
    case 'null':
      return 'is null';
    case 'notnull':
      return 'is not null';
    case 'notin':
      return 'not in';
    case 'contains':
    case 'beginswith':
    case 'endswith':
      return 'like';
    case 'doesnotcontain':
    case 'doesnotbeginwith':
    case 'doesnotendwith':
      return 'not like';
    default:
      return op;
  }
};

export const defaultValueProcessor: ValueProcessor = (
  field: string,
  operator: string,
  value: any
) => {
  let val = `'${value}'`;
  if (operator.toLowerCase() === 'null' || operator.toLowerCase() === 'notnull') {
    val = '';
  } else if (operator.toLowerCase() === 'in' || operator.toLowerCase() === 'notin') {
    val = `(${value
      .split(',')
      .map((v: string) => `'${v.trim()}'`)
      .join(', ')})`;
  } else if (operator.toLowerCase() === 'contains' || operator.toLowerCase() === 'doesnotcontain') {
    val = `'%${value}%'`;
  } else if (
    operator.toLowerCase() === 'beginswith' ||
    operator.toLowerCase() === 'doesnotbeginwith'
  ) {
    val = `'${value}%'`;
  } else if (operator.toLowerCase() === 'endswith' || operator.toLowerCase() === 'doesnotendwith') {
    val = `'%${value}'`;
  } else if (typeof value === 'boolean') {
    val = `${value}`.toUpperCase();
  }
  return val;
};

/**
 * Formats a query in the requested output format.  The optional
 * `valueProcessor` argument can be used to format the values differently
 * based on a given field, operator, and value.  By default, values are
 * processed assuming the default operators are being used.
 */
const formatQuery = (ruleGroup: RuleGroupType, options?: FormatQueryOptions | ExportFormat) => {
  let format: ExportFormat;
  let valueProcessor: ValueProcessor;
  let quoteFieldNamesWith: string;

  if (typeof options === 'string') {
    format = options;
    valueProcessor = defaultValueProcessor;
    quoteFieldNamesWith = '';
  } else {
    format = options?.format || 'json';
    valueProcessor = options?.valueProcessor || defaultValueProcessor;
    quoteFieldNamesWith = options?.quoteFieldNamesWith || '';
  }

  const formatLowerCase = format.toLowerCase() as ExportFormat;

  if (formatLowerCase === 'json') {
    return JSON.stringify(ruleGroup, null, 2);
  } else if (formatLowerCase === 'json_without_ids') {
    return JSON.stringify(ruleGroup, ['rules', 'field', 'value', 'operator', 'combinator', 'not']);
  } else if (formatLowerCase === 'sql' || formatLowerCase === 'parameterized') {
    const parameterized = formatLowerCase === 'parameterized';
    const params: string[] = [];

    const processRule = (rule: RuleType) => {
      const value = valueProcessor(rule.field, rule.operator, rule.value);
      const operator = mapOperator(rule.operator);

      if (parameterized && value) {
        if (operator.toLowerCase() === 'in' || operator.toLowerCase() === 'not in') {
          const splitValue = (rule.value as string).split(',').map((v) => v.trim());
          splitValue.forEach((v) => params.push(v));
          return `${quoteFieldNamesWith}${
            rule.field
          }${quoteFieldNamesWith} ${operator} (${splitValue.map((v) => '?').join(', ')})`;
        }

        params.push((value as string).match(/^'?(.*?)'?$/)![1]);
      }
      return `${quoteFieldNamesWith}${rule.field}${quoteFieldNamesWith} ${operator} ${
        parameterized && value ? '?' : value
      }`.trim();
    };

    const processRuleGroup = (rg: RuleGroupType): string => {
      const processedRules = rg.rules.map((rule) => {
        if (isRuleGroup(rule)) {
          return processRuleGroup(rule);
        }
        return processRule(rule);
      });
      return `${rg.not ? 'NOT ' : ''}(${processedRules.join(` ${rg.combinator} `)})`;
    };

    if (parameterized) {
      return { sql: processRuleGroup(ruleGroup), params };
    } else {
      return processRuleGroup(ruleGroup);
    }
  } else {
    return '';
  }
};

export default formatQuery;
