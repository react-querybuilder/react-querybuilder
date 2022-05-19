import type {
  DefaultCombinatorName,
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
  ValueProcessorInternal,
} from '../types';
import { isRuleOrGroupValid } from './isRuleOrGroupValid';
import { uniqByName } from './uniq';

const numericRegex = /^\s*[+-]?(\d+|\d*\.\d+|\d+\.\d*)([Ee][+-]?\d+)?\s*$/;

const trimIfString = (val: any) => (typeof val === 'string' ? val.trim() : val);

const toArray = (v: any) =>
  (Array.isArray(v)
    ? v
    : typeof v === 'string'
    ? v.split(',').filter(s => !/^\s*$/.test(s))
    : []
  ).map(trimIfString);

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

const mongoOperators = {
  '=': '$eq',
  '!=': '$ne',
  '<': '$lt',
  '<=': '$lte',
  '>': '$gt',
  '>=': '$gte',
  in: '$in',
  notIn: '$nin',
};

const celCombinatorMap: Record<DefaultCombinatorName, '&&' | '||'> = {
  and: '&&',
  or: '||',
};

const numerifyValues = (rg: RuleGroupTypeAny): RuleGroupTypeAny => ({
  ...rg,
  rules: rg.rules.map(r => {
    if (typeof r === 'string') {
      return r;
    } else if ('rules' in r) {
      return numerifyValues(r);
    }
    let { value } = r;
    if (typeof value === 'string' && numericRegex.test(value)) {
      value = parseFloat(value);
    }
    // if (toArray(value).length > 1) {
    //   return { ...r, value };
    // }
    // if (typeof value === 'number' && !isNaN(value)) {
    //   return { ...r, value };
    // }
    return { ...r, value };
  }) as any, // TODO: use a better type?
});

const isValidValue = (v: any) =>
  (typeof v === 'string' && v.length > 0) ||
  (typeof v === 'number' && !isNaN(v)) ||
  (typeof v !== 'string' && typeof v !== 'number');

const shouldRenderAsNumber = (v: any, parseNumbers?: boolean) =>
  !!parseNumbers &&
  (typeof v === 'number' ||
    typeof v === 'bigint' ||
    (typeof v === 'string' && numericRegex.test(v)));

export const defaultValueProcessor: ValueProcessor = (field, operator, value, valueSource) =>
  defaultValueProcessorInternal({ field, operator, value, valueSource }, { parseNumbers: false });

const defaultValueProcessorInternal: ValueProcessorInternal = (
  { operator, value, valueSource },
  { parseNumbers }
) => {
  const valueIsField = valueSource === 'field';
  const operatorLowerCase = operator.toLowerCase();
  if (operatorLowerCase === 'null' || operatorLowerCase === 'notnull') {
    return '';
  } else if (operatorLowerCase === 'in' || operatorLowerCase === 'notin') {
    const valArray = toArray(value);
    if (valArray.length > 0) {
      return `(${valArray
        .map(v =>
          valueIsField || shouldRenderAsNumber(v, parseNumbers) ? `${trimIfString(v)}` : `'${v}'`
        )
        .join(', ')})`;
    } else {
      return '';
    }
  } else if (operatorLowerCase === 'between' || operatorLowerCase === 'notbetween') {
    const valArray = toArray(value);
    if (valArray.length >= 2 && isValidValue(valArray[0]) && isValidValue(valArray[1])) {
      const [first, second] = valArray;
      return valueIsField ||
        (shouldRenderAsNumber(first, parseNumbers) && shouldRenderAsNumber(second, parseNumbers))
        ? `${trimIfString(first)} and ${trimIfString(second)}`
        : `'${first}' and '${second}'`;
    } else {
      return '';
    }
  } else if (operatorLowerCase === 'contains' || operatorLowerCase === 'doesnotcontain') {
    return valueIsField ? `'%' || ${value} || '%'` : `'%${value}%'`;
  } else if (operatorLowerCase === 'beginswith' || operatorLowerCase === 'doesnotbeginwith') {
    return valueIsField ? `${value} || '%'` : `'${value}%'`;
  } else if (operatorLowerCase === 'endswith' || operatorLowerCase === 'doesnotendwith') {
    return valueIsField ? `'%' || ${value}` : `'%${value}'`;
  } else if (typeof value === 'boolean') {
    return `${value}`.toUpperCase();
  }
  return valueIsField || shouldRenderAsNumber(value, parseNumbers)
    ? `${trimIfString(value)}`
    : `'${value}'`;
};

