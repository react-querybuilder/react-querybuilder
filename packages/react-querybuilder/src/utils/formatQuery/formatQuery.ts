import { produce } from 'immer';
import { defaultPlaceholderFieldName, defaultPlaceholderOperatorName } from '../../defaults';
import type {
  DefaultCombinatorName,
  Except,
  ExportFormat,
  ExportObjectFormats,
  FormatQueryOptions,
  FullField,
  FullOperator,
  FullOptionList,
  InputType,
  ParameterizedNamedSQL,
  ParameterizedSQL,
  QueryValidator,
  RQBJsonLogic,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleProcessor,
  RuleType,
  RuleValidator,
  SetOptional,
  SQLPreset,
  ValidationMap,
  ValidationResult,
  ValueProcessorByRule,
} from '../../types/index.noReact';
import { convertFromIC } from '../convertQuery';
import { getParseNumberMethod } from '../getParseNumberMethod';
import { isRuleGroup, isRuleGroupType, isRuleGroupTypeIC } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { isPojo } from '../misc';
import { getOption, toFlatOptionArray, toFullOptionList } from '../optGroupUtils';
import { defaultRuleProcessorCEL } from './defaultRuleProcessorCEL';
import { defaultRuleProcessorElasticSearch } from './defaultRuleProcessorElasticSearch';
import { defaultRuleProcessorJSONata } from './defaultRuleProcessorJSONata';
import { defaultRuleProcessorJsonLogic } from './defaultRuleProcessorJsonLogic';
import { defaultRuleProcessorMongoDB } from './defaultRuleProcessorMongoDB';
import { defaultRuleProcessorMongoDBQuery } from './defaultRuleProcessorMongoDBQuery';
import { defaultOperatorProcessorNL, defaultRuleProcessorNL } from './defaultRuleProcessorNL';
import { defaultRuleProcessorParameterized } from './defaultRuleProcessorParameterized';
import { defaultRuleProcessorSpEL } from './defaultRuleProcessorSpEL';
import { defaultOperatorProcessorSQL, defaultRuleProcessorSQL } from './defaultRuleProcessorSQL';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';
import { defaultValueProcessorNL } from './defaultValueProcessorNL';
import {
  celCombinatorMap,
  getQuoteFieldNamesWithArray,
  isValueProcessorLegacy,
  numerifyValues,
} from './utils';

/**
 * @group Export
 */
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
    paramPrefix: '@',
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
  cel: defaultRuleProcessorCEL,
  elasticsearch: defaultRuleProcessorElasticSearch,
  json_without_ids: defaultRuleProcessorSQL,
  json: defaultRuleProcessorSQL,
  jsonata: defaultRuleProcessorJSONata,
  jsonlogic: defaultRuleProcessorJsonLogic,
  mongodb_query: defaultRuleProcessorMongoDBQuery,
  mongodb: defaultRuleProcessorMongoDB,
  natural_language: defaultRuleProcessorNL,
  parameterized_named: defaultRuleProcessorParameterized,
  parameterized: defaultRuleProcessorParameterized,
  spel: defaultRuleProcessorSpEL,
  sql: defaultRuleProcessorSQL,
} satisfies Record<ExportFormat, RuleProcessor>;

/* istanbul ignore next */
const defaultOperatorProcessor: RuleProcessor = r => r.operator;
const defaultOperatorProcessors = {
  cel: defaultOperatorProcessor,
  elasticsearch: defaultOperatorProcessor,
  json_without_ids: defaultOperatorProcessor,
  json: defaultOperatorProcessor,
  jsonata: defaultOperatorProcessor,
  jsonlogic: defaultOperatorProcessor,
  mongodb_query: defaultOperatorProcessor,
  mongodb: defaultOperatorProcessor,
  natural_language: defaultOperatorProcessorNL,
  parameterized_named: defaultOperatorProcessorSQL,
  parameterized: defaultOperatorProcessorSQL,
  spel: defaultOperatorProcessor,
  sql: defaultOperatorProcessorSQL,
} satisfies Record<ExportFormat, RuleProcessor>;

