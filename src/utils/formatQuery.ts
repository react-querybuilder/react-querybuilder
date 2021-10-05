import uniqWith from 'lodash/uniqWith';
import { isRuleGroup } from '.';
import { QueryValidator, RuleValidator, ValidationMap, ValidationResult } from '..';
import {
  ExportFormat,
  FormatQueryOptions,
  RuleGroupType,
  RuleType,
  ValueProcessor
} from '../types';
import isRuleOrGroupValid from './isRuleOrGroupValid';

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
    const valArray = toArray(value);
    if (valArray.length === 2 && !!valArray[0] && !!valArray[1]) {
      const [first, second] = valArray;
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
  let format: ExportFormat = 'json';
  let valueProcessor = defaultValueProcessor;
  let quoteFieldNamesWith = '';
  let validator: QueryValidator = () => true;
  let fields: { name: string; validator?: RuleValidator; [k: string]: any }[] = [];
  let validationMap: ValidationMap = {};

  if (typeof options === 'object' && options !== null) {
    format = options.format ?? 'json';
    valueProcessor = options.valueProcessor ?? defaultValueProcessor;
    quoteFieldNamesWith = options.quoteFieldNamesWith ?? '';
    validator = options.validator ?? (() => true);
    fields = options.fields ?? [];
  } else if (typeof options === 'string') {
    format = options;
  }

  const formatLowerCase = format.toLowerCase() as ExportFormat;

  if (formatLowerCase === 'json') {
    return JSON.stringify(ruleGroup, null, 2);
  } else if (formatLowerCase === 'json_without_ids') {
    return JSON.stringify(ruleGroup, ['rules', 'field', 'value', 'operator', 'combinator', 'not']);
  } else if (formatLowerCase === 'sql' || formatLowerCase === 'parameterized') {
    const parameterized = formatLowerCase === 'parameterized';
    const params: string[] = [];

    // istanbul ignore else
    if (typeof validator === 'function') {
      const validationResult = validator(ruleGroup);
      if (typeof validationResult === 'boolean') {
        if (validationResult === false) {
          return parameterized ? { sql: '(1 = 1)', params: [] } : '(1 = 1)';
        }
      } else {
        validationMap = validationResult;
      }
    }

    const validatorMap: { [f: string]: RuleValidator } = {};
    const uniqueFields = uniqWith(fields, (a, b) => a.name === b.name);
    uniqueFields.forEach((f) => {
      // istanbul ignore else
      if (typeof f.validator === 'function') {
        validatorMap[f.name] = f.validator;
      }
    });

    const processRule = (rule: RuleType) => {
      let validationResult: boolean | ValidationResult | undefined = undefined;
      let fieldValidator: RuleValidator | undefined = undefined;
      if (rule.id) {
        validationResult = validationMap[rule.id];
      }
      if (fields.length) {
        const fieldArr = fields.filter((f) => f.name === rule.field);
        if (fieldArr.length) {
          const field = fieldArr[0];
          // istanbul ignore else
          if (typeof field.validator === 'function') {
            fieldValidator = field.validator;
          }
        }
      }
      if (!isRuleOrGroupValid(rule, validationResult, fieldValidator)) {
        return '';
      }

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

    const processRuleGroup = (rg: RuleGroupType, outermost?: boolean): string => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id])) {
        return outermost ? '(1 = 1)' : '';
      }

      const processedRules = rg.rules.map((rule) => {
        if (isRuleGroup(rule)) {
          return processRuleGroup(rule);
        }
        return processRule(rule);
      });

      if (processedRules.length === 0) {
        return '(1 = 1)';
      }

      return `${rg.not ? 'NOT ' : ''}(${processedRules
        .filter((r) => !!r)
        .join(` ${rg.combinator} `)})`;
    };

    if (parameterized) {
      return { sql: processRuleGroup(ruleGroup, true), params };
    } else {
      return processRuleGroup(ruleGroup, true);
    }
  } else if (formatLowerCase === 'mongodb') {
    // istanbul ignore else
    if (typeof validator === 'function') {
      const validationResult = validator(ruleGroup);
      if (typeof validationResult === 'boolean') {
        if (validationResult === false) {
          return '{$and:[{$expr:true}]}';
        }
      } else {
        validationMap = validationResult;
      }
    }

    const processRuleGroup = (rg: RuleGroupType, outermost?: boolean) => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id])) {
        return outermost ? '$and:[{$expr:true}]' : '';
      }

      const combinator = `$${rg.combinator}`;

      const expression: string = rg.rules
        .map((rule) => {
          if (isRuleGroup(rule)) {
            const processedRuleGroup = processRuleGroup(rule);
            return processedRuleGroup ? `{${processedRuleGroup}}` : '';
          } else {
            const mongoOperator = mongoOperators[rule.operator];
            let value = rule.value;

            if (typeof rule.value !== 'boolean') {
              value = `"${rule.value}"`;
            }

            if (['<', '<=', '=', '!=', '>', '>='].includes(rule.operator)) {
              return `{${rule.field}:{${mongoOperator}:${value}}}`;
            } else if (rule.operator === 'contains') {
              return `{${rule.field}:/${rule.value}/}`;
            } else if (rule.operator === 'beginsWith') {
              return `{${rule.field}:/^${rule.value}/}`;
            } else if (rule.operator === 'endsWith') {
              return `{${rule.field}:/${rule.value}$/}`;
            } else if (rule.operator === 'doesNotContain') {
              return `{${rule.field}:{$not:/${rule.value}/}}`;
            } else if (rule.operator === 'doesNotBeginWith') {
              return `{${rule.field}:{$not:/^${rule.value}/}}`;
            } else if (rule.operator === 'doesNotEndWith') {
              return `{${rule.field}:{$not:/${rule.value}$/}}`;
            } else if (rule.operator === 'null') {
              return `{${rule.field}:null}`;
            } else if (rule.operator === 'notNull') {
              return `{${rule.field}:{$ne:null}}`;
            } else if (rule.operator === 'in' || rule.operator === 'notIn') {
              const valArray = toArray(rule.value);
              if (valArray.length) {
                return `{${rule.field}:{${mongoOperator}:[${valArray.map((val: any) => {
                  return `"${val.trim()}"`;
                })}]}}`;
              } else {
                return '';
              }
            } else if (rule.operator === 'between' || rule.operator === 'notBetween') {
              const valArray = toArray(rule.value);
              if (valArray.length === 2 && !!valArray[0] && !!valArray[1]) {
                const [first, second] = valArray;
                if (rule.operator === 'between') {
                  return `{$and:[{${rule.field}:{$gte:"${first.trim()}"}},{${
                    rule.field
                  }:{$lte:"${second.trim()}"}}]}`;
                } else {
                  return `{$or:[{${rule.field}:{$lt:"${first.trim()}"}},{${
                    rule.field
                  }:{$gt:"${second.trim()}"}}]}`;
                }
              } else {
                return '';
              }
            }
          }

          return '';
        })
        .filter((e) => !!e)
        .join(',');

      return expression ? `${combinator}:[${expression}]` : '$and:[{$expr:true}]';
    };

    return `{${processRuleGroup(ruleGroup, true)}}`;
  } else {
    return '';
  }
};

export default formatQuery;
