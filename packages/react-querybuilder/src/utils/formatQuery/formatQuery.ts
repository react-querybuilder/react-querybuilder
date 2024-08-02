import { defaultPlaceholderFieldName, defaultPlaceholderOperatorName } from '../../defaults';
import type {
  DefaultCombinatorName,
  ExportFormat,
  FormatQueryOptions,
  FullField,
  FullOptionList,
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
} from '../../types/index.noReact';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup, isRuleGroupType } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { isPojo } from '../misc';
import { getOption, toFlatOptionArray } from '../optGroupUtils';
import { toFullOptionList } from '../toFullOption';
import { defaultRuleProcessorCEL } from './defaultRuleProcessorCEL';
import { defaultRuleProcessorElasticSearch } from './defaultRuleProcessorElasticSearch';
import { defaultRuleProcessorJSONata } from './defaultRuleProcessorJSONata';
import { defaultRuleProcessorJsonLogic } from './defaultRuleProcessorJsonLogic';
import { defaultRuleProcessorMongoDB } from './defaultRuleProcessorMongoDB';
import { defaultRuleProcessorParameterized } from './defaultRuleProcessorParameterized';
import { defaultRuleProcessorSpEL } from './defaultRuleProcessorSpEL';
import { defaultRuleProcessorSQL } from './defaultRuleProcessorSQL';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';
import {
  celCombinatorMap,
  isValueProcessorLegacy,
  numerifyValues,
  quoteFieldNamesWithArray,
} from './utils';

/**
 * Generates a formatted (indented two spaces) JSON string from a query object.
 */
