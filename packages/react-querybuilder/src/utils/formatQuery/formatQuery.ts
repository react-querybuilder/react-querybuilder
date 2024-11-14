import { produce } from 'immer';
import type { SetOptional } from 'type-fest';
import { defaultPlaceholderFieldName, defaultPlaceholderOperatorName } from '../../defaults';
import type {
  DefaultCombinatorName,
  ExportFormat,
  FormatQueryOptions,
  FullField,
  FullOperator,
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
  SQLPreset,
  ValidationMap,
  ValidationResult,
  ValueProcessorByRule,
} from '../../types/index.noReact';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup, isRuleGroupType } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { isPojo } from '../misc';
import { getOption, toFlatOptionArray, toFullOptionList } from '../optGroupUtils';
import { defaultRuleProcessorCEL } from './defaultRuleProcessorCEL';
import { defaultRuleProcessorElasticSearch } from './defaultRuleProcessorElasticSearch';
import { defaultRuleProcessorJSONata } from './defaultRuleProcessorJSONata';
import { defaultRuleProcessorJsonLogic } from './defaultRuleProcessorJsonLogic';
import { defaultRuleProcessorMongoDB } from './defaultRuleProcessorMongoDB';
import { defaultRuleProcessorNL } from './defaultRuleProcessorNL';
import { defaultRuleProcessorParameterized } from './defaultRuleProcessorParameterized';
import { defaultRuleProcessorSpEL } from './defaultRuleProcessorSpEL';
import { defaultRuleProcessorSQL } from './defaultRuleProcessorSQL';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';
import { defaultValueProcessorNL } from './defaultValueProcessorNL';
import {
  celCombinatorMap,
  getQuoteFieldNamesWithArray,
  isValueProcessorLegacy,
  numerifyValues,
} from './utils';

export const sqlDialectPresets: Record<SQLPreset, FormatQueryOptions> = {
  ansi: {}, // This should always be empty
  sqlite: {
    paramsKeepPrefix: true,
  },
  oracle: {},
  mssql: {
    concatOperator: '+',
    quoteFieldNamesWith: ['[', ']'],
    fieldIdentifierSeparator: '.',
  },
  mysql: {
    concatOperator: 'CONCAT',
  },
  postgresql: {
    quoteFieldNamesWith: '"',
    numberedParams: true,
    paramPrefix: '$',
  },
};

const defaultRuleProcessors = {
  natural_language: defaultRuleProcessorNL,
  mongodb: defaultRuleProcessorMongoDB,
  parameterized: defaultRuleProcessorParameterized,
  parameterized_named: defaultRuleProcessorParameterized,
  cel: defaultRuleProcessorCEL,
  spel: defaultRuleProcessorSpEL,
  jsonlogic: defaultRuleProcessorJsonLogic,
  elasticsearch: defaultRuleProcessorElasticSearch,
  jsonata: defaultRuleProcessorJSONata,
  json: defaultRuleProcessorSQL,
  json_without_ids: defaultRuleProcessorSQL,
  sql: defaultRuleProcessorSQL,
} satisfies Record<ExportFormat, RuleProcessor>;

const defaultFallbackExpressions: Partial<Record<ExportFormat, string>> = {
  cel: '1 == 1',
  mongodb: '"$and":[{"$expr":true}]',
  natural_language: '1 is 1',
  spel: '1 == 1',
  sql: '(1 = 1)',
};

type MostFormatQueryOptions = SetOptional<
  Required<FormatQueryOptions>,
  'fallbackExpression' | 'ruleProcessor' | 'validator' | 'valueProcessor'
>;

const defaultFormatQueryOptions = {
  format: 'json',
  fields: [] as FullOptionList<FullField>,
  quoteFieldNamesWith: ['', ''],
  fieldIdentifierSeparator: '',
  getOperators: () => [] as FullOptionList<FullOperator>,
  paramPrefix: ':',
  paramsKeepPrefix: false,
  numberedParams: false,
  parseNumbers: false,
  placeholderFieldName: defaultPlaceholderFieldName,
  placeholderOperatorName: defaultPlaceholderOperatorName,
  quoteValuesWith: "'",
  concatOperator: '||',
  preset: 'ansi',
} satisfies MostFormatQueryOptions;