export const defaultMongoDBValueProcessor: ValueProcessor = (field, operator, value, valueSource) =>
  defaultMongoDBValueProcessorInternal(
    { field, operator, value, valueSource },
    { parseNumbers: false }
  );

const defaultMongoDBValueProcessorInternal: ValueProcessorInternal = (
  { field, operator, value, valueSource },
  { parseNumbers }
) => {
  const valueIsField = valueSource === 'field';
  const useBareValue =
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    shouldRenderAsNumber(value, parseNumbers);
  if (
    operator === '<' ||
    operator === '<=' ||
    operator === '=' ||
    operator === '!=' ||
    operator === '>' ||
    operator === '>='
  ) {
    const mongoOperator = mongoOperators[operator];
    return valueIsField
      ? `{"$expr":{"${mongoOperator}":["$${field}","$${value}"]}}`
      : `{"${field}":{"${mongoOperator}":${useBareValue ? trimIfString(value) : `"${value}"`}}}`;
  } else if (operator === 'contains') {
    return valueIsField
      ? `{"$where":"this.${field}.includes(this.${value})"}`
      : `{"${field}":{"$regex":"${value}"}}`;
  } else if (operator === 'beginsWith') {
    return valueIsField
      ? `{"$where":"this.${field}.startsWith(this.${value})"}`
      : `{"${field}":{"$regex":"^${value}"}}`;
  } else if (operator === 'endsWith') {
    return valueIsField
      ? `{"$where":"this.${field}.endsWith(this.${value})"}`
      : `{"${field}":{"$regex":"${value}$"}}`;
  } else if (operator === 'doesNotContain') {
    return valueIsField
      ? `{"$where":"!this.${field}.includes(this.${value})"}`
      : `{"${field}":{"$not":{"$regex":"${value}"}}}`;
  } else if (operator === 'doesNotBeginWith') {
    return valueIsField
      ? `{"$where":"!this.${field}.startsWith(this.${value})"}`
      : `{"${field}":{"$not":{"$regex":"^${value}"}}}`;
  } else if (operator === 'doesNotEndWith') {
    return valueIsField
      ? `{"$where":"!this.${field}.endsWith(this.${value})"}`
      : `{"${field}":{"$not":{"$regex":"${value}$"}}}`;
  } else if (operator === 'null') {
    return `{"${field}":null}`;
  } else if (operator === 'notNull') {
    return `{"${field}":{"$ne":null}}`;
  } else if (operator === 'in' || operator === 'notIn') {
    const valArray = toArray(value);
    if (valArray.length > 0) {
      return valueIsField
        ? `{"$where":"${operator === 'notIn' ? '!' : ''}[${valArray
            .map(val => `this.${val}`)
            .join(',')}].includes(this.${field})"}`
        : `{"${field}":{"${mongoOperators[operator]}":[${valArray
            .map(val =>
              shouldRenderAsNumber(val, parseNumbers) ? `${trimIfString(val)}` : `"${val}"`
            )
            .join(',')}]}}`;
    } else {
      return '';
    }
  } else if (operator === 'between' || operator === 'notBetween') {
    const valArray = toArray(value);
    if (valArray.length >= 2 && isValidValue(valArray[0]) && isValidValue(valArray[1])) {
      const [first, second] = valArray;
      const firstNum = parseFloat(first);
      const secondNum = parseFloat(second);
      const firstValue = valueIsField || !isNaN(firstNum) ? `${first}` : `"${first}"`;
      const secondValue = valueIsField || !isNaN(secondNum) ? `${second}` : `"${second}"`;
      if (operator === 'between') {
        return valueIsField
          ? `{"$and":[{"$expr":{"$gte":["$${field}","$${firstValue}"]}},{"$expr":{"$lte":["$${field}","$${secondValue}"]}}]}`
          : `{"$and":[{"${field}":{"$gte":${firstValue}}},{"${field}":{"$lte":${secondValue}}}]}`;
      } else {
        return valueIsField
          ? `{"$or":[{"$expr":{"$lt":["$${field}","$${firstValue}"]}},{"$expr":{"$gt":["$${field}","$${secondValue}"]}}]}`
          : `{"$or":[{"${field}":{"$lt":${firstValue}}},{"${field}":{"$gt":${secondValue}}}]}`;
      }
    } else {
      return '';
    }
  }
  return '';
};

