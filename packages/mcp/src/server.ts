import type { StandardSchemaWithJSON } from '@modelcontextprotocol/server';
import { fromJsonSchema, McpServer, ResourceTemplate } from '@modelcontextprotocol/server';
import { docsIndex, getPageMarkdown, resolveDocRef } from './docs';
import { exportFormats, importFormats } from './formats';
import type {
  ConvertQueryArgs,
  FormatQueryArgs,
  GetDocArgs,
  GetQuerySchemaArgs,
  ParseQueryArgs,
  SearchDocsArgs,
  ValidateQueryArgs,
} from './handlers';
import {
  handleConvertQuery,
  handleFormatQuery,
  handleGetDoc,
  handleGetQuerySchema,
  handleParseQuery,
  handleSearchDocs,
  handleValidateQuery,
} from './handlers';
import { convertFilterPrompt, setupQueryBuilderPrompt } from './prompts';
import {
  convertQueryInputSchema,
  formatQueryInputSchema,
  getDocInputSchema,
  getQuerySchemaInputSchema,
  parseQueryInputSchema,
  searchDocsInputSchema,
  validateQueryInputSchema,
} from './schemas';
import type { ToolResult } from './types';

/** Server name advertised to clients. */
export const serverName = 'react-querybuilder';

const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true } as const;
const v = docsIndex.version;

// Descriptions target agents: when to use, what's returned, accuracy tips.
const descriptions = {
  format_query:
    `Convert a React Query Builder (RQB) query object to another format with the library's own ` +
    `formatQuery (v${v}). Prefer this over hand-writing SQL/Mongo/etc. from an RQB query. ` +
    `Formats: ${exportFormats.join(', ')}. String outputs: sql, mongodb (JSON string), cel, spel, ` +
    `jsonata, ldap, cypher, gql, sparql, gremlin, milvus (vector DB filter expr), natural_language, json, json_without_ids. ` +
    `Object outputs: parameterized/parameterized_named ({ sql, params }), mongodb_query, ` +
    `jsonlogic, elasticsearch, pinecone/chroma/qdrant/weaviate (vector DB metadata filters), diagnostics. Use "natural_language" to explain a query in plain ` +
    `English. Pass options.fields for field-aware output (e.g. parseNumbers by inputType). ` +
    `ORM formats (drizzle, prisma, sequelize, tanstack_db) need live ORM objects and are not ` +
    `supported here.`,
  parse_query:
    `Parse a query string/object (${importFormats.join(', ')}) into an RQB query object ` +
    `(RuleGroupType, or RuleGroupTypeIC with options.independentCombinators). Use the result as ` +
    `the QueryBuilder \`query\`/\`defaultQuery\` prop. Pass options.fields to drop unknown fields. ` +
    `To go straight to another format, use convert_query instead.`,
  convert_query:
    `Convert between query languages in one step (parse ${importFormats.join('/')} → RQB ` +
    `query → any format_query format), e.g. SQL WHERE clause → MongoDB, JsonLogic → ` +
    `parameterized SQL. Returns the result plus the intermediate RQB query. Prefer this over ` +
    `separate parse_query + format_query calls unless you need to edit the intermediate query. ` +
    `\`fields\` applies to both steps.`,
  validate_query:
    `Validate an RQB query against a fields config: shape, IC alternation (rule, combinator, ` +
    `rule...), unknown fields, operator allowed for field, value arity (between/in), value type ` +
    `vs inputType, values-list membership, placeholders. Returns { valid, errors[], ` +
    `warnings[] }. Pass targetFormat (e.g. "qdrant") to warn about rules that format can't ` +
    `express. Run this on any query you generate before using it in app code.`,
  get_query_schema:
    `Generate a JSON Schema describing valid RQB queries for a fields config (wraps ` +
    `getQueryJsonSchema). Use it for LLM structured output / tool input schemas or Ajv ` +
    `validation. Set options.strict for OpenAI structured outputs. For app code, call ` +
    `getQueryJsonSchema from @react-querybuilder/core directly; this tool previews the output.`,
  search_docs:
    `Search the React Query Builder docs (v${v}, matching this package version). Returns ` +
    `ranked { title, url, snippet }. Follow up with get_doc for full content.`,
  get_doc:
    `Get a React Query Builder docs page (or one section, via #anchor) as markdown, by URL from ` +
    `search_docs or slug (e.g. "utils/export", "components/querybuilder", "compat").`,
};

/**
 * Creates the React Query Builder MCP server (tools, resources, prompts). Transport-agnostic;
 * see `cli.ts` for stdio.
 */
