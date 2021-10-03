import { isRuleGroup } from '.';
import {
  ExportFormat,
  FormatQueryOptions,
  RuleGroupType,
  RuleType,
  ValueProcessor
} from '../types';

const toArray = (v: any) => (Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : []);

const mapOperator = (op: string) => {
  switch (op.toLowerCase()) {
    case 'null':
      return 'is null';
    case 'notnull':
      return 'is not null';
    case 'notin':
      return 'not in';
    case 'notbetween':
      return 'not between';
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

const mongoOperators: { [op: string]: string } = {
  '=': '$eq',
  '!=': '$ne',
  '<': '$lt',
  '<=': '$lte',
  '>': '$gt',
  '>=': 'gte',
  in: '$in',
  notIn: '$nin'
};

export const defaultValueProcessor: ValueProcessor = (
  _field: string,
  operator: string,
  value: any
) => {
  const operatorLowerCase = operator.toLowerCase();
  if (operatorLowerCase === 'null' || operatorLowerCase === 'notnull') {
    return '';
  } else if (operatorLowerCase === 'in' || operatorLowerCase === 'notin') {
    const valArray = toArray(value);
    if (valArray.length > 0) {
      return `(${valArray.map((v: string) => `'${v.trim()}'`).join(', ')})`;
    } else {
      return '';
    }
  } else if (operatorLowerCase === 'between' || operatorLowerCase === 'notbetween') {
    if (
      (Array.isArray(value) && value.length === 2) ||
      (typeof value === 'string' && /^[^,]+,[^,]+$/.test(value))
    ) {
      const [first, second] = toArray(value);
      return `'${first.trim()}' and '${second.trim()}'`;
    } else {
      return '';
    }
  } else if (operatorLowerCase === 'contains' || operatorLowerCase === 'doesnotcontain') {
    return `'%${value}%'`;
  } else if (operatorLowerCase === 'beginswith' || operatorLowerCase === 'doesnotbeginwith') {
    return `'${value}%'`;
  } else if (operatorLowerCase === 'endswith' || operatorLowerCase === 'doesnotendwith') {
    return `'%${value}'`;
  } else if (typeof value === 'boolean') {
    return `${value}`.toUpperCase();
  }
  return `'${value}'`;
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

      if (parameterized) {
        if (operator.toLowerCase() === 'is null' || operator.toLowerCase() === 'is not null') {
          return `${quoteFieldNamesWith}${rule.field}${quoteFieldNamesWith} ${operator}`;
        } else if (operator.toLowerCase() === 'in' || operator.toLowerCase() === 'not in') {
          if (value) {
            const splitValue = (rule.value as string).split(',').map((v) => v.trim());
            splitValue.forEach((v) => params.push(v));
            return `${quoteFieldNamesWith}${
              rule.field
            }${quoteFieldNamesWith} ${operator} (${splitValue.map(() => '?').join(', ')})`;
          } else {
            return '';
          }
        } else if (
          operator.toLowerCase() === 'between' ||
          operator.toLowerCase() === 'not between'
        ) {
          if (value) {
            const [first, second] = toArray(rule.value).map((v) => v.trim());
            params.push(first);
            params.push(second);
            return `${quoteFieldNamesWith}${rule.field}${quoteFieldNamesWith} ${operator} ? and ?`;
          } else {
            return '';
          }
        }
        params.push((value as string).match(/^'?(.*?)'?$/)![1]);
      } else {
        if (['in', 'not in', 'between', 'not between'].includes(operator.toLowerCase()) && !value) {
          return '';
        }
      }
      return `${quoteFieldNamesWith}${rule.field}${quoteFieldNamesWith} ${operator} ${
        parameterized ? '?' : value
      }`.trim();
    };

    const processRuleGroup = (rg: RuleGroupType): string => {
      const processedRules = rg.rules.map((rule) => {
        if (isRuleGroup(rule)) {
          return processRuleGroup(rule);
        }
        return processRule(rule);
      });
      return `${rg.not ? 'NOT ' : ''}(${processedRules
        .filter((r) => !!r)
        .join(` ${rg.combinator} `)})`;
    };

    if (parameterized) {
      return { sql: processRuleGroup(ruleGroup), params };
    } else {
      return processRuleGroup(ruleGroup);
    }
  } else if (formatLowerCase === 'mongodb') {
    const formatRuleGroup = (qr: RuleGroupType) => {
      const combinator = `$${qr.combinator}`;

      const expression = qr.rules
        .map((rule) => {
          let exp = '';

          if (isRuleGroup(rule)) {
            exp = `{${formatRuleGroup(rule)}}`;
          } else {
            const mongoOperator = mongoOperators[rule.operator];
            let value = rule.value;

            if (typeof rule.value !== 'boolean') {
              value = `"${rule.value}"`;
            }

            if (['<', '<=', '=', '!=', '>', '>='].includes(rule.operator)) {
              exp = `{${rule.field}:{${mongoOperator}:${value}}}`;
            } else if (rule.operator === 'contains') {
              exp = `{${rule.field}:/${rule.value}/}`;
            } else if (rule.operator === 'beginsWith') {
              exp = `{${rule.field}:/^${rule.value}/}`;
            } else if (rule.operator === 'endsWith') {
              exp = `{${rule.field}:/${rule.value}$/}`;
            } else if (rule.operator === 'doesNotContain') {
              exp = `{${rule.field}:{$not:/${rule.value}/}}`;
            } else if (rule.operator === 'doesNotBeginWith') {
              exp = `{${rule.field}:{$not:/^${rule.value}/}}`;
            } else if (rule.operator === 'doesNotEndWith') {
              exp = `{${rule.field}:{$not:/${rule.value}$/}}`;
            } else if (rule.operator === 'null') {
              exp = `{${rule.field}:null}`;
            } else if (rule.operator === 'notNull') {
              exp = `{${rule.field}:{$ne:null}}`;
            } else if (rule.operator === 'in' || rule.operator === 'notIn') {
              const valArray = toArray(rule.value);
              if (valArray.length) {
                exp = `{${rule.field}:{${mongoOperator}:[${valArray.map((val: any) => {
                  return `"${val.trim()}"`;
                })}]}}`;
              } else {
                exp = '';
              }
            } else if (rule.operator === 'between' || rule.operator === 'notBetween') {
              const valArray = toArray(rule.value);
              if (valArray.length) {
                const [first, second] = valArray;
                if (rule.operator === 'between') {
                  if (
                    (Array.isArray(rule.value) && rule.value.length === 2) ||
                    (typeof rule.value === 'string' && /^[^,]+,[^,]+$/.test(rule.value))
                  ) {
                    exp = `{$and:[{${rule.field}:{$gte:"${first.trim()}"}},{${
                      rule.field
                    }:{$lte:"${second.trim()}"}}]}`;
                  } else {
                    exp = '';
                  }
                } else {
                  exp = `{$or:[{${rule.field}:{$lt:"${first.trim()}"}},{${
                    rule.field
                  }:{$gt:"${second.trim()}"}}]}`;
                }
              } else {
                exp = '';
              }
            }
          }

          return exp;
        })
        .filter((e) => !!e)
        .join(',');

      return `${combinator}:[${expression}]`;
    };

    return `{${formatRuleGroup(ruleGroup)}}`;
  } else {
    return '';
  }
};

export default formatQuery;