const valueProcessorCanActAsRuleProcessor = (format: ExportFormat) =>
  format === 'mongodb' ||
  format === 'cel' ||
  format === 'spel' ||
  format === 'jsonlogic' ||
  format === 'elasticsearch' ||
  format === 'jsonata';

/**
 * Generates a formatted (indented two spaces) JSON string from a query object.
 */
function formatQuery(ruleGroup: RuleGroupTypeAny): string;
/**
 * Generates a {@link ParameterizedSQL} object from a query object.
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'parameterized' | (FormatQueryOptions & { format: 'parameterized' })
): ParameterizedSQL;
/**
 * Generates a {@link ParameterizedNamedSQL} object from a query object.
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'parameterized_named' | (FormatQueryOptions & { format: 'parameterized_named' })
): ParameterizedNamedSQL;
/**
 * Generates a {@link JsonLogic} object from a query object.
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'jsonlogic' | (FormatQueryOptions & { format: 'jsonlogic' })
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
  options: 'elasticsearch' | (FormatQueryOptions & { format: 'elasticsearch' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any>;
/**
 * Generates a JSONata query string from an RQB query object.
 *
 * NOTE: The `parseNumbers` option is recommended for this format.
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'jsonata' | (FormatQueryOptions & { format: 'jsonata' })
): string;
/**
 * Generates a formatted (indented two spaces) JSON string from a query object.
 */