export const createServer = (): McpServer => {
  const server = new McpServer(
    { name: serverName, version: v },
    {
      instructions:
        'Tools for React Query Builder (react-querybuilder / @react-querybuilder/core). Use ' +
        'convert_query/format_query/parse_query instead of hand-writing query conversions, ' +
        'validate_query to check generated queries, and search_docs/get_doc for API details ' +
        `(docs pinned to v${v}).`,
    }
  );

  // `A` ties the JSON Schema wrapper's inferred args to the handler's arg type
  // oxlint-disable-next-line typescript/no-unnecessary-type-parameters
  const addTool = <A>(
    name: keyof typeof descriptions,
    title: string,
    inputSchema: Record<string, unknown>,
    handler: (args: A) => Promise<ToolResult>
  ) =>
    server.registerTool<StandardSchemaWithJSON, StandardSchemaWithJSON<A, A>>(
      name,
      {
        title,
        description: descriptions[name],
        inputSchema: fromJsonSchema<A>(inputSchema),
        annotations: readOnly,
      },
      args => handler(args)
    );

  addTool<FormatQueryArgs>(
    'format_query',
    'Format query',
    formatQueryInputSchema,
    handleFormatQuery
  );
  addTool<ParseQueryArgs>('parse_query', 'Parse query', parseQueryInputSchema, handleParseQuery);
  addTool<ConvertQueryArgs>(
    'convert_query',
    'Convert query',
    convertQueryInputSchema,
    handleConvertQuery
  );
  addTool<ValidateQueryArgs>(
    'validate_query',
    'Validate query',
    validateQueryInputSchema,
    handleValidateQuery
  );
  addTool<GetQuerySchemaArgs>(
    'get_query_schema',
    'Get query JSON Schema',
    getQuerySchemaInputSchema,
    handleGetQuerySchema
  );
  addTool<SearchDocsArgs>('search_docs', 'Search docs', searchDocsInputSchema, handleSearchDocs);
  addTool<GetDocArgs>('get_doc', 'Get doc page', getDocInputSchema, handleGetDoc);

  // #region Resources

  server.registerResource(
    'docs',
    new ResourceTemplate('rqb://docs/{+slug}', {
      list: () => ({
        resources: docsIndex.pages.map(p => ({
          uri: `rqb://docs/${p.slug}`,
          name: p.slug,
          title: p.title,
          description: p.description,
          mimeType: 'text/markdown',
        })),
      }),
    }),
    {
      title: 'React Query Builder docs',
      description: `Docs pages as markdown (v${v})`,
      mimeType: 'text/markdown',
    },
    (uri, { slug }) => {
      const ref = resolveDocRef(String(slug));
      if (!ref) throw new Error(`No doc page "${slug}"`);
      return {
        contents: [{ uri: uri.href, mimeType: 'text/markdown', text: getPageMarkdown(ref.page) }],
      };
    }
  );

  server.registerResource(
    'types',
    new ResourceTemplate('rqb://types/{name}', {
      list: () => ({
        resources: Object.keys(docsIndex.types).map(name => ({
          uri: `rqb://types/${name}`,
          name,
          mimeType: 'text/x-typescript',
        })),
      }),
    }),
    {
      title: 'React Query Builder key types',
      description: `TypeScript declarations of key types (v${v})`,
      mimeType: 'text/x-typescript',
    },
    (uri, { name }) => {
      const decl = docsIndex.types[String(name)];
      if (!decl) throw new Error(`No type "${name}"`);
      return { contents: [{ uri: uri.href, mimeType: 'text/x-typescript', text: decl }] };
    }
  );

  // #endregion

  // #region Prompts

  server.registerPrompt(
    'setup_query_builder',
    {
      title: 'Set up a query builder',
      description: 'Step-by-step instructions for adding a React Query Builder UI to an app',
      argsSchema: fromJsonSchema<{ uiLibrary?: string; fields?: string }>({
        type: 'object',
        properties: {
          uiLibrary: {
            type: 'string',
            description:
              'UI library: none, antd, bootstrap, bulma, chakra, fluent, mantine, material, prime, tremor, native',
          },
          fields: { type: 'string', description: 'Description of the fields to filter on' },
        },
      }),
    },
    ({ uiLibrary, fields }) => setupQueryBuilderPrompt(uiLibrary, fields)
  );

  server.registerPrompt(
    'convert_filter',
    {
      title: 'Convert a filter',
      description: 'Instructions for converting a filter/query between formats with RQB tools',
      argsSchema: fromJsonSchema<{ input: string; from?: string; to?: string }>({
        type: 'object',
        properties: {
          input: { type: 'string', description: 'The filter/query to convert' },
          from: { type: 'string', description: `Source format (${importFormats.join(', ')})` },
          to: { type: 'string', description: 'Target format (any format_query format)' },
        },
        required: ['input'],
      }),
    },
    ({ input, from, to }) => convertFilterPrompt(input, from, to)
  );

  // #endregion

  return server;
};
