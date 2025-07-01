import { produce } from 'immer';
import { defaultPlaceholderFieldName, defaultPlaceholderOperatorName } from '../../defaults';
import type {
  ExportFormat,
  ExportObjectFormats,
  FormatQueryFinalOptions,
  FormatQueryOptions,
  FullField,
  FullOperator,
  FullOptionList,
  InputType,
  ParameterizedNamedSQL,
  ParameterizedSQL,
  RQBJsonLogic,
  RuleGroupProcessor,
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
import { getParseNumberMethod } from '../getParseNumberMethod';
import { toFlatOptionArray, toFullOptionList } from '../optGroupUtils';
import { defaultRuleGroupProcessorCEL } from './defaultRuleGroupProcessorCEL';
import { defaultRuleGroupProcessorDrizzle } from './defaultRuleGroupProcessorDrizzle';
import { defaultRuleGroupProcessorElasticSearch } from './defaultRuleGroupProcessorElasticSearch';
import { defaultRuleGroupProcessorJSONata } from './defaultRuleGroupProcessorJSONata';
import { defaultRuleGroupProcessorJsonLogic } from './defaultRuleGroupProcessorJsonLogic';
import { defaultRuleGroupProcessorLDAP } from './defaultRuleGroupProcessorLDAP';
import { defaultRuleGroupProcessorMongoDB } from './defaultRuleGroupProcessorMongoDB';
import {
  defaultRuleGroupProcessorMongoDBQuery,
  mongoDbFallback,
} from './defaultRuleGroupProcessorMongoDBQuery';
import { defaultRuleGroupProcessorNL } from './defaultRuleGroupProcessorNL';
import { defaultRuleGroupProcessorParameterized } from './defaultRuleGroupProcessorParameterized';
import { defaultRuleGroupProcessorPrisma, prismaFallback } from './defaultRuleGroupProcessorPrisma';
import { defaultRuleGroupProcessorSequelize } from './defaultRuleGroupProcessorSequelize';
import { defaultRuleGroupProcessorSpEL } from './defaultRuleGroupProcessorSpEL';
import { defaultRuleGroupProcessorSQL } from './defaultRuleGroupProcessorSQL';
import { defaultRuleProcessorCEL } from './defaultRuleProcessorCEL';
import { defaultRuleProcessorDrizzle } from './defaultRuleProcessorDrizzle';
import { defaultRuleProcessorElasticSearch } from './defaultRuleProcessorElasticSearch';
import { defaultRuleProcessorJSONata } from './defaultRuleProcessorJSONata';
import { defaultRuleProcessorJsonLogic } from './defaultRuleProcessorJsonLogic';
import { defaultRuleProcessorLDAP } from './defaultRuleProcessorLDAP';
import { defaultRuleProcessorMongoDB } from './defaultRuleProcessorMongoDB';
import { defaultRuleProcessorMongoDBQuery } from './defaultRuleProcessorMongoDBQuery';
import { defaultOperatorProcessorNL, defaultRuleProcessorNL } from './defaultRuleProcessorNL';
import { defaultRuleProcessorParameterized } from './defaultRuleProcessorParameterized';
import { defaultRuleProcessorPrisma } from './defaultRuleProcessorPrisma';
import { defaultRuleProcessorSequelize } from './defaultRuleProcessorSequelize';
import { defaultRuleProcessorSpEL } from './defaultRuleProcessorSpEL';
import { defaultOperatorProcessorSQL, defaultRuleProcessorSQL } from './defaultRuleProcessorSQL';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';
import { defaultValueProcessorNL } from './defaultValueProcessorNL';
import { getQuoteFieldNamesWithArray, isValueProcessorLegacy, numerifyValues } from './utils';

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
  drizzle: defaultRuleProcessorDrizzle,
  elasticsearch: defaultRuleProcessorElasticSearch,
  json_without_ids: defaultRuleProcessorSQL,
  json: defaultRuleProcessorSQL,
  jsonata: defaultRuleProcessorJSONata,
  jsonlogic: defaultRuleProcessorJsonLogic,
  ldap: defaultRuleProcessorLDAP,
  mongodb_query: defaultRuleProcessorMongoDBQuery,
  mongodb: defaultRuleProcessorMongoDB,
  natural_language: defaultRuleProcessorNL,
  parameterized_named: defaultRuleProcessorParameterized,
  parameterized: defaultRuleProcessorParameterized,
  prisma: defaultRuleProcessorPrisma,
  sequelize: defaultRuleProcessorSequelize,
  spel: defaultRuleProcessorSpEL,
  sql: defaultRuleProcessorSQL,
} satisfies Record<ExportFormat, RuleProcessor>;

