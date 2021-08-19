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
  _field: string,
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
          }${quoteFieldNamesWith} ${operator} (${splitValue.map(() => '?').join(', ')})`;
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
  } else if (formatLowerCase === 'mongodb') {
    /**
     * Formats query to mongo db query
     *
     */
    const formatToMongoQuery = (query: any) => {
      let formattedQuery = '';

      // mongo db operator map
      const operators: any = {
        '=': '$eq',
        '!=': '$ne',
        '<': '$lt',
        '<=': '$lte',
        '>': '$gt',
        '>=': 'gte',
        in: '$in',
        notIn: '$nin'
      };
      /**
       *
       * Recursive function to process rules and rule groups
       */
      function format(qr: any) {
        let exp = '';
        const combinator = `$${qr.combinator}`;

        let rulesLength = qr.rules.length;
        for (const obj of qr.rules) {
          const operator = operators[obj.operator];

          if (obj.field) {
            let value = obj.value;

            if (typeof obj.value != 'boolean') {
              value = `"${obj.value}"`;
            }

            if (['<', '<=', '=', '!=', '>', '>='].includes(obj.operator)) {
              exp = exp + `{${obj.field}:{${operator}:${value}}}`;
            } else if (obj.operator == 'contains') {
              exp = exp + `{${obj.field}:/${obj.value}/}`;
            } else if (obj.operator === 'beginsWith') {
              exp = exp + `{${obj.field}:/^${obj.value}/}`;
            } else if (obj.operator === 'endsWith') {
              exp = exp + `{${obj.field}:/${obj.value}$/}`;
            } else if (obj.operator === 'doesNotContain') {
              exp = exp + `{${obj.field}:{$not:/${obj.value}/}}`;
            } else if (obj.operator === 'doesNotBeginWith') {
              exp = exp + `{${obj.field}:{$not:/^${obj.value}/}}`;
            } else if (obj.operator === 'doesNotEndWith') {
              exp = exp + `{${obj.field}:{$not:/${obj.value}$/}}`;
            } else if (obj.operator === 'null') {
              exp = exp + `{${obj.field}:null}`;
            } else if (obj.operator === 'notNull') {
              exp = exp + `{${obj.field}:{$ne:null}}`;
            } else if (obj.operator === 'in' || obj.operator === 'notIn') {
              exp =
                exp +
                `{${obj.field}:{${operator}:[${obj.value.split(',').map((val: any) => {
                  return `"${val.trim()}"`;
                })}]}}`;
            }
            if (--rulesLength) {
              exp = exp + ',';
            }
          } else if (obj.rules) {
            exp = `${exp}{${format(obj)}}`;
          }
        }
        exp = `${combinator}:[${exp}]`;

        return exp;
      }

      formattedQuery = format(query);

      return `{${formattedQuery}}`;
    };

    return formatToMongoQuery(ruleGroup);
  } else {
    return '';
  }
};

export default formatQuery;