export const defaultCELValueProcessor: ValueProcessor = (field, operator, value, valueSource) =>
  defaultCELValueProcessorInternal(
    { field, operator, value, valueSource },
    { parseNumbers: false }
  );

const defaultCELValueProcessorInternal: ValueProcessorInternal = (
  { field, operator, value, valueSource },
  { parseNumbers }
) => {
  const valueIsField = valueSource === 'field';
  const operatorLowerCase = operator.toLowerCase().replace(/^=$/, '==');
  const useBareValue =
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    shouldRenderAsNumber(value, parseNumbers);
  if (
    operatorLowerCase === '<' ||
    operatorLowerCase === '<=' ||
    operatorLowerCase === '==' ||
    operatorLowerCase === '!=' ||
    operatorLowerCase === '>' ||
    operatorLowerCase === '>='
  ) {
    return `${field} ${operatorLowerCase} ${
      valueIsField || useBareValue ? trimIfString(value) : `"${value}"`
    }`;
  } else if (operatorLowerCase === 'contains' || operatorLowerCase === 'doesnotcontain') {
    const negate = operatorLowerCase === 'doesnotcontain' ? '!' : '';
    return `${negate}${field}.contains(${
      valueIsField || useBareValue ? trimIfString(value) : `"${value}"`
    })`;
  } else if (operatorLowerCase === 'beginswith' || operatorLowerCase === 'doesnotbeginwith') {
    const negate = operatorLowerCase === 'doesnotbeginwith' ? '!' : '';
    return `${negate}${field}.startsWith(${
      valueIsField || useBareValue ? trimIfString(value) : `"${value}"`
    })`;
  } else if (operatorLowerCase === 'endswith' || operatorLowerCase === 'doesnotendwith') {
    const negate = operatorLowerCase === 'doesnotendwith' ? '!' : '';
    return `${negate}${field}.endsWith(${
      valueIsField || useBareValue ? trimIfString(value) : `"${value}"`
    })`;
  } else if (operatorLowerCase === 'null') {
    return `${field} == null`;
  } else if (operatorLowerCase === 'notnull') {
    return `${field} != null`;
  } else if (operatorLowerCase === 'in' || operatorLowerCase === 'notin') {
    const negate = operatorLowerCase === 'notin';
    const valArray = toArray(value);
    if (valArray.length > 0) {
      return `${negate ? '!(' : ''}${field} in [${valArray
        .map(val =>
          valueIsField || shouldRenderAsNumber(val, parseNumbers)
            ? `${trimIfString(val)}`
            : `"${val}"`
        )
        .join(', ')}]${negate ? ')' : ''}`;
    } else {
      return '';
    }
  } else if (operatorLowerCase === 'between' || operatorLowerCase === 'notbetween') {
    const valArray = toArray(value);
    if (valArray.length >= 2 && !!valArray[0] && !!valArray[1]) {
      const [first, second] = valArray;
      const firstNum = parseFloat(first);
      const secondNum = parseFloat(second);
      let firstValue = isNaN(firstNum) ? (valueIsField ? `${first}` : `"${first}"`) : firstNum;
      let secondValue = isNaN(secondNum) ? (valueIsField ? `${second}` : `"${second}"`) : secondNum;
      if (firstValue === firstNum && secondValue === secondNum && secondNum < firstNum) {
        const tempNum = secondNum;
        secondValue = firstNum;
        firstValue = tempNum;
      }
      if (operator === 'between') {
        return `(${field} >= ${firstValue} && ${field} <= ${secondValue})`;
      } else {
        return `(${field} < ${firstValue} || ${field} > ${secondValue})`;
      }
    } else {
      return '';
    }
  }
  return '';
};

/**
 * Formats a query in the requested output format.
 */