const defaultFallbackExpressions: Partial<Record<ExportFormat, string>> = {
  cel: '1 == 1',
  mongodb: '"$and":[{"$expr":true}]',
  natural_language: '1 is 1',
  spel: '1 == 1',
  sql: '(1 = 1)',
};

const mongoDbFallback = { $and: [{ $expr: true }] } as const;

type MostFormatQueryOptions = SetOptional<
  Required<FormatQueryOptions>,
  | 'context'
  | 'fallbackExpression'
  | 'operatorProcessor'
  | 'ruleProcessor'
  | 'validator'
  | 'valueProcessor'
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
  preserveValueOrder: false,
  placeholderFieldName: defaultPlaceholderFieldName,
  placeholderOperatorName: defaultPlaceholderOperatorName,
  quoteValuesWith: "'",
  concatOperator: '||',
  preset: 'ansi',
} satisfies MostFormatQueryOptions;

const valueProcessorCanActAsRuleProcessor = (format: ExportFormat) =>
  format === 'mongodb' ||
  format === 'mongodb_query' ||
  format === 'cel' ||
  format === 'spel' ||
  format === 'jsonlogic' ||
  format === 'elasticsearch' ||
  format === 'jsonata';

/**
 * Generates a formatted (indented two spaces) JSON string from a query object.
 *
 * @group Export
 */
function formatQuery(ruleGroup: RuleGroupTypeAny): string;
/**
 * Generates a {@link index!ParameterizedSQL ParameterizedSQL} object from a query object.
 *
 * @group Export
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'parameterized' | (FormatQueryOptions & { format: 'parameterized' })
): ParameterizedSQL;
/**
 * Generates a {@link index!ParameterizedNamedSQL ParameterizedNamedSQL} object from a query object.
 *
 * @group Export
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'parameterized_named' | (FormatQueryOptions & { format: 'parameterized_named' })
): ParameterizedNamedSQL;
/**
 * Generates a {@link index!RQBJsonLogic JsonLogic} object from a query object.
 *
 * @group Export
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
 *
 * @group Export
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'elasticsearch' | (FormatQueryOptions & { format: 'elasticsearch' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any>;
/**
 * Generates a MongoDB query object from an RQB query object.
 *
 * This is equivalent to the "mongodb" format, but returns a JSON object
 * instead of a string.
 *
 * @group Export
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'mongodb_query' | (FormatQueryOptions & { format: 'mongodb_query' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any>;
/**
 * Generates a JSON.stringify'd MongoDB query object from an RQB query object.
 *
 * This is equivalent to the "mongodb_query" format, but returns a string
 * instead of a JSON object.
 *
 * @deprecated Use the "mongodb_query" format for greater flexibility.
 *
 * @group Export
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'mongodb' | (FormatQueryOptions & { format: 'mongodb' })
): string;
/**
 * Generates a JSONata query string from an RQB query object.
 *
 * NOTE: The `parseNumbers` option is recommended for this format.
 *
 * @group Export
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'jsonata' | (FormatQueryOptions & { format: 'jsonata' })
): string;
/**
 * Generates a formatted (indented two spaces) JSON string from a query object.
 *
 * @group Export
 */