function formatQuery(ruleGroup: RuleGroupTypeAny, options: FormatQueryOptions): string;
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
  options: FormatQueryOptions & {
    format: Exclude<
      ExportFormat,
      'parameterized' | 'parameterized_named' | 'jsonlogic' | 'elasticsearch' | 'jsonata'
    >;
  }
): string;
function formatQuery(ruleGroup: RuleGroupTypeAny, options: FormatQueryOptions | ExportFormat = {}) {
  const optObj: MostFormatQueryOptions = {
    ...defaultFormatQueryOptions,
    ...(sqlDialectPresets[(options as FormatQueryOptions).preset ?? 'ansi'] ?? null),
    ...(typeof options === 'string' ? { format: options } : options),
    ...(typeof options !== 'string' &&
      !options.format &&
      (Object.keys(sqlDialectPresets).includes(options.preset ?? '') ? { format: 'sql' } : null)),
  };

  const {
    fallbackExpression: optionFallbackExpression,
    getOperators: optionGetOperators,
    parseNumbers,
    placeholderFieldName,
    placeholderOperatorName,
    quoteFieldNamesWith: optionQuoteFieldNamesWith,
    ruleProcessor: optionRuleProcessor,
    validator,
    valueProcessor: optionValueProcessor,
  } = optObj;

  const format = optObj.format.toLowerCase() as ExportFormat;

  const valueProcessor: ValueProcessorByRule =
    typeof optionValueProcessor === 'function'
      ? isValueProcessorLegacy(optionValueProcessor)
        ? r => optionValueProcessor(r.field, r.operator, r.value, r.valueSource)
        : optionValueProcessor
      : format === 'natural_language'
        ? defaultValueProcessorNL
        : valueProcessorCanActAsRuleProcessor(format)
          ? (optionRuleProcessor ?? defaultRuleProcessors[format])
          : defaultValueProcessorByRule;

  const ruleProcessor =
    (typeof optionRuleProcessor === 'function' ? optionRuleProcessor : null) ??
    (valueProcessorCanActAsRuleProcessor(format) &&
    typeof optionRuleProcessor !== 'function' &&
    optionValueProcessor
      ? valueProcessor
      : null) ??
    defaultRuleProcessors[format] ??
    defaultRuleProcessorSQL;

  const quoteFieldNamesWith = getQuoteFieldNamesWithArray(optionQuoteFieldNamesWith);
  const fields = toFullOptionList(optObj.fields) as FullOptionList<FullField>;
  const getOperators: FormatQueryOptions['getOperators'] = (f, m) =>
    toFullOptionList(optionGetOperators(f, m) ?? /* istanbul ignore next */ []);

  const fallbackExpression =
    optionFallbackExpression ??
    defaultFallbackExpressions[format] ??
    defaultFallbackExpressions.sql!;

  const finalOptions: Required<Omit<FormatQueryOptions, 'valueProcessor' | 'validator'>> & {
    valueProcessor: ValueProcessorByRule;
    validator?: QueryValidator;
  } = {
    ...optObj,
    fallbackExpression,
    fields,
    format,
    getOperators,
    quoteFieldNamesWith,
    ruleProcessor,
    valueProcessor,
  };

  // #region JSON
  if (format === 'json' || format === 'json_without_ids') {
    const rg = parseNumbers ? produce(ruleGroup, numerifyValues) : ruleGroup;
    if (format === 'json_without_ids') {
      return JSON.stringify(rg, (key, value) =>
        // Remove `id` and `path` keys; leave everything else unchanged.
        key === 'id' || key === 'path' ? undefined : value
      );
    }
    return JSON.stringify(rg, null, 2);
  }
  // #endregion

  // #region Validation
  let validationMap: ValidationMap = {};

  // istanbul ignore else
  if (typeof validator === 'function') {
    const validationResult = validator(ruleGroup);
    if (typeof validationResult === 'boolean') {
      // istanbul ignore else
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
  for (const f of uniqueFields) {
    // istanbul ignore else
    if (typeof f.validator === 'function') {
      validatorMap[(f.value ?? /* istanbul ignore next */ f.name)!] = f.validator;
    }
  }

  const validateRule = (rule: RuleType) => {
    let validationResult: boolean | ValidationResult | undefined;
    let fieldValidator: RuleValidator | undefined;
    if (rule.id) {
      validationResult = validationMap[rule.id];
    }
    if (uniqueFields.length > 0) {
      const fieldArr = uniqueFields.filter(f => f.name === rule.field);
      if (fieldArr.length > 0) {
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

        return ruleProcessor(rule, {
          ...finalOptions,
          escapeQuotes,
          fieldData,
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
        ([...fieldParams.entries()] as [string, Set<string>][]).map(([f, s]) => [f, [...s]])
      );

      const processedRule = ruleProcessor(
        rule,
        { ...finalOptions, getNextNamedParam, fieldParamNames, fieldData },
        { processedParams: params }
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
        for (const p of Object.keys(customParams)) fieldParams.get(rule.field)?.add(p);
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
              return /^{.+}$/.test(processedRuleGroup)
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
          return ruleProcessor(rule, {
            ...finalOptions,
            fieldData,
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
    return /^{.+}$/.test(processedQuery) ? processedQuery : `{${processedQuery}}`;
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
          return ruleProcessor(rule, {
            ...finalOptions,
            escapeQuotes: (rule.valueSource ?? 'value') === 'value',
            fieldData,
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
          return ruleProcessor(rule, {
            ...finalOptions,
            escapeQuotes: (rule.valueSource ?? 'value') === 'value',
            fieldData,
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
          return ruleProcessor(rule, {
            ...finalOptions,
            escapeQuotes: (rule.valueSource ?? 'value') === 'value',
            fieldData,
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
          return ruleProcessor(rule, {
            ...finalOptions,
            fieldData,
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
          return ruleProcessor(rule, {
            ...finalOptions,
            fieldData,
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
  // #endregion

  // #region Natural language
  if (format === 'natural_language') {
    const processRuleGroup = (rg: RuleGroupTypeAny, outermostOrLonelyInGroup?: boolean): string => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
        // TODO: test for the last case and remove "ignore" comment
        return outermostOrLonelyInGroup ? fallbackExpression : /* istanbul ignore next */ '';
      }

      const processedRules = rg.rules.map(rule => {
        // Independent combinators
        if (typeof rule === 'string') {
          return `, ${rule} `;
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

        return ruleProcessor(rule, {
          ...finalOptions,
          escapeQuotes,
          fieldData,
        });
      });

      if (processedRules.length === 0) {
        return fallbackExpression;
      }

      const prefix = rg.not || !outermostOrLonelyInGroup ? '(' : '';
      const suffix = rg.not || !outermostOrLonelyInGroup ? `) is${rg.not ? ' not' : ''} true` : '';

      return `${prefix}${processedRules
        .filter(Boolean)
        .join(isRuleGroupType(rg) ? `, ${rg.combinator} ` : '')}${suffix}`;
    };

    return processRuleGroup(ruleGroup, true);
  }
  // #endregion

  return '';
}

export { formatQuery };
