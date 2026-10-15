import { exportFormats, importFormats, ormFormats } from './formats';

type Schema = Record<string, unknown>;

const str = (description: string): Schema => ({ type: 'string', description });
const bool = (description: string): Schema => ({ type: 'boolean', description });

export const fieldsSchema: Schema = {
  description:
    'Field definitions: JSON subset of RQB `Field` — `name`, `label`, `operators`, `values`, ' +
    '`inputType`, `valueEditorType`, `valueSources`, `datatype`, etc. Array (option groups ' +
    '`{ label, options }` allowed) or object map keyed by field name. Function props ' +
    '(`validator`, etc.) are impossible over JSON. Strongly recommended: improves accuracy.',
  anyOf: [{ type: 'array', items: { type: 'object' } }, { type: 'object' }],
};

export const queryInputSchema: Schema = {
  description:
    'RQB query object (`RuleGroupType` `{ combinator, rules: [...] }` or `RuleGroupTypeIC` ' +
    '`{ rules: [rule, "and", rule, ...] }`), or its JSON string. `id`s optional.',
  anyOf: [{ type: 'object' }, { type: 'string' }],
};

const parseNumbersSchema: Schema = {
  description:
    'Render numeric-looking values as numbers. `true`/"enhanced"/"native"/"strict" ' +
    '(+ "-limited" = only fields with numeric `inputType`).',
  anyOf: [
    { type: 'boolean' },
    {
      type: 'string',
      enum: [
        'enhanced',
        'native',
        'strict',
        'enhanced-limited',
        'native-limited',
        'strict-limited',
      ],
    },
  ],
};

/** JSON-serializable subset of `FormatQueryOptions`. */
export const formatOptionsSchema: Schema = {
  type: 'object',
  description: 'JSON-serializable subset of `FormatQueryOptions` (no function options).',
  additionalProperties: false,
  properties: {
    fields: fieldsSchema,
    parseNumbers: parseNumbersSchema,
    preset: {
      type: 'string',
      enum: ['ansi', 'sqlite', 'postgresql', 'mysql', 'mssql', 'oracle'],
      description: 'SQL dialect preset (sql/parameterized formats).',
    },
    quoteFieldNamesWith: {
      description: 'Quote field names with this string, or [prefix, suffix] (e.g. ["[", "]"]).',
      anyOf: [
        { type: 'string' },
        { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 },
      ],
    },
    fieldIdentifierSeparator: str('Split field names on this (e.g. ".") before quoting parts.'),
    quoteValuesWith: str("String value quote char for sql (default `'`)."),
    paramPrefix: str('Named param prefix for parameterized_named (default ":").'),
    paramsKeepPrefix: bool('Keep `paramPrefix` in `params` keys (parameterized_named).'),
    numberedParams: bool('Numbered placeholders ($1, $2...) for parameterized.'),
    preserveValueOrder: bool('Keep between/notBetween value order as given.'),
    fallbackExpression: str('Expression emitted in place of invalid/empty groups.'),
    placeholderFieldName: str('Rules with this field are ignored (default "~").'),
    placeholderOperatorName: str('Rules with this operator are ignored (default "~").'),
    placeholderValueName: str('Rules with this value are ignored.'),
    concatOperator: str('SQL concat operator for contains/beginsWith/etc. with field values.'),
    wordOrder: str('natural_language word order, e.g. "SVO", "SOV".'),
    operatorMap: {
      type: 'object',
      description: 'natural_language operator phrases, e.g. { "=": "is", "contains": "has" }.',
    },
    translations: { type: 'object', description: 'natural_language translatable strings.' },
    context: { type: 'object', description: 'Arbitrary context passed to processors.' },
  },
};

/** JSON-serializable subset of parser options (`ParseSQLOptions` etc.). */
export const parseOptionsSchema: Schema = {
  type: 'object',
  description: 'Parser options (subset common to all parsers; extras are format-specific).',
  additionalProperties: false,
  properties: {
    fields: fieldsSchema,
    independentCombinators: bool('Produce `RuleGroupTypeIC` instead of `RuleGroupType`.'),
    listsAsArrays: bool('between/in values as arrays (default: comma-separated strings).'),
    generateIDs: bool('Add `id` to every rule/group (default false).'),
    paramPrefix: str('sql only: named param prefix in input (e.g. ":").'),
    params: {
      description: 'sql only: values for `?` (array) or named (object) placeholders.',
      anyOf: [{ type: 'array' }, { type: 'object' }],
    },
  },
};