/* istanbul ignore next */
const defaultOperatorProcessor: RuleProcessor = r => r.operator;
const defaultOperatorProcessors = {
  cel: defaultOperatorProcessor,
  drizzle: defaultOperatorProcessor,
  elasticsearch: defaultOperatorProcessor,
  json_without_ids: defaultOperatorProcessor,
  json: defaultOperatorProcessor,
  jsonata: defaultOperatorProcessor,
  jsonlogic: defaultOperatorProcessor,
  ldap: defaultOperatorProcessor,
  mongodb_query: defaultOperatorProcessor,
  mongodb: defaultOperatorProcessor,
  natural_language: defaultOperatorProcessorNL,
  parameterized_named: defaultOperatorProcessorSQL,
  parameterized: defaultOperatorProcessorSQL,
  prisma: defaultOperatorProcessor,
  sequelize: defaultOperatorProcessor,
  spel: defaultOperatorProcessor,
  sql: defaultOperatorProcessorSQL,
} satisfies Record<ExportFormat, RuleProcessor>;

const defaultFallbackExpressions: Partial<Record<ExportFormat, string>> = {
  cel: '1 == 1',
  ldap: '',
  mongodb: '"$and":[{"$expr":true}]',
  natural_language: '1 is 1',
  spel: '1 == 1',
  sql: '(1 = 1)',
};

type MostFormatQueryOptions = SetOptional<
  Required<FormatQueryOptions>,
  | 'context'
  | 'fallbackExpression'
  | 'operatorProcessor'
  | 'ruleGroupProcessor'
  | 'ruleProcessor'
  | 'validator'
  | 'valueProcessor'
  | 'placeholderValueName'
  | 'parseNumbers'
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
  preserveValueOrder: false,
  placeholderFieldName: defaultPlaceholderFieldName,
  placeholderOperatorName: defaultPlaceholderOperatorName,
  quoteValuesWith: "'",
  concatOperator: '||',
  preset: 'ansi',
  wordOrder: 'SVO',
  translations: {},
  operatorMap: {},
} satisfies MostFormatQueryOptions;

const valueProcessorCanActAsRuleProcessor = (format: ExportFormat) =>
  format === 'mongodb' ||
  format === 'mongodb_query' ||
  format === 'cel' ||
  format === 'spel' ||
  format === 'jsonlogic' ||
  format === 'elasticsearch' ||
  format === 'jsonata' ||
  format === 'ldap' ||
  format === 'prisma' ||
  format === 'drizzle' ||
  format === 'sequelize';

/**
 * Generates a formatted (indented two spaces) JSON string from a query object.
 *
 * @group Export
 */
function formatQuery(ruleGroup: RuleGroupTypeAny): string;
/**
 * Generates a result based on the provided rule group processor.
 *
 * @group Export
 */