function formatQuery(ruleGroup: RuleGroupTypeAny): string;
/**
 * Generates a {@link ParameterizedSQL} object from a query object.
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'parameterized' | (Omit<FormatQueryOptions, 'format'> & { format: 'parameterized' })
): ParameterizedSQL;
/**
 * Generates a {@link ParameterizedNamedSQL} object from a query object.
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options:
    | 'parameterized_named'
    | (Omit<FormatQueryOptions, 'format'> & { format: 'parameterized_named' })
): ParameterizedNamedSQL;
/**
 * Generates a {@link JsonLogic} object from a query object.
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'jsonlogic' | (Omit<FormatQueryOptions, 'format'> & { format: 'jsonlogic' })
): RQBJsonLogic;
/**
 * Generates an ElasticSearch query object from an RQB query object.
 *
 * NOTE: Support for the ElasticSearch format is experimental.
 * You may have better results exporting "sql" format then using
 * [ElasticSearch SQL](https://www.elastic.co/guide/en/elasticsearch/reference/current/xpack-sql.html).
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'elasticsearch' | (Omit<FormatQueryOptions, 'format'> & { format: 'elasticsearch' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any>;
/**
 * Generates a JSONata query string from an RQB query object.
 *
 * NOTE: The `parseNumbers` option is recommended for this format.
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'jsonata' | (Omit<FormatQueryOptions, 'format'> & { format: 'jsonata' })
): string;
/**
 * Generates a formatted (indented two spaces) JSON string from a query object.
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: Omit<FormatQueryOptions, 'format'>
): string;
/**
 * Generates a query string in the requested format.
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: Exclude<
    ExportFormat,
    'parameterized' | 'parameterized_named' | 'jsonlogic' | 'elasticsearch' | 'jsonata'
  >
): string;
/**
 * Generates a query string in the requested format.
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: Omit<FormatQueryOptions, 'format'> & {
    format: Exclude<
      ExportFormat,
      'parameterized' | 'parameterized_named' | 'jsonlogic' | 'elasticsearch' | 'jsonata'
    >;
  }
): string;
function formatQuery(ruleGroup: RuleGroupTypeAny, options: FormatQueryOptions | ExportFormat = {}) {
  let format: ExportFormat = 'json';
  let valueProcessorInternal = defaultValueProcessorByRule;
  let ruleProcessorInternal: RuleProcessor | null = null;
  let quoteFieldNamesWith: [string, string] = ['', ''];
  let validator: QueryValidator = () => true;
  let fields: FullOptionList<FullField> = [];
  let validationMap: ValidationMap = {};
  let fallbackExpression = '';
  let paramPrefix = ':';
  let paramsKeepPrefix = false;
  let numberedParams = false;
  let parseNumbers = false;
  let placeholderFieldName = defaultPlaceholderFieldName;
  let placeholderOperatorName = defaultPlaceholderOperatorName;
  let quoteValuesWith = "'";

  if (typeof options === 'string') {
    format = options.toLowerCase() as ExportFormat;
    if (format === 'mongodb') {
      ruleProcessorInternal = defaultRuleProcessorMongoDB;
    } else if (format === 'parameterized') {
      ruleProcessorInternal = defaultRuleProcessorParameterized;
    } else if (format === 'parameterized_named') {
      ruleProcessorInternal = defaultRuleProcessorParameterized;
    } else if (format === 'cel') {
      ruleProcessorInternal = defaultRuleProcessorCEL;
    } else if (format === 'spel') {
      ruleProcessorInternal = defaultRuleProcessorSpEL;
    } else if (format === 'jsonlogic') {
      ruleProcessorInternal = defaultRuleProcessorJsonLogic;
    } else if (format === 'elasticsearch') {
      ruleProcessorInternal = defaultRuleProcessorElasticSearch;
    } else if (format === 'jsonata') {
      ruleProcessorInternal = defaultRuleProcessorJSONata;
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
                : format === 'elasticsearch'
                  ? ruleProcessorInternal ?? defaultRuleProcessorElasticSearch
                  : format === 'jsonata'
                    ? ruleProcessorInternal ?? defaultRuleProcessorJSONata
                    : defaultValueProcessorByRule;
    quoteFieldNamesWith = quoteFieldNamesWithArray(options.quoteFieldNamesWith);
    validator = options.validator ?? (() => true);
    fields = toFullOptionList(options.fields ?? []);
    fallbackExpression = options.fallbackExpression ?? '';
    paramPrefix = options.paramPrefix ?? ':';
    paramsKeepPrefix = !!options.paramsKeepPrefix;
    numberedParams = !!options.numberedParams;
    parseNumbers = !!options.parseNumbers;
    placeholderFieldName = options.placeholderFieldName ?? defaultPlaceholderFieldName;
    placeholderOperatorName = options.placeholderOperatorName ?? defaultPlaceholderOperatorName;
    quoteValuesWith = options.quoteValuesWith ?? "'";
  }
  if (!fallbackExpression) {
    fallbackExpression =
      format === 'mongodb'
        ? '"$and":[{"$expr":true}]'
        : format === 'cel' || format === 'spel'
          ? '1 == 1'
          : '(1 = 1)';
  }

  // #region JSON
  if (format === 'json' || format === 'json_without_ids') {
    const rg = parseNumbers ? numerifyValues(ruleGroup) : ruleGroup;
    if (format === 'json') {
      return JSON.stringify(rg, null, 2);
    }
    return JSON.stringify(rg, (key, value) =>
      // Remove `id` and `path` keys; leave everything else unchanged.
      key === 'id' || key === 'path' ? undefined : value
    );
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
                : format === 'elasticsearch'
                  ? {}
                  : fallbackExpression;
      }
    } else {
      validationMap = validationResult;
    }
  }

  const validatorMap: Record<string, RuleValidator> = {};
  const uniqueFields = toFlatOptionArray(fields) satisfies FullField[];
  uniqueFields.forEach(f => {
    // istanbul ignore else
    if (typeof f.validator === 'function') {
      validatorMap[(f.value ?? /* istanbul ignore next */ f.name)!] = f.validator;
    }
  });

  const validateRule = (rule: RuleType) => {
    let validationResult: boolean | ValidationResult | undefined = undefined;
    let fieldValidator: RuleValidator | undefined = undefined;
    if (rule.id) {
      validationResult = validationMap[rule.id];
    }
    if (uniqueFields.length) {
      const fieldArr = uniqueFields.filter(f => f.name === rule.field);
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
  // #endregion

  // #region SQL
  if (format === 'sql') {
    const processRuleGroup = (rg: RuleGroupTypeAny, outermostOrLonelyInGroup?: boolean): string => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
        // TODO: test for the last case and remove "ignore" comment
        return outermostOrLonelyInGroup ? fallbackExpression : /* istanbul ignore next */ '';
      }

      const processedRules = rg.rules.map(rule => {
        // Independent combinators
        if (typeof rule === 'string') {
          return rule;
        }

        // Groups
        if (isRuleGroup(rule)) {
          return processRuleGroup(rule, rg.rules.length === 1);
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

        const fieldData = getOption(fields, rule.field);

        // Use custom rule processor if provided...
        if (typeof ruleProcessorInternal === 'function') {
          return ruleProcessorInternal(rule, {
            parseNumbers,
            escapeQuotes,
            quoteFieldNamesWith,
            fieldData,
            format,
            quoteValuesWith,
          });
        }
        // ...otherwise use default rule processor and pass in the value
        // processor (which may be custom)
        return defaultRuleProcessorSQL(rule, {
          parseNumbers,
          escapeQuotes,
          valueProcessor: valueProcessorInternal,
          quoteFieldNamesWith,
          fieldData,
          format,
          quoteValuesWith,
        });
      });

      if (processedRules.length === 0) {
        return fallbackExpression;
      }

      return `${rg.not ? 'NOT ' : ''}(${processedRules
        .filter(Boolean)
        .join(isRuleGroupType(rg) ? ` ${rg.combinator} ` : ' ')})`;
    };

    return processRuleGroup(ruleGroup, true);
  }
  // #endregion

  // #region Parameterized SQL
  if (format === 'parameterized' || format === 'parameterized_named') {
    const parameterized = format === 'parameterized';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paramsNamed: Record<string, any> = {};
    const fieldParams: Map<string, Set<string>> = new Map();

    const getNextNamedParam = (field: string) => {
      if (!fieldParams.has(field)) {
        fieldParams.set(field, new Set());
      }
      const nextNamedParam = `${field}_${fieldParams.get(field)!.size + 1}`;
      fieldParams.get(field)!.add(nextNamedParam);
      return nextNamedParam;
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

      const fieldData = getOption(fields, rule.field);

      const fieldParamNames = Object.fromEntries(
        (Array.from(fieldParams.entries()) as [string, Set<string>][]).map(([f, s]) => [
          f,
          Array.from(s),
        ])
      );

      const processedRule = (
        typeof ruleProcessorInternal === 'function'
          ? ruleProcessorInternal
          : defaultRuleProcessorParameterized
      )(
        rule,
        {
          getNextNamedParam,
          fieldParamNames,
          parseNumbers,
          quoteFieldNamesWith,
          fieldData,
          format,
          paramPrefix,
          paramsKeepPrefix,
          numberedParams,
          fallbackExpression,
          valueProcessor: valueProcessorInternal,
          fields,
          placeholderFieldName,
          placeholderOperatorName,
          validator,
        },
        {
          processedParams: params,
        }
      );

      if (!isPojo(processedRule)) {
        return '';
      }

      const { sql, params: customParams } = processedRule;

      if (typeof sql !== 'string' || !sql) {
        return '';
      }

      // istanbul ignore else
      if (format === 'parameterized' && Array.isArray(customParams)) {
        params.push(...customParams);
      } else if (format === 'parameterized_named' && isPojo(customParams)) {
        Object.assign(paramsNamed, customParams);
        // `getNextNamedParam` already adds new params to the list, but a custom
        // rule processor might not call it so we need to make sure we add
        // any new params here.
        Object.keys(customParams).forEach(p => fieldParams.get(rule.field)?.add(p));
      }

      return sql;
    };

    const processRuleGroup = (rg: RuleGroupTypeAny, outermostOrLonelyInGroup?: boolean): string => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
        // TODO: test for the last case and remove "ignore" comment
        return outermostOrLonelyInGroup ? fallbackExpression : /* istanbul ignore next */ '';
      }

      const processedRules = rg.rules.map(rule => {
        if (typeof rule === 'string') {
          return rule;
        }
        if (isRuleGroup(rule)) {
          return processRuleGroup(rule, rg.rules.length === 1);
        }
        return processRule(rule);
      });

      if (processedRules.length === 0) {
        return fallbackExpression;
      }

      return `${rg.not ? 'NOT ' : ''}(${processedRules
        .filter(Boolean)
        .join(isRuleGroupType(rg) ? ` ${rg.combinator} ` : ' ')})`;
    };

    if (parameterized) {
      return { sql: processRuleGroup(ruleGroup, true), params };
    }
    return { sql: processRuleGroup(ruleGroup, true), params: paramsNamed };
  }
  // #endregion

  // #region MongoDB
  if (format === 'mongodb') {
    const processRuleGroup = (rg: RuleGroupType, outermost?: boolean) => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
        return outermost ? fallbackExpression : '';
      }

      const combinator = `"$${rg.combinator.toLowerCase()}"`;
      let hasChildRules = false;

      const expressions: string[] = rg.rules
        .map(rule => {
          if (isRuleGroup(rule)) {
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
          const fieldData = getOption(fields, rule.field);
          return (ruleProcessorInternal ?? valueProcessorInternal)(rule, {
            parseNumbers,
            fieldData,
            format,
          });
        })
        .filter(Boolean);

      return expressions.length > 0
        ? expressions.length === 1 && !hasChildRules
          ? expressions[0]
          : `${combinator}:[${expressions.join(',')}]`
        : fallbackExpression;
    };

    const rgStandard = isRuleGroupType(ruleGroup) ? ruleGroup : convertFromIC(ruleGroup);
    const processedQuery = processRuleGroup(rgStandard, true);
    return /^\{.+\}$/.test(processedQuery) ? processedQuery : `{${processedQuery}}`;
  }
  // #endregion

  // #region CEL
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
          if (isRuleGroup(rule)) {
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
          const fieldData = getOption(fields, rule.field);
          return (ruleProcessorInternal ?? valueProcessorInternal)(rule, {
            parseNumbers,
            escapeQuotes: (rule.valueSource ?? 'value') === 'value',
            fieldData,
            format,
          });
        })
        .filter(Boolean)
        .join(
          isRuleGroupType(rg)
            ? ` ${celCombinatorMap[rg.combinator as DefaultCombinatorName]} `
            : ' '
        );

      const [prefix, suffix] = rg.not || !outermost ? [`${rg.not ? '!' : ''}(`, ')'] : ['', ''];

      return expression ? `${prefix}${expression}${suffix}` : fallbackExpression;
    };

    return processRuleGroup(ruleGroup, true);
  }
  // #endregion

  // #region SpEL
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
          if (isRuleGroup(rule)) {
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
          const fieldData = getOption(fields, rule.field);
          return (ruleProcessorInternal ?? valueProcessorInternal)(rule, {
            parseNumbers,
            escapeQuotes: (rule.valueSource ?? 'value') === 'value',
            fieldData,
            format,
          });
        })
        .filter(Boolean)
        .join(isRuleGroupType(rg) ? ` ${rg.combinator} ` : ' ');

      const [prefix, suffix] = rg.not || !outermost ? [`${rg.not ? '!' : ''}(`, ')'] : ['', ''];

      return expression ? `${prefix}${expression}${suffix}` : fallbackExpression;
    };

    return processRuleGroup(ruleGroup, true);
  }
  // #endregion

  // #region JSONata
  if (format === 'jsonata') {
    const processRuleGroup = (rg: RuleGroupTypeAny, outermost?: boolean) => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
        return outermost ? fallbackExpression : '';
      }

      const expression: string = rg.rules
        .map(rule => {
          if (typeof rule === 'string') {
            return rule;
          }
          if (isRuleGroup(rule)) {
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
          const fieldData = getOption(fields, rule.field);
          return (ruleProcessorInternal ?? valueProcessorInternal)(rule, {
            parseNumbers,
            escapeQuotes: (rule.valueSource ?? 'value') === 'value',
            fieldData,
            format,
            quoteFieldNamesWith,
          });
        })
        .filter(Boolean)
        .join(isRuleGroupType(rg) ? ` ${rg.combinator} ` : ' ');

      const [prefix, suffix] = rg.not || !outermost ? [`${rg.not ? '$not' : ''}(`, ')'] : ['', ''];

      return expression ? `${prefix}${expression}${suffix}` : fallbackExpression;
    };

    return processRuleGroup(ruleGroup, true);
  }
  // #endregion

  // #region JsonLogic
  if (format === 'jsonlogic') {
    const query = isRuleGroupType(ruleGroup) ? ruleGroup : convertFromIC(ruleGroup);

    const processRuleGroup = (rg: RuleGroupType, _outermost?: boolean): RQBJsonLogic => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
        return false;
      }

      const processedRules = rg.rules
        .map(rule => {
          if (isRuleGroup(rule)) {
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
          const fieldData = getOption(fields, rule.field);
          return (ruleProcessorInternal ?? valueProcessorInternal)(rule, {
            parseNumbers,
            fieldData,
            format,
          });
        })
        .filter(Boolean);

      if (processedRules.length === 0) {
        return false;
      }

      const jsonRuleGroup: RQBJsonLogic = { [rg.combinator]: processedRules } as {
        [k in DefaultCombinatorName]: [RQBJsonLogic, RQBJsonLogic, ...RQBJsonLogic[]];
      };

      return rg.not ? { '!': jsonRuleGroup } : jsonRuleGroup;
    };

    return processRuleGroup(query, true);
  }
  // #endregion

  // #region ElasticSearch
  if (format === 'elasticsearch') {
    const query = isRuleGroupType(ruleGroup) ? ruleGroup : convertFromIC(ruleGroup);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processRuleGroup = (rg: RuleGroupType): Record<string, any> | false => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
        return false;
      }

      const processedRules = rg.rules
        .map(rule => {
          if (isRuleGroup(rule)) {
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
          const fieldData = getOption(fields, rule.field);
          return (ruleProcessorInternal ?? valueProcessorInternal)(rule, {
            parseNumbers,
            fieldData,
            format,
          });
        })
        .filter(Boolean);

      if (processedRules.length === 0) {
        return false;
      }

      return {
        bool: rg.not
          ? {
              must_not:
                rg.combinator === 'or' ? { bool: { should: processedRules } } : processedRules,
            }
          : { [rg.combinator === 'or' ? 'should' : 'must']: processedRules },
      };
    };

    const processedRuleGroup = processRuleGroup(query);
    return processedRuleGroup === false ? {} : processedRuleGroup;
  }

  return '';
}

export { formatQuery };