function formatQuery(ruleGroup: RuleGroupTypeAny, options: FormatQueryOptions): string;
/**
 * Generates a query string in the requested format.
 *
 * @group Export
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: Exclude<ExportFormat, ExportObjectFormats>
): string;
/**
 * Generates a query string in the requested format.
 *
 * @group Export
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: FormatQueryOptions & { format: Exclude<ExportFormat, ExportObjectFormats> }
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
    fallbackExpression: fallbackExpression_option,
    getOperators: getOperators_option,
    operatorProcessor: operatorProcessor_option,
    parseNumbers,
    placeholderFieldName,
    placeholderOperatorName,
    quoteFieldNamesWith: quoteFieldNamesWith_option,
    ruleProcessor: ruleProcessor_option,
    validator,
    valueProcessor: valueProcessor_option,
  } = optObj;

  const getParseNumberBoolean = (inputType?: InputType | null) =>
    !!getParseNumberMethod({ parseNumbers, inputType });

  const format = optObj.format.toLowerCase() as ExportFormat;

  const operatorProcessor =
    typeof operatorProcessor_option === 'function'
      ? operatorProcessor_option
      : (defaultOperatorProcessors[format] ?? defaultOperatorProcessor);

  const valueProcessor: ValueProcessorByRule =
    typeof valueProcessor_option === 'function'
      ? isValueProcessorLegacy(valueProcessor_option)
        ? r => valueProcessor_option(r.field, r.operator, r.value, r.valueSource)
        : valueProcessor_option
      : format === 'natural_language'
        ? defaultValueProcessorNL
        : valueProcessorCanActAsRuleProcessor(format)
          ? (ruleProcessor_option ?? defaultRuleProcessors[format])
          : defaultValueProcessorByRule;

  const ruleProcessor =
    (typeof ruleProcessor_option === 'function' ? ruleProcessor_option : null) ??
    (valueProcessorCanActAsRuleProcessor(format) &&
    typeof ruleProcessor_option !== 'function' &&
    valueProcessor_option
      ? valueProcessor
      : null) ??
    defaultRuleProcessors[format] ??
    defaultRuleProcessorSQL;

  const quoteFieldNamesWith = getQuoteFieldNamesWithArray(quoteFieldNamesWith_option);
  const fields = toFullOptionList(optObj.fields) as FullOptionList<FullField>;
  const getOperators: FormatQueryOptions['getOperators'] = (f, m) =>
    toFullOptionList(getOperators_option(f, m) ?? /* istanbul ignore next */ []);

  const fallbackExpression =
    fallbackExpression_option ??
    defaultFallbackExpressions[format] ??
    defaultFallbackExpressions.sql!;

  const finalOptions: Required<
    Except<FormatQueryOptions, 'context' | 'valueProcessor' | 'validator'>
  > & {
    valueProcessor: ValueProcessorByRule;
    validator?: QueryValidator;
  } = {
    ...optObj,
    fallbackExpression,
    fields,
    format,
    getOperators,
    quoteFieldNamesWith,
    operatorProcessor,
    ruleProcessor,
    valueProcessor,
  };

  // #region JSON
  if (format === 'json' || format === 'json_without_ids') {
    const rg = parseNumbers ? produce(ruleGroup, g => numerifyValues(g, finalOptions)) : ruleGroup;
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
              : format === 'mongodb_query'
                ? mongoDbFallback
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

      const processedRules = rg.rules
        .map(rule => {
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
            parseNumbers: getParseNumberBoolean(fieldData?.inputType),
            escapeQuotes,
            fieldData,
          });
        })
        .filter(Boolean);

      if (processedRules.length === 0) {
        return fallbackExpression;
      }

      return `${rg.not ? 'NOT ' : ''}(${processedRules.join(isRuleGroupType(rg) ? ` ${rg.combinator} ` : ' ')})`;
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
        {
          ...finalOptions,
          parseNumbers: getParseNumberBoolean(fieldData?.inputType),
          getNextNamedParam,
          fieldParamNames,
          fieldData,
        },
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

      const processedRules = rg.rules
        .map(rule => {
          if (typeof rule === 'string') {
            return rule;
          }
          if (isRuleGroup(rule)) {
            return processRuleGroup(rule, rg.rules.length === 1);
          }
          return processRule(rule);
        })
        .filter(Boolean);

      if (processedRules.length === 0) {
        return fallbackExpression;
      }

      return `${rg.not ? 'NOT ' : ''}(${processedRules.join(isRuleGroupType(rg) ? ` ${rg.combinator} ` : ' ')})`;
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
          return ruleProcessor(rule, {
            ...finalOptions,
            parseNumbers: getParseNumberBoolean(fieldData?.inputType),
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
    return /^\{.+\}$/.test(processedQuery) ? processedQuery : `{${processedQuery}}`;
  }
  // #endregion

  // #region MongoDB Query
  if (format === 'mongodb_query') {
    const processRuleGroup = (rg: RuleGroupType, outermost?: boolean) => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
        return outermost ? mongoDbFallback : false;
      }

      const combinator = `$${rg.combinator.toLowerCase()}`;
      let hasChildRules = false;

      const expressions: Record<string, unknown>[] = rg.rules
        .map(rule => {
          if (isRuleGroup(rule)) {
            const processedRuleGroup = processRuleGroup(rule);
            if (processedRuleGroup) {
              hasChildRules = true;
              return processedRuleGroup;
            }
            return false;
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
            parseNumbers: getParseNumberBoolean(fieldData?.inputType),
            fieldData,
          });
        })
        .filter(Boolean);

      return expressions.length > 0
        ? expressions.length === 1 && !hasChildRules
          ? expressions[0]
          : { [combinator]: expressions }
        : mongoDbFallback;
    };

    // const processedQuery = processRuleGroup(convertFromIC(ruleGroup), true);
    // return /^\{.+\}$/.test(processedQuery) ? processedQuery : `{${processedQuery}}`;
    return processRuleGroup(convertFromIC(ruleGroup), true);
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
            parseNumbers: getParseNumberBoolean(fieldData?.inputType),
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
            parseNumbers: getParseNumberBoolean(fieldData?.inputType),
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
            parseNumbers: getParseNumberBoolean(fieldData?.inputType),
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
            parseNumbers: getParseNumberBoolean(fieldData?.inputType),
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
            parseNumbers: getParseNumberBoolean(fieldData?.inputType),
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
              must_not: /^or$/i.test(rg.combinator)
                ? { bool: { should: processedRules } }
                : processedRules,
            }
          : { [/^or$/i.test(rg.combinator) ? 'should' : 'must']: processedRules },
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

      let rg2 = rg;

      if (
        isRuleGroupTypeIC(rg) &&
        rg.rules.some(r => typeof r === 'string' && r.toLowerCase() === 'xor')
      ) {
        rg2 = convertFromIC(rg);
      }

      const processedRules = rg2.rules.map(rule => {
        // Independent combinators
        if (typeof rule === 'string') {
          return `, ${rule} `;
        }

        // Groups
        if (isRuleGroup(rule)) {
          return processRuleGroup(
            rule,
            rg2.rules.length === 1 &&
              !(rg2.not || /^xor$/i.test(rg2.combinator ?? /* istanbul ignore next */ ''))
          );
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
          parseNumbers: getParseNumberBoolean(fieldData?.inputType),
          escapeQuotes,
          fieldData,
        });
      });

      if (processedRules.length === 0) {
        return fallbackExpression;
      }

      const isXOR = /^xor$/i.test(rg2.combinator ?? '');
      const combinator = isXOR ? rg2.combinator!.slice(1) : rg2.combinator;
      const mustWrap = rg2.not || !outermostOrLonelyInGroup || (isXOR && processedRules.length > 1);

      const prefix = mustWrap
        ? `${isXOR ? (rg2.not ? 'either zero or more than one of ' : 'exactly one of ') : ''}(`
        : '';
      const suffix = mustWrap ? `) is${rg2.not && !isXOR ? ' not' : ''} true` : '';

      return `${prefix}${processedRules
        .filter(Boolean)
        .join(isRuleGroupType(rg2) ? `, ${combinator} ` : '')}${suffix}`;
    };

    return processRuleGroup(ruleGroup, true);
  }
  // #endregion

  return '';
}

export { formatQuery };