function formatQuery<TResult = unknown>(
  ruleGroup: RuleGroupTypeAny,
  options: FormatQueryOptions & { ruleGroupProcessor: RuleGroupProcessor<TResult> }
): TResult;
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
 * Generates a Prisma ORM query object from an RQB query object.
 *
 * @group Export
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'prisma' | (FormatQueryOptions & { format: 'prisma' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any>;
/**
 * Generates a Drizzle ORM query function from an RQB query object. The function can
 * be assigned to the `where` property in the Drizzle relational queries API.
 *
 * @group Export
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'drizzle' | (FormatQueryOptions & { format: 'drizzle' })
): ReturnType<typeof defaultRuleGroupProcessorDrizzle>;
/**
 * Generates a Sequelize query object from an RQB query object. The object can
 * be assigned to the `where` property in the Sequelize query functions.
 *
 * @group Export
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'sequelize' | (FormatQueryOptions & { format: 'sequelize' })
): ReturnType<typeof defaultRuleGroupProcessorSequelize>;
/**
 * Generates a JSONata query string from an RQB query object.
 *
 * NOTE: Either `parseNumbers: "strict-limited"` or `parseNumbers: true`
 * are recommended for this format.
 *
 * @group Export
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'jsonata' | (FormatQueryOptions & { format: 'jsonata' })
): string;
/**
 * Generates an LDAP query string from an RQB query object.
 *
 * @group Export
 */
function formatQuery(
  ruleGroup: RuleGroupTypeAny,
  options: 'ldap' | (FormatQueryOptions & { format: 'ldap' })
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
    quoteFieldNamesWith: quoteFieldNamesWith_option,
    ruleGroupProcessor: ruleGroupProcessor_option,
    ruleProcessor: ruleProcessor_option,
    validator,
    valueProcessor: valueProcessor_option,
    context,
  } = optObj;

  const getParseNumberBoolean = (inputType?: InputType | null): boolean | undefined => {
    const parseNumberMethod = getParseNumberMethod({ parseNumbers, inputType });
    return typeof parseNumberMethod === 'string'
      ? true
      : typeof parseNumbers === 'boolean'
        ? parseNumbers
        : undefined;
  };

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
                : format === 'prisma'
                  ? prismaFallback
                  : format === 'jsonlogic'
                    ? false
                    : format === 'elasticsearch'
                      ? {}
                      : format === 'drizzle' || format === 'sequelize'
                        ? undefined
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

  const finalOptions: FormatQueryFinalOptions = {
    ...optObj,
    fallbackExpression,
    fields,
    format,
    getOperators,
    getParseNumberBoolean,
    quoteFieldNamesWith,
    operatorProcessor,
    ruleProcessor,
    valueProcessor,
    validateRule,
    validationMap,
    context,
  };

  if (typeof ruleGroupProcessor_option === 'function') {
    return ruleGroupProcessor_option(ruleGroup, finalOptions);
  }

  switch (format) {
    case 'json':
    case 'json_without_ids': {
      const rg = parseNumbers
        ? produce(ruleGroup, g => numerifyValues(g, finalOptions))
        : ruleGroup;
      if (format === 'json_without_ids') {
        return JSON.stringify(rg, (key, value) =>
          // Remove `id` and `path` keys; leave everything else unchanged.
          key === 'id' || key === 'path' ? undefined : value
        );
      }
      return JSON.stringify(rg, null, 2);
    }

    case 'sql':
      return defaultRuleGroupProcessorSQL(ruleGroup, finalOptions);

    case 'parameterized':
    case 'parameterized_named':
      return defaultRuleGroupProcessorParameterized(ruleGroup, finalOptions);

    case 'mongodb':
      return defaultRuleGroupProcessorMongoDB(ruleGroup, finalOptions);

    case 'mongodb_query':
      return defaultRuleGroupProcessorMongoDBQuery(ruleGroup, finalOptions);

    case 'cel':
      return defaultRuleGroupProcessorCEL(ruleGroup, finalOptions);

    case 'spel':
      return defaultRuleGroupProcessorSpEL(ruleGroup, finalOptions);

    case 'jsonata':
      return defaultRuleGroupProcessorJSONata(ruleGroup, finalOptions);

    case 'jsonlogic':
      return defaultRuleGroupProcessorJsonLogic(ruleGroup, finalOptions);

    case 'elasticsearch':
      return defaultRuleGroupProcessorElasticSearch(ruleGroup, finalOptions);

    case 'natural_language':
      return defaultRuleGroupProcessorNL(ruleGroup, finalOptions);

    case 'ldap':
      return defaultRuleGroupProcessorLDAP(ruleGroup, finalOptions);

    case 'prisma':
      return defaultRuleGroupProcessorPrisma(ruleGroup, finalOptions);

    case 'drizzle':
      return defaultRuleGroupProcessorDrizzle(ruleGroup, finalOptions);

    case 'sequelize':
      return defaultRuleGroupProcessorSequelize(ruleGroup, finalOptions);

    default:
      return '';
  }
}

export { formatQuery };
