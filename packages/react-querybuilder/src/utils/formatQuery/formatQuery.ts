import type {
  DefaultCombinatorName,
  ExportFormat,
  FormatQueryOptions,
  ParameterizedNamedSQL,
  ParameterizedSQL,
  QueryValidator,
  RQBJsonLogic,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleProcessor,
  RuleType,
  RuleValidator,
  ValidationMap,
  ValidationResult,
} from '@react-querybuilder/ts/dist/index.noReact';
import { defaultPlaceholderFieldName, defaultPlaceholderOperatorName } from '../../defaults';
import { toArray } from '../arrayUtils';
import { convertFromIC } from '../convertQuery';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { uniqByName } from '../uniq';
import { defaultRuleProcessorCEL } from './defaultRuleProcessorCEL';
import { defaultRuleProcessorJsonLogic } from './defaultRuleProcessorJsonLogic';
import { defaultRuleProcessorMongoDB } from './defaultRuleProcessorMongoDB';
import { defaultRuleProcessorSpEL } from './defaultRuleProcessorSpEL';
import { defaultRuleProcessorSQL } from './defaultRuleProcessorSQL';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';
import {
  celCombinatorMap,
  isValueProcessorLegacy,
  mapSQLOperator,
  numerifyValues,
  shouldRenderAsNumber,
} from './utils';

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
  options: 'jsonlogic' | (Omit<FormatQueryOptions, 'format'> & { format: 'jsonlogic' })
): RQBJsonLogic;
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: Omit<FormatQueryOptions, 'format'>
): string;
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: Exclude<ExportFormat, 'parameterized' | 'parameterized_named' | 'jsonlogic'>
): string;
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: Omit<FormatQueryOptions, 'format'> & {
    format: Exclude<ExportFormat, 'parameterized' | 'parameterized_named' | 'jsonlogic'>;
  }
): string;
function formatQuery(ruleGroup: RuleGroupTypeAny, options: FormatQueryOptions | ExportFormat = {}) {
  let format: ExportFormat = 'json';
  let valueProcessorInternal = defaultValueProcessorByRule;
  let ruleProcessorInternal: RuleProcessor | null = null;
  let quoteFieldNamesWith: [string, string] = ['', ''];
  let validator: QueryValidator = () => true;
  let fields: Required<FormatQueryOptions>['fields'] = [];
  let validationMap: ValidationMap = {};
  let fallbackExpression = '';
  let paramPrefix = ':';
  let parseNumbers = false;
  let placeholderFieldName = defaultPlaceholderFieldName;
  let placeholderOperatorName = defaultPlaceholderOperatorName;

  if (typeof options === 'string') {
    format = options.toLowerCase() as ExportFormat;
    if (format === 'mongodb') {
      ruleProcessorInternal = defaultRuleProcessorMongoDB;
    } else if (format === 'cel') {
      ruleProcessorInternal = defaultRuleProcessorCEL;
    } else if (format === 'spel') {
      ruleProcessorInternal = defaultRuleProcessorSpEL;
    } else if (format === 'jsonlogic') {
      ruleProcessorInternal = defaultRuleProcessorJsonLogic;
    }
  } else {
    format = (options.format ?? 'json').toLowerCase() as ExportFormat;
    const { valueProcessor = null, ruleProcessor = null } = options;
    if (typeof ruleProcessor === 'function') {
      ruleProcessorInternal = ruleProcessor;
    }
    valueProcessorInternal =
      typeof valueProcessor === 'function'
        ? (r, opts) =>
            isValueProcessorLegacy(valueProcessor)
              ? valueProcessor(r.field, r.operator, r.value, r.valueSource)
              : valueProcessor(r, opts)
        : format === 'mongodb'
        ? ruleProcessorInternal ?? defaultRuleProcessorMongoDB
        : format === 'cel'
        ? ruleProcessorInternal ?? defaultRuleProcessorCEL
        : format === 'spel'
        ? ruleProcessorInternal ?? defaultRuleProcessorSpEL
        : format === 'jsonlogic'
        ? ruleProcessorInternal ?? defaultRuleProcessorJsonLogic
        : defaultValueProcessorByRule;
    if (Array.isArray(options.quoteFieldNamesWith)) {
      quoteFieldNamesWith = options.quoteFieldNamesWith;
    } else if (typeof options.quoteFieldNamesWith === 'string') {
      quoteFieldNamesWith = [options.quoteFieldNamesWith, options.quoteFieldNamesWith];
    }
    validator = options.validator ?? (() => true);
    fields = options.fields ?? [];
    fallbackExpression = options.fallbackExpression ?? '';
    paramPrefix = options.paramPrefix ?? ':';
    parseNumbers = !!options.parseNumbers;
    placeholderFieldName = options.placeholderFieldName ?? defaultPlaceholderFieldName;
    placeholderOperatorName = options.placeholderOperatorName ?? defaultPlaceholderOperatorName;
  }
  if (!fallbackExpression) {
    fallbackExpression =
      format === 'mongodb'
        ? '"$and":[{"$expr":true}]'
        : format === 'cel' || format === 'spel'
        ? '1 == 1'
        : '(1 = 1)';
  }

  /**
   * JSON
   */
  if (format === 'json' || format === 'json_without_ids') {
    const rg = parseNumbers ? numerifyValues(ruleGroup) : ruleGroup;
    if (format === 'json') {
      return JSON.stringify(rg, null, 2);
    }
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
          : format === 'jsonlogic'
          ? false
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

  /**
   * SQL
   */
  if (format === 'sql') {
    const processRuleGroup = (rg: RuleGroupTypeAny, outermost?: boolean): string => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
        return outermost ? fallbackExpression : '';
      }

      const processedRules = rg.rules.map(rule => {
        // Independent combinators
        if (typeof rule === 'string') {
          return rule;
        }

        // Groups
        if ('rules' in rule) {
          return processRuleGroup(rule);
        }

        // Basic rule validation
        const [validationResult, fieldValidator] = validateRule(rule);
        if (
          !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
          rule.field === placeholderFieldName ||
          rule.operator === placeholderOperatorName
        ) {
          return '';
        }

        const escapeQuotes = (rule.valueSource ?? 'value') === 'value';

        // Use custom rule processor if provided...
        if (typeof ruleProcessorInternal === 'function') {
          return ruleProcessorInternal(rule, { parseNumbers, escapeQuotes });
        }
        // ...otherwise use default rule processor and pass in the value
        // processor (which may be custom)
        return defaultRuleProcessorSQL(rule, {
          parseNumbers,
          escapeQuotes,
          valueProcessor: valueProcessorInternal,
          quoteFieldNamesWith,
        });
      });

      if (processedRules.length === 0) {
        return fallbackExpression;
      }

      return `${rg.not ? 'NOT ' : ''}(${processedRules
        .filter(Boolean)
        .join('combinator' in rg ? ` ${rg.combinator} ` : ' ')})`;
    };

    return processRuleGroup(ruleGroup, true);
  }

  /**
   * Parameterized SQL
   */
  if (format === 'parameterized' || format === 'parameterized_named') {
    const parameterized = format === 'parameterized';
    const params: any[] = [];
    const params_named: Record<string, any> = {};
    const fieldParamIndexes: Record<string, number> = {};

    const getNextNamedParam = (field: string) => {
      fieldParamIndexes[field] = (fieldParamIndexes[field] ?? 0) + 1;
      return `${field}_${fieldParamIndexes[field]}`;
    };

    const processRule = (rule: RuleType) => {
      const [validationResult, fieldValidator] = validateRule(rule);
      if (
        !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
        rule.field === placeholderFieldName ||
        rule.operator === placeholderOperatorName
      ) {
        return '';
      }

      const value = valueProcessorInternal(rule, { parseNumbers });
      const operator = mapSQLOperator(rule.operator);

      if ((rule.valueSource ?? 'value') === 'value') {
        if (operator.toLowerCase() === 'is null' || operator.toLowerCase() === 'is not null') {
          return `${quoteFieldNamesWith[0]}${rule.field}${quoteFieldNamesWith[1]} ${operator}`;
        } else if (operator.toLowerCase() === 'in' || operator.toLowerCase() === 'not in') {
          if (value) {
            const splitValue = toArray(rule.value);
            if (parameterized) {
              splitValue.forEach(v =>
                params.push(shouldRenderAsNumber(v, parseNumbers) ? parseFloat(v) : v)
              );
              return `${quoteFieldNamesWith[0]}${rule.field}${
                quoteFieldNamesWith[1]
              } ${operator} (${splitValue.map(() => '?').join(', ')})`;
            }
            const inParams: string[] = [];
            splitValue.forEach(v => {
              const thisParamName = getNextNamedParam(rule.field);
              inParams.push(`${paramPrefix}${thisParamName}`);
              params_named[thisParamName] = shouldRenderAsNumber(v, parseNumbers)
                ? parseFloat(v)
                : v;
            });
            return `${quoteFieldNamesWith[0]}${rule.field}${
              quoteFieldNamesWith[1]
            } ${operator} (${inParams.join(', ')})`;
          } else {
            return '';
          }
        } else if (
          operator.toLowerCase() === 'between' ||
          operator.toLowerCase() === 'not between'
        ) {
          if (value) {
            const valueAsArray = toArray(rule.value);
            const [first, second] = valueAsArray
              .slice(0, 2)
              .map(v => (shouldRenderAsNumber(v, parseNumbers) ? parseFloat(v) : v));
            if (parameterized) {
              params.push(first);
              params.push(second);
              return `${quoteFieldNamesWith[0]}${rule.field}${quoteFieldNamesWith[1]} ${operator} ? and ?`;
            }
            const firstParamName = getNextNamedParam(rule.field);
            const secondParamName = getNextNamedParam(rule.field);
            params_named[firstParamName] = first;
            params_named[secondParamName] = second;
            return `${quoteFieldNamesWith[0]}${rule.field}${quoteFieldNamesWith[1]} ${operator} ${paramPrefix}${firstParamName} and ${paramPrefix}${secondParamName}`;
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
            paramValue = /^'.*'$/g.test(value)
              ? value.replace(/(^'|'$)/g, '')
              : /* istanbul ignore next */ value;
          }
        }
        let paramName = '';
        if (parameterized) {
          params.push(paramValue);
        } else {
          paramName = getNextNamedParam(rule.field);
          params_named[paramName] = paramValue;
        }
        return `${quoteFieldNamesWith[0]}${rule.field}${quoteFieldNamesWith[1]} ${operator} ${
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
      return `${quoteFieldNamesWith[0]}${rule.field}${quoteFieldNamesWith[1]} ${operator} ${value}`.trim();
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
    }
    return { sql: processRuleGroup(ruleGroup, true), params: params_named };
  }

  /**
   * MongoDB
   */
  if (format === 'mongodb') {
    const processRuleGroup = (rg: RuleGroupType, outermost?: boolean) => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
        return outermost ? fallbackExpression : '';
      }

      const combinator = `"$${rg.combinator.toLowerCase()}"`;
      let hasChildRules = false;

      const expressions: string[] = rg.rules
        .map(rule => {
          if ('rules' in rule) {
            const processedRuleGroup = processRuleGroup(rule);
            if (processedRuleGroup) {
              hasChildRules = true;
              // Don't wrap in curly braces if the result already is.
              return /^\{.+\}$/.test(processedRuleGroup)
                ? processedRuleGroup
                : `{${processedRuleGroup}}`;
            }
            return '';
          }
          const [validationResult, fieldValidator] = validateRule(rule);
          if (
            !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
            rule.field === placeholderFieldName ||
            rule.operator === placeholderOperatorName
          ) {
            return '';
          }
          return (ruleProcessorInternal ?? valueProcessorInternal)(rule, { parseNumbers });
        })
        .filter(Boolean);

      return expressions.length > 0
        ? expressions.length === 1 && !hasChildRules
          ? expressions[0]
          : `${combinator}:[${expressions.join(',')}]`
        : fallbackExpression;
    };

    const rgStandard = 'combinator' in ruleGroup ? ruleGroup : convertFromIC(ruleGroup);
    const processedQuery = processRuleGroup(rgStandard, true);
    return /^\{.+\}$/.test(processedQuery) ? processedQuery : `{${processedQuery}}`;
  }

  /**
   * CEL
   */
  if (format === 'cel') {
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
          if (
            !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
            rule.field === placeholderFieldName ||
            rule.operator === placeholderOperatorName
          ) {
            return '';
          }
          return (ruleProcessorInternal ?? valueProcessorInternal)(rule, {
            parseNumbers,
            escapeQuotes: (rule.valueSource ?? 'value') === 'value',
          });
        })
        .filter(Boolean)
        .join(
          'combinator' in rg ? ` ${celCombinatorMap[rg.combinator as DefaultCombinatorName]} ` : ' '
        );

      const [prefix, suffix] = rg.not || !outermost ? [`${rg.not ? '!' : ''}(`, ')'] : ['', ''];

      return expression ? `${prefix}${expression}${suffix}` : fallbackExpression;
    };

    return processRuleGroup(ruleGroup, true);
  }

  /**
   * SpEL
   */
  if (format === 'spel') {
    const processRuleGroup = (rg: RuleGroupTypeAny, outermost?: boolean) => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
        return outermost ? fallbackExpression : '';
      }

      const expression: string = rg.rules
        .map(rule => {
          if (typeof rule === 'string') {
            return rule;
          }
          if ('rules' in rule) {
            return processRuleGroup(rule);
          }
          const [validationResult, fieldValidator] = validateRule(rule);
          if (
            !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
            rule.field === placeholderFieldName ||
            rule.operator === placeholderOperatorName
          ) {
            return '';
          }
          return (ruleProcessorInternal ?? valueProcessorInternal)(rule, {
            parseNumbers,
            escapeQuotes: (rule.valueSource ?? 'value') === 'value',
          });
        })
        .filter(Boolean)
        .join('combinator' in rg ? ` ${rg.combinator} ` : ' ');

      const [prefix, suffix] = rg.not || !outermost ? [`${rg.not ? '!' : ''}(`, ')'] : ['', ''];

      return expression ? `${prefix}${expression}${suffix}` : fallbackExpression;
    };

    return processRuleGroup(ruleGroup, true);
  }

  /**
   * JsonLogic
   */
  if (format === 'jsonlogic') {
    const query = 'combinator' in ruleGroup ? ruleGroup : convertFromIC(ruleGroup);

    const processRuleGroup = (rg: RuleGroupType): RQBJsonLogic => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
        return false;
      }

      const processedRules = rg.rules
        .map(rule => {
          if ('rules' in rule) {
            return processRuleGroup(rule);
          }
          const [validationResult, fieldValidator] = validateRule(rule);
          if (
            !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
            rule.field === placeholderFieldName ||
            rule.operator === placeholderOperatorName
          ) {
            return false;
          }
          return (ruleProcessorInternal ?? valueProcessorInternal)(rule, { parseNumbers });
        })
        .filter(Boolean);

      if (processedRules.length === 0) {
        return false;
      }

      const jsonRuleGroup: RQBJsonLogic =
        processedRules.length === 1
          ? processedRules[0]
          : ({
              [rg.combinator]: processedRules,
            } as {
              [k in keyof DefaultCombinatorName]: [RQBJsonLogic, RQBJsonLogic, ...RQBJsonLogic[]];
            });

      return rg.not ? { '!': jsonRuleGroup } : jsonRuleGroup;
    };

    return processRuleGroup(query);
  }

  return '';
}

export { formatQuery };
