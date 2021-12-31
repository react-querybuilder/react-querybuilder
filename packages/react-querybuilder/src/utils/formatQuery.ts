import type {
  ExportFormat,
  FormatQueryOptions,
  ParameterizedNamedSQL,
  ParameterizedSQL,
  QueryValidator,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleType,
  RuleValidator,
  ValidationMap,
  ValidationResult,
  ValueProcessor,
} from '../types';
import { isRuleOrGroupValid } from './isRuleOrGroupValid';
import { uniqByName } from './uniq';

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
  '>=': '$gte',
  in: '$in',
  notIn: '$nin',
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
    if (valArray.length >= 2 && !!valArray[0] && !!valArray[1]) {
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

export const defaultMongoDBValueProcessor: ValueProcessor = (
  _field: string,
  operator: string,
  value: any
) => {
  const mongoOperator = mongoOperators[operator];
  if (['<', '<=', '=', '!=', '>', '>='].includes(operator)) {
    return `{"${mongoOperator}":${typeof value === 'boolean' ? value : `"${value}"`}}`;
  } else if (['between', 'notBetween'].includes(operator)) {
    return typeof value === 'boolean' ? `${value}` : `"${value}"`;
  } else if (operator === 'contains') {
    return `{"$regex":"${value}"}`;
  } else if (operator === 'beginsWith') {
    return `{"$regex":"^${value}"}`;
  } else if (operator === 'endsWith') {
    return `{"$regex":"${value}$"}`;
  } else if (operator === 'doesNotContain') {
    return `{"$not":{"$regex":"${value}"}}`;
  } else if (operator === 'doesNotBeginWith') {
    return `{"$not":{"$regex":"^${value}"}}`;
  } else if (operator === 'doesNotEndWith') {
    return `{"$not":{"$regex":"${value}$"}}`;
  } else if (operator === 'null') {
    return `null`;
  } else if (operator === 'notNull') {
    return `{"$ne":null}`;
  } else if (operator === 'in' || operator === 'notIn') {
    const valArray = toArray(value);
    if (valArray.length) {
      return `{"${mongoOperator}":[${valArray.map((val: any) => {
        return `"${val.trim()}"`;
      })}]}`;
    } else {
      return '';
    }
  }
  return '';
};

/**
 * Formats a query in the requested output format.
 */
export function formatQuery(ruleGroup: RuleGroupTypeAny): string;
export function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'parameterized' | (Omit<FormatQueryOptions, 'format'> & { format: 'parameterized' })
): ParameterizedSQL;
export function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options:
    | 'parameterized_named'
    | (Omit<FormatQueryOptions, 'format'> & { format: 'parameterized_named' })
): ParameterizedNamedSQL;
export function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: Omit<FormatQueryOptions, 'format'>
): string;
export function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: Exclude<ExportFormat, 'parameterized' | 'parameterized_named'>
): string;
export function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: Omit<FormatQueryOptions, 'format'> & {
    format: Exclude<ExportFormat, 'parameterized' | 'parameterized_named'>;
  }
): string;
export function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options?: FormatQueryOptions | ExportFormat
) {
  let format: ExportFormat = 'json';
  let valueProcessor = defaultValueProcessor;
  let quoteFieldNamesWith = '';
  let validator: QueryValidator = () => true;
  let fields: { name: string; validator?: RuleValidator; [k: string]: any }[] = [];
  let validationMap: ValidationMap = {};
  let fallbackExpression = '';
  let paramPrefix = ':';

  if (typeof options === 'object' && options !== null) {
    format = (options.format ?? 'json').toLowerCase() as ExportFormat;
    valueProcessor =
      options.valueProcessor ??
      (format === 'mongodb' ? defaultMongoDBValueProcessor : defaultValueProcessor);
    quoteFieldNamesWith = options.quoteFieldNamesWith ?? '';
    validator = options.validator ?? (() => true);
    fields = options.fields ?? [];
    fallbackExpression = options.fallbackExpression ?? '';
    paramPrefix = options.paramPrefix ?? ':';
  } else if (typeof options === 'string') {
    format = options.toLowerCase() as ExportFormat;
    if (format === 'mongodb') {
      valueProcessor = defaultMongoDBValueProcessor;
    }
  }
  if (!fallbackExpression) {
    if (format === 'sql' || format === 'parameterized' || format === 'parameterized_named') {
      fallbackExpression = '(1 = 1)';
    } else if (format === 'mongodb') {
      fallbackExpression = '"$and":[{"$expr":true}]';
    }
  }

  if (format === 'json') {
    return JSON.stringify(ruleGroup, null, 2);
  } else if (format === 'json_without_ids') {
    return JSON.stringify(ruleGroup, ['rules', 'field', 'value', 'operator', 'combinator', 'not']);
  } else if (format === 'sql' || format === 'parameterized' || format === 'parameterized_named') {
    const parameterized = format === 'parameterized';
    const parameterized_named = format === 'parameterized_named';
    const params: any[] = [];
    const params_named: { [p: string]: any } = {};
    const fieldParamIndexes: { [f: string]: number } = {};

    const getNextNamedParam = (field: string) => {
      fieldParamIndexes[field] = (fieldParamIndexes[field] ?? 0) + 1;
      return `${field}_${fieldParamIndexes[field]}`;
    };

    // istanbul ignore else
    if (typeof validator === 'function') {
      const validationResult = validator(ruleGroup);
      if (typeof validationResult === 'boolean') {
        if (validationResult === false) {
          return parameterized
            ? { sql: fallbackExpression, params: [] }
            : parameterized_named
            ? { sql: fallbackExpression, params: {} }
            : fallbackExpression;
        }
      } else {
        validationMap = validationResult;
      }
    }

    const validatorMap: { [f: string]: RuleValidator } = {};
    const uniqueFields = uniqByName(fields);
    uniqueFields.forEach(f => {
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
        const fieldArr = fields.filter(f => f.name === rule.field);
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

      if (parameterized || parameterized_named) {
        if (operator.toLowerCase() === 'is null' || operator.toLowerCase() === 'is not null') {
          return `${quoteFieldNamesWith}${rule.field}${quoteFieldNamesWith} ${operator}`;
        } else if (operator.toLowerCase() === 'in' || operator.toLowerCase() === 'not in') {
          if (value) {
            const splitValue = (rule.value as string).split(',').map(v => v.trim());
            if (parameterized) {
              splitValue.forEach(v => params.push(v));
              return `${quoteFieldNamesWith}${
                rule.field
              }${quoteFieldNamesWith} ${operator} (${splitValue.map(() => '?').join(', ')})`;
            }
            const inParams: string[] = [];
            splitValue.forEach(v => {
              const thisParamName = getNextNamedParam(rule.field);
              inParams.push(`${paramPrefix}${thisParamName}`);
              params_named[thisParamName] = v;
            });
            return `${quoteFieldNamesWith}${
              rule.field
            }${quoteFieldNamesWith} ${operator} (${inParams.join(', ')})`;
          } else {
            return '';
          }
        } else if (
          operator.toLowerCase() === 'between' ||
          operator.toLowerCase() === 'not between'
        ) {
          if (value) {
            const [first, second] = toArray(rule.value).map(v => v.trim());
            if (parameterized) {
              params.push(first);
              params.push(second);
              return `${quoteFieldNamesWith}${rule.field}${quoteFieldNamesWith} ${operator} ? and ?`;
            }
            const firstParamName = getNextNamedParam(rule.field);
            const secondParamName = getNextNamedParam(rule.field);
            params_named[firstParamName] = first;
            params_named[secondParamName] = second;
            return `${quoteFieldNamesWith}${rule.field}${quoteFieldNamesWith} ${operator} ${paramPrefix}${firstParamName} and ${paramPrefix}${secondParamName}`;
          } else {
            return '';
          }
        }
        const thisValue = ['boolean', 'number'].includes(typeof rule.value)
          ? rule.value
          : (value as string).match(/^'?(.*?)'?$/)![1];
        let thisParamName = '';
        if (parameterized) {
          params.push(thisValue);
        } else {
          thisParamName = getNextNamedParam(rule.field);
          params_named[thisParamName] = thisValue;
        }
        return `${quoteFieldNamesWith}${rule.field}${quoteFieldNamesWith} ${operator} ${
          parameterized ? '?' : `${paramPrefix}${thisParamName}`
        }`.trim();
      } else {
        if (['in', 'not in', 'between', 'not between'].includes(operator.toLowerCase()) && !value) {
          return '';
        }
      }
      return `${quoteFieldNamesWith}${rule.field}${quoteFieldNamesWith} ${operator} ${value}`.trim();
    };

    const processRuleGroup = (rg: RuleGroupTypeAny, outermost?: boolean): string => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
        return outermost ? fallbackExpression : '';
      }

      const processedRules = rg.rules.map(rule => {
        if (typeof rule === 'string') {
          return rule;
        }
        if ('rules' in rule) {
          return processRuleGroup(rule);
        }
        return processRule(rule);
      });

      if (processedRules.length === 0) {
        return fallbackExpression;
      }

      return `${rg.not ? 'NOT ' : ''}(${processedRules
        .filter(r => !!r)
        .join('combinator' in rg ? ` ${rg.combinator} ` : ' ')})`;
    };

    if (parameterized) {
      return { sql: processRuleGroup(ruleGroup, true), params };
    } else if (parameterized_named) {
      return { sql: processRuleGroup(ruleGroup, true), params: params_named };
    } else {
      return processRuleGroup(ruleGroup, true);
    }
  } else if (format === 'mongodb') {
    // istanbul ignore else
    if (typeof validator === 'function') {
      const validationResult = validator(ruleGroup);
      if (typeof validationResult === 'boolean') {
        if (validationResult === false) {
          return `{${fallbackExpression}}`;
        }
      } else {
        validationMap = validationResult;
      }
    }

    const processRuleGroup = (rg: RuleGroupType, outermost?: boolean) => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
        return outermost ? fallbackExpression : '';
      }

      const combinator = `"$${rg.combinator}"`;

      const expression: string = rg.rules
        .map(rule => {
          if ('rules' in rule) {
            const processedRuleGroup = processRuleGroup(rule);
            return processedRuleGroup ? `{${processedRuleGroup}}` : '';
          } else {
            const value = valueProcessor(rule.field, rule.operator, rule.value);
            if (
              [
                '<',
                '<=',
                '=',
                '!=',
                '>',
                '>=',
                'contains',
                'beginsWith',
                'endsWith',
                'doesNotContain',
                'doesNotBeginWith',
                'doesNotEndWith',
                'null',
                'notNull',
              ].includes(rule.operator) ||
              ((rule.operator === 'in' || rule.operator === 'notIn') && rule.value)
            ) {
              return `{"${rule.field}":${value}}`;
            } else if (rule.operator === 'between' || rule.operator === 'notBetween') {
              const valArray = toArray(rule.value);
              if (valArray.length >= 2 && !!valArray[0] && !!valArray[1]) {
                const [first, second] = valArray;
                const firstValue = valueProcessor(
                  rule.field,
                  rule.operator,
                  /* istanbul ignore next */
                  typeof first === 'string' ? first.trim() : first
                );
                const secondValue = valueProcessor(
                  rule.field,
                  rule.operator,
                  /* istanbul ignore next */
                  typeof second === 'string' ? second.trim() : second
                );
                if (rule.operator === 'between') {
                  return `{"$and":[{"${rule.field}":{"$gte":${firstValue}}},{"${rule.field}":{"$lte":${secondValue}}}]}`;
                } else {
                  return `{"$or":[{"${rule.field}":{"$lt":${firstValue}}},{"${rule.field}":{"$gt":${secondValue}}}]}`;
                }
              } else {
                return '';
              }
            }
          }

          return '';
        })
        .filter(e => !!e)
        .join(',');

      return expression ? `${combinator}:[${expression}]` : fallbackExpression;
    };

    // "mongodb" export type doesn't currently support independent combinators
    if ('combinator' in ruleGroup) {
      return `{${processRuleGroup(ruleGroup, true)}}`;
    }
    return `{${fallbackExpression}}`;
  } else {
    return '';
  }
}