function formatQuery(ruleGroup: RuleGroupTypeAny): string;
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'parameterized' | (Omit<FormatQueryOptions, 'format'> & { format: 'parameterized' })
): ParameterizedSQL;
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options:
    | 'parameterized_named'
    | (Omit<FormatQueryOptions, 'format'> & { format: 'parameterized_named' })
): ParameterizedNamedSQL;
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: Omit<FormatQueryOptions, 'format'>
): string;
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: Exclude<ExportFormat, 'parameterized' | 'parameterized_named'>
): string;
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: Omit<FormatQueryOptions, 'format'> & {
    format: Exclude<ExportFormat, 'parameterized' | 'parameterized_named'>;
  }
): string;
function formatQuery(ruleGroup: RuleGroupTypeAny, options: FormatQueryOptions | ExportFormat = {}) {
  let format: ExportFormat = 'json';
  let valueProcessorInternal = defaultValueProcessorInternal;
  let quoteFieldNamesWith = '';
  let validator: QueryValidator = () => true;
  let fields: Required<FormatQueryOptions>['fields'] = [];
  let validationMap: ValidationMap = {};
  let fallbackExpression = '';
  let paramPrefix = ':';
  let parseNumbers = false;

  if (typeof options === 'string') {
    format = options.toLowerCase() as ExportFormat;
    if (format === 'mongodb') {
      valueProcessorInternal = defaultMongoDBValueProcessorInternal;
    } else if (format === 'cel') {
      valueProcessorInternal = defaultCELValueProcessorInternal;
    }
  } else {
    format = (options.format ?? 'json').toLowerCase() as ExportFormat;
    const { valueProcessor = null } = options;
    valueProcessorInternal =
      typeof valueProcessor === 'function'
        ? r => valueProcessor(r.field, r.operator, r.value, r.valueSource)
        : format === 'mongodb'
        ? defaultMongoDBValueProcessorInternal
        : format === 'cel'
        ? defaultCELValueProcessorInternal
        : defaultValueProcessorInternal;
    quoteFieldNamesWith = options.quoteFieldNamesWith ?? '';
    validator = options.validator ?? (() => true);
    fields = options.fields ?? [];
    fallbackExpression = options.fallbackExpression ?? '';
    paramPrefix = options.paramPrefix ?? ':';
    parseNumbers = !!options.parseNumbers;
  }
  if (!fallbackExpression) {
    fallbackExpression =
      format === 'mongodb' ? '"$and":[{"$expr":true}]' : format === 'cel' ? '1 == 1' : '(1 = 1)';
  }

  if (format === 'json' || format === 'json_without_ids') {
    const rg = parseNumbers ? numerifyValues(ruleGroup) : ruleGroup;
    if (format === 'json') {
      return JSON.stringify(rg, null, 2);
    } else {
      return JSON.stringify(rg, [
        'rules',
        'field',
        'value',
        'operator',
        'combinator',
        'not',
        'valueSource',
      ]);
    }
  } else {
    // istanbul ignore else
    if (typeof validator === 'function') {
      const validationResult = validator(ruleGroup);
      if (typeof validationResult === 'boolean') {
        if (validationResult === false) {
          return format === 'parameterized'
            ? { sql: fallbackExpression, params: [] }
            : format === 'parameterized_named'
            ? { sql: fallbackExpression, params: {} }
            : format === 'mongodb'
            ? `{${fallbackExpression}}`
            : fallbackExpression;
        }
      } else {
        validationMap = validationResult;
      }
    }

    const validatorMap: Record<string, RuleValidator> = {};
    const uniqueFields = uniqByName(fields);
    uniqueFields.forEach(f => {
      // istanbul ignore else
      if (typeof f.validator === 'function') {
        validatorMap[f.name] = f.validator;
      }
    });

    const validateRule = (rule: RuleType) => {
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
      return [validationResult, fieldValidator] as const;
    };

    if (format === 'sql' || format === 'parameterized' || format === 'parameterized_named') {
      const parameterized = format === 'parameterized';
      const parameterized_named = format === 'parameterized_named';
      const params: any[] = [];
      const params_named: Record<string, any> = {};
      const fieldParamIndexes: Record<string, number> = {};

      const getNextNamedParam = (field: string) => {
        fieldParamIndexes[field] = (fieldParamIndexes[field] ?? 0) + 1;
        return `${field}_${fieldParamIndexes[field]}`;
      };

      const processRule = (rule: RuleType) => {
        const [validationResult, fieldValidator] = validateRule(rule);
        if (!isRuleOrGroupValid(rule, validationResult, fieldValidator)) {
          return '';
        }

        const value = valueProcessorInternal(rule, { parseNumbers });
        const operator = mapOperator(rule.operator);

        if ((parameterized || parameterized_named) && (rule.valueSource ?? 'value') === 'value') {
          if (operator.toLowerCase() === 'is null' || operator.toLowerCase() === 'is not null') {
            return `${quoteFieldNamesWith}${rule.field}${quoteFieldNamesWith} ${operator}`;
          } else if (operator.toLowerCase() === 'in' || operator.toLowerCase() === 'not in') {
            if (value) {
              const splitValue = toArray(rule.value);
              if (parameterized) {
                splitValue.forEach(v =>
                  params.push(shouldRenderAsNumber(v, parseNumbers) ? parseFloat(v) : v)
                );
                return `${quoteFieldNamesWith}${
                  rule.field
                }${quoteFieldNamesWith} ${operator} (${splitValue.map(() => '?').join(', ')})`;
              }
              const inParams: string[] = [];
              splitValue.forEach(v => {
                const thisParamName = getNextNamedParam(rule.field);
                inParams.push(`${paramPrefix}${thisParamName}`);
                params_named[thisParamName] = shouldRenderAsNumber(v, parseNumbers)
                  ? parseFloat(v)
                  : v;
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
              const valArray = toArray(rule.value);
              const [first, second] = valArray
                .slice(0, 2)
                .map(v => (shouldRenderAsNumber(v, parseNumbers) ? parseFloat(v) : v));
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
          let paramValue = rule.value;
          if (typeof rule.value === 'string') {
            if (shouldRenderAsNumber(rule.value, parseNumbers)) {
              paramValue = parseFloat(rule.value);
            } else {
              // Note that we're using `value` here, which has been processed through
              // a `valueProcessor`, as opposed to `rule.value` which has not
              paramValue = value.match(/^('?)([^']*?)(\1)$/)?.[2] ?? /* istanbul ignore next */ '';
            }
          }
          let paramName = '';
          if (parameterized) {
            params.push(paramValue);
          } else {
            paramName = getNextNamedParam(rule.field);
            params_named[paramName] = paramValue;
          }
          return `${quoteFieldNamesWith}${rule.field}${quoteFieldNamesWith} ${operator} ${
            parameterized ? '?' : `${paramPrefix}${paramName}`
          }`.trim();
        } else {
          const operatorLowerCase = operator.toLowerCase();
          if (
            (operatorLowerCase === 'in' ||
              operatorLowerCase === 'not in' ||
              operatorLowerCase === 'between' ||
              operatorLowerCase === 'not between') &&
            !value
          ) {
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
          .filter(Boolean)
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
            }
            const [validationResult, fieldValidator] = validateRule(rule);
            if (!isRuleOrGroupValid(rule, validationResult, fieldValidator)) {
              return '';
            }
            return valueProcessorInternal(rule, { parseNumbers });
          })
          .filter(Boolean)
          .join(',');

        return expression ? `${combinator}:[${expression}]` : fallbackExpression;
      };

      // "mongodb" export type does not currently support independent combinators
      if ('combinator' in ruleGroup) {
        return `{${processRuleGroup(ruleGroup, true)}}`;
      }
      return `{${fallbackExpression}}`;
    } else if (format === 'cel') {
      const processRuleGroup = (rg: RuleGroupTypeAny, outermost?: boolean) => {
        if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
          return outermost ? fallbackExpression : '';
        }

        const expression: string = rg.rules
          .map(rule => {
            if (typeof rule === 'string') {
              return celCombinatorMap[rule as DefaultCombinatorName];
            }
            if ('rules' in rule) {
              return processRuleGroup(rule);
            }
            const [validationResult, fieldValidator] = validateRule(rule);
            if (!isRuleOrGroupValid(rule, validationResult, fieldValidator)) {
              return '';
            }
            return valueProcessorInternal(rule, { parseNumbers });
          })
          .filter(Boolean)
          .join(
            'combinator' in rg
              ? ` ${celCombinatorMap[rg.combinator as DefaultCombinatorName]} `
              : ' '
          );

        const wrap =
          rg.not || !outermost ? { pre: `${rg.not ? '!' : ''}(`, suf: ')' } : { pre: '', suf: '' };

        return expression ? `${wrap.pre}${expression}${wrap.suf}` : fallbackExpression;
      };

      return processRuleGroup(ruleGroup, true);
    } else {
      return '';
    }
  }
}

export { formatQuery };
