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
} from '@react-querybuilder/ts/dist/types/src/index.noReact';
import { defaultPlaceholderFieldName, defaultPlaceholderOperatorName } from '../../defaults';
import { uniqByName } from '../../internal/uniq';
import { toArray } from '../arrayUtils';
import { convertFromIC } from '../convertQuery';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { defaultRuleProcessorCEL } from './defaultRuleProcessorCEL';
import { defaultRuleProcessorJsonLogic } from './defaultRuleProcessorJsonLogic';
import { defaultRuleProcessorMongoDB } from './defaultRuleProcessorMongoDB';
import { defaultRuleProcessorSpEL } from './defaultRuleProcessorSpEL';
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
  let quoteFieldNamesWith = '';
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
        ? r =>
            isValueProcessorLegacy(valueProcessor)
              ? valueProcessor(r.field, r.operator, r.value, r.valueSource)
              : valueProcessor(r, { parseNumbers })
        : format === 'mongodb'
        ? ruleProcessorInternal ?? defaultRuleProcessorMongoDB
        : format === 'cel'
        ? ruleProcessorInternal ?? defaultRuleProcessorCEL
        : format === 'spel'
        ? ruleProcessorInternal ?? defaultRuleProcessorSpEL
        : format === 'jsonlogic'
        ? ruleProcessorInternal ?? defaultRuleProcessorJsonLogic
        : defaultValueProcessorByRule;
    quoteFieldNamesWith = options.quoteFieldNamesWith ?? '';
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
        if (
          !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
          rule.field === placeholderFieldName ||
          rule.operator === placeholderOperatorName
        ) {
          return '';
        }

        const value = valueProcessorInternal(rule, {
          parseNumbers,
          escapeQuotes: format === 'sql' && (rule.valueSource ?? 'value') === 'value',
        });
        const operator = mapSQLOperator(rule.operator);

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
            if (
              !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
              rule.field === placeholderFieldName ||
              rule.operator === placeholderOperatorName
            ) {
              return '';
            }
            return (ruleProcessorInternal ?? valueProcessorInternal)(rule, { parseNumbers });
          })
          .filter(Boolean)
          .join(',');

        return expression ? `${combinator}:[${expression}]` : fallbackExpression;
      };

      const rgStandard = 'combinator' in ruleGroup ? ruleGroup : convertFromIC(ruleGroup);
      return `{${processRuleGroup(rgStandard, true)}}`;
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
            'combinator' in rg
              ? ` ${celCombinatorMap[rg.combinator as DefaultCombinatorName]} `
              : ' '
          );

        const [prefix, suffix] = rg.not || !outermost ? [`${rg.not ? '!' : ''}(`, ')'] : ['', ''];

        return expression ? `${prefix}${expression}${suffix}` : fallbackExpression;
      };

      return processRuleGroup(ruleGroup, true);
    } else if (format === 'spel') {
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
    } else if (format === 'jsonlogic') {
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
    } else {
      return '';
    }
  }
}

export { formatQuery };