const formatSchema = (description: string): Schema => ({
  type: 'string',
  enum: [...exportFormats, ...ormFormats],
  description: `${description} ORM formats (${ormFormats.join(', ')}) are not supported over MCP; they return an error with guidance.`,
});

const importFormatSchema = (description: string): Schema => ({
  type: 'string',
  enum: [...importFormats],
  description,
});

const sourceInputSchema: Schema = {
  description:
    'Source query: string for all formats; mongodb/jsonlogic also accept an object. ' +
    'sql accepts a full SELECT or just the WHERE clause.',
  anyOf: [{ type: 'string' }, { type: 'object' }],
};

export const formatQueryInputSchema: Schema = {
  type: 'object',
  properties: {
    query: queryInputSchema,
    format: formatSchema('Target format.'),
    options: formatOptionsSchema,
  },
  required: ['query', 'format'],
  additionalProperties: false,
};

export const parseQueryInputSchema: Schema = {
  type: 'object',
  properties: {
    input: sourceInputSchema,
    sourceFormat: importFormatSchema('Format of `input`.'),
    options: parseOptionsSchema,
  },
  required: ['input', 'sourceFormat'],
  additionalProperties: false,
};

export const convertQueryInputSchema: Schema = {
  type: 'object',
  properties: {
    input: sourceInputSchema,
    from: importFormatSchema('Source format.'),
    to: formatSchema('Target format.'),
    fields: fieldsSchema,
    parseOptions: parseOptionsSchema,
    formatOptions: formatOptionsSchema,
  },
  required: ['input', 'from', 'to'],
  additionalProperties: false,
};

export const validateQueryInputSchema: Schema = {
  type: 'object',
  properties: {
    query: queryInputSchema,
    fields: fieldsSchema,
    queryType: {
      type: 'string',
      enum: ['standard', 'ic'],
      description:
        'Expected query type: "standard" (`RuleGroupType`) or "ic" (`RuleGroupTypeIC`). Omit to accept either.',
    },
    targetFormat: {
      type: 'string',
      enum: [...exportFormats, ...ormFormats],
      description:
        'Export format the query will be sent to. Rules it cannot express (e.g. vector DB formats like "pinecone", "chroma", "qdrant", "weaviate", "milvus") are reported as warnings.',
    },
  },
  required: ['query', 'fields'],
  additionalProperties: false,
};

export const getQuerySchemaInputSchema: Schema = {
  type: 'object',
  properties: {
    fields: fieldsSchema,
    options: {
      type: 'object',
      description: '`GetQueryJsonSchemaOptions`.',
      additionalProperties: false,
      properties: {
        queryType: { type: 'string', enum: ['standard', 'ic'], description: 'Default "standard".' },
        mode: {
          type: 'string',
          enum: ['full', 'loose'],
          description: '"full" (default): per-field operator/value constraints. "loose": smaller.',
        },
        strict: bool('OpenAI structured-outputs compat (all props required, no extra props).'),
        maxDepth: {
          description: '"ref" (default, recursive $ref) or max nesting depth (inlined, no $ref).',
          anyOf: [
            { type: 'string', enum: ['ref'] },
            { type: 'integer', minimum: 0 },
          ],
        },
        includeIds: bool('Include `id`/`path` props (default false).'),
        allowFieldValueSource: bool('Allow `valueSource: "field"` (default: per field config).'),
        includeNot: bool('Include `not` on groups (default true).'),
        combinators: { type: 'array', description: 'Combinator options (default and/or).' },
        operators: { type: 'array', description: 'Fallback operators (default: all defaults).' },
        descriptions: bool('Add field labels as descriptions (default true).'),
        includeSchemaDeclaration: bool('Emit draft-07 `$schema` (default false).'),
        listsAsArrays: bool('List values as arrays (default true) or comma strings.'),
      },
    },
  },
  required: ['fields'],
  additionalProperties: false,
};

export const searchDocsInputSchema: Schema = {
  type: 'object',
  properties: {
    query: str('Search terms, e.g. "parameterized sql", "custom value editor".'),
    limit: { type: 'integer', minimum: 1, maximum: 20, description: 'Max results (default 5).' },
  },
  required: ['query'],
  additionalProperties: false,
};

export const getDocInputSchema: Schema = {
  type: 'object',
  properties: {
    page: str(
      'Doc URL (from search_docs) or slug, e.g. "utils/export" or ' +
        '"https://react-querybuilder.js.org/docs/utils/export#sql". With an #anchor, returns ' +
        'only that section.'
    ),
  },
  required: ['page'],
  additionalProperties: false,
};
