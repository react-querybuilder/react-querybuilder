import type {
  DiagnosticEntry,
  FormatQueryOptions,
  FullField,
  GetQueryJsonSchemaOptions,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import {
  bigIntJsonParseReviver,
  bigIntJsonStringifyReplacer,
  formatQuery,
  getQueryJsonSchema,
  isRuleGroupTypeIC,
} from '@react-querybuilder/core';
import { docsIndex, getDocMarkdown, resolveDocRef, searchDocs } from './docs';
import type { McpExportFormat, McpImportFormat } from './formats';
import { exportFormats, importFormats, ormFormats } from './formats';
import type { ToolResult } from './types';

/** JSON-serializable `fields` (array, option groups, or object map). */
export type FieldsInput = unknown[] | Record<string, unknown>;

/** JSON-serializable subset of {@link FormatQueryOptions}. */
export type FormatOptionsInput = Omit<
  FormatQueryOptions,
  | 'format'
  | 'fields'
  | 'validator'
  | 'getOperators'
  | 'getParameters'
  | 'operatorProcessor'
  | 'valueProcessor'
  | 'ruleProcessor'
  | 'ruleGroupProcessor'
> & { fields?: FieldsInput };

/** JSON-serializable parser options. */
export interface ParseOptionsInput {
  fields?: FieldsInput;
  independentCombinators?: boolean;
  listsAsArrays?: boolean;
  generateIDs?: boolean;
  paramPrefix?: string;
  params?: unknown[] | Record<string, unknown>;
}

export interface FormatQueryArgs {
  query: unknown;
  format: string;
  options?: FormatOptionsInput;
}

export interface ParseQueryArgs {
  input: unknown;
  sourceFormat: string;
  options?: ParseOptionsInput;
}

export interface ConvertQueryArgs {
  input: unknown;
  from: string;
  to: string;
  fields?: FieldsInput;
  parseOptions?: ParseOptionsInput;
  formatOptions?: FormatOptionsInput;
}

export interface ValidateQueryArgs {
  query: unknown;
  fields: FieldsInput;
  queryType?: 'standard' | 'ic';
}

export interface GetQuerySchemaArgs {
  fields: FieldsInput;
  options?: GetQueryJsonSchemaOptions;
}

export interface SearchDocsArgs {
  query: string;
  limit?: number;
}

export interface GetDocArgs {
  page: string;
}

/** Validation issue reported by `validate_query`. */
export interface ValidationIssue {
  code: string;
  message: string;
  path: number[];
}

// #region Helpers

const docsUrl = 'https://react-querybuilder.js.org/docs';

/** JSON round-trip (bigints → `{ $bigint }`); strips non-JSON values. */
const toJson = (v: unknown): unknown => JSON.parse(JSON.stringify(v, bigIntJsonStringifyReplacer));

const stringify = (v: unknown): string =>
  typeof v === 'string' ? v : JSON.stringify(v, bigIntJsonStringifyReplacer, 2);

export const ok = (structured: Record<string, unknown>, text?: string): ToolResult => {
  const structuredContent = toJson(structured) as Record<string, unknown>;
  return {
    content: [{ type: 'text', text: text ?? stringify(structuredContent) }],
    structuredContent,
  };
};

export const fail = (message: string): ToolResult => ({
  content: [{ type: 'text', text: message }],
  isError: true,
});

const errMsg = (e: unknown): string => (e instanceof Error ? e.message : String(e));

class InputError extends Error {}

/** Parses `query` input (object or JSON string). Throws {@link InputError}. */
export const parseQueryInput = (query: unknown): unknown => {
  if (typeof query !== 'string') return query;
  try {
    return JSON.parse(query, bigIntJsonParseReviver);
  } catch (e) {
    throw new InputError(`\`query\` is a string but not valid JSON: ${errMsg(e)}`);
  }
};

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Structural checks `diagnostics` assumes (group `rules` array, rule `field`/`operator`). */
export const checkShape = (q: unknown, path: number[] = []): ValidationIssue[] => {
  const issue = (message: string, p = path): ValidationIssue => ({
    code: 'INVALID_SHAPE',
    message,
    path: p,
  });
  if (!isObj(q) || !Array.isArray(q.rules)) {
    return [issue('Expected a rule group object with a `rules` array')];
  }
  const ic = q.combinator === undefined;
  if (!ic && typeof q.combinator !== 'string') {
    return [issue('Group `combinator` must be a string (or omitted for RuleGroupTypeIC)')];
  }
  return q.rules.flatMap((r, i): ValidationIssue[] => {
    const p = [...path, i];
    if (typeof r === 'string') {
      return ic ? [] : [issue(`Combinator string at index ${i} in a non-IC group`, p)];
    }
    if (isObj(r) && Array.isArray(r.rules)) return checkShape(r, p);
    if (!isObj(r)) return [issue('Expected a rule or group object', p)];
    const missing = (['field', 'operator'] as const).filter(k => typeof r[k] !== 'string');
    return missing.length > 0
      ? [issue(`Rule is missing string ${missing.map(k => `\`${k}\``).join(' and ')}`, p)]
      : [];
  });
};

const asRuleGroup = (query: unknown): RuleGroupTypeAny => {
  const q = parseQueryInput(query);
  const issues = checkShape(q);
  if (issues.length > 0) {
    throw new InputError(
      `Invalid query shape:\n${issues.map(i => `- [${i.path.join(',')}] ${i.message}`).join('\n')}`
    );
  }
  return q as RuleGroupTypeAny;
};

const ormError = (format: string) =>
  fail(
    `Format "${format}" produces ORM objects (needs live ${format} column/operator objects) and ` +
      `can't be produced over MCP. Call \`formatQuery(query, { format: '${format}', context: ` +
      `{ ... } })\` in app code instead. See ${docsUrl}/utils/export#orms. For a SQL string ` +
      `equivalent, use "sql" or "parameterized".`
  );

/** Wraps a handler: input errors and unexpected throws → `isError` results (never throws). */
const safe =
  <A>(fn: (args: A) => ToolResult | Promise<ToolResult>) =>
  async (args: A): Promise<ToolResult> => {
    try {
      return await fn(args);
    } catch (e) {
      return fail(e instanceof InputError ? e.message : `Error: ${errMsg(e)}`);
    }
  };

// #endregion

// #region Parsers

type Parser = (input: unknown, options?: Record<string, unknown>) => RuleGroupTypeAny;

// Lazy subpath imports: only the requested parser (and its deps) load.
const parserLoaders: Record<McpImportFormat, () => Promise<Parser>> = {
  sql: async () => (await import('@react-querybuilder/core/parseSQL')).parseSQL as Parser,
  cel: async () => (await import('@react-querybuilder/core/parseCEL')).parseCEL as Parser,
  mongodb: async () =>
    (await import('@react-querybuilder/core/parseMongoDB')).parseMongoDB as Parser,
  jsonlogic: async () =>
    (await import('@react-querybuilder/core/parseJsonLogic')).parseJsonLogic as Parser,
  spel: async () => (await import('@react-querybuilder/core/parseSpEL')).parseSpEL as Parser,
  jsonata: async () =>
    (await import('@react-querybuilder/core/parseJSONata')).parseJSONata as Parser,
  cypher: async () => (await import('@react-querybuilder/core/parseCypher')).parseCypher as Parser,
  gql: async () => (await import('@react-querybuilder/core/parseCypher')).parseGQL as Parser,
  gremlin: async () =>
    (await import('@react-querybuilder/core/parseGremlin')).parseGremlin as Parser,
  sparql: async () => (await import('@react-querybuilder/core/parseSPARQL')).parseSPARQL as Parser,
};

const objectInputFormats = new Set<string>(['mongodb', 'jsonlogic']);

const runParser = async (
  input: unknown,
  sourceFormat: string,
  options: ParseOptionsInput = {}
): Promise<{ query: RuleGroupTypeAny; warnings: string[] }> => {
  if (!(importFormats as readonly string[]).includes(sourceFormat)) {
    throw new InputError(
      `Unknown sourceFormat "${sourceFormat}". Supported: ${importFormats.join(', ')}`
    );
  }
  if (typeof input !== 'string' && !objectInputFormats.has(sourceFormat)) {
    throw new InputError(`\`input\` must be a string for sourceFormat "${sourceFormat}"`);
  }
  const parse = await parserLoaders[sourceFormat as McpImportFormat]();
  const query = parse(input, options as Record<string, unknown>);
  const warnings: string[] = [];
  if (query.rules.length === 0) {
    warnings.push(
      `Parsed query has no rules. The input may be invalid ${sourceFormat}, use unsupported ` +
        `constructs, or reference fields not in \`fields\` (rules with unknown fields are dropped).`
    );
  }
  return { query, warnings };
};

// #endregion

// #region Handlers

const runFormat = (
  query: RuleGroupTypeAny,
  format: string,
  options: FormatOptionsInput = {}
): unknown => {
  if (!(exportFormats as readonly string[]).includes(format)) {
    throw new InputError(`Unknown format "${format}". Supported: ${exportFormats.join(', ')}`);
  }
  return formatQuery(query, {
    ...(options as FormatQueryOptions),
    format: format as McpExportFormat,
  });
};

const isOrm = (f: string) => (ormFormats as readonly string[]).includes(f);

export const handleFormatQuery: (args: FormatQueryArgs) => Promise<ToolResult> = safe(
  ({ query, format, options }: FormatQueryArgs) => {
    if (isOrm(format)) return ormError(format);
    const result = runFormat(asRuleGroup(query), format, options);
    return ok({ format, result }, stringify(result));
  }
);

export const handleParseQuery: (args: ParseQueryArgs) => Promise<ToolResult> = safe(
  async ({ input, sourceFormat, options }: ParseQueryArgs) => {
    const { query, warnings } = await runParser(input, sourceFormat, options);
    return ok(
      { query, warnings },
      [stringify(query), ...warnings.map(w => `Warning: ${w}`)].join('\n\n')
    );
  }
);

export const handleConvertQuery: (args: ConvertQueryArgs) => Promise<ToolResult> = safe(
  async ({ input, from, to, fields, parseOptions, formatOptions }: ConvertQueryArgs) => {
    if (isOrm(to)) return ormError(to);
    const { query, warnings } = await runParser(input, from, {
      ...(fields ? { fields } : null),
      ...parseOptions,
    });
    const result = runFormat(query, to, { ...(fields ? { fields } : null), ...formatOptions });
    return ok(
      { result, query, warnings },
      [
        stringify(result),
        `Intermediate RQB query:\n${stringify(query)}`,
        ...warnings.map(w => `Warning: ${w}`),
      ].join('\n\n')
    );
  }
);

/** Diagnostic codes reported as warnings (not validity failures). */
const warningCodes = new Set(['MUTED', 'UNREFERENCED_FIELD']);

const toIssue = (d: DiagnosticEntry): ValidationIssue => ({
  code: d.code,
  message: d.message,
  path: d.path,
});

export const handleValidateQuery: (args: ValidateQueryArgs) => Promise<ToolResult> = safe(
  ({ query: queryInput, fields, queryType }: ValidateQueryArgs) => {
    const query = parseQueryInput(queryInput);
    const shapeErrors = checkShape(query);
    if (shapeErrors.length > 0) {
      return ok({ valid: false, errors: shapeErrors, warnings: [] });
    }
    const rg = query as RuleGroupTypeAny;
    const errors: ValidationIssue[] = [];
    const actualType = isRuleGroupTypeIC(rg) ? 'ic' : 'standard';
    if (queryType && queryType !== actualType) {
      errors.push({
        code: 'WRONG_QUERY_TYPE',
        message: `Expected ${queryType === 'ic' ? 'RuleGroupTypeIC (no group `combinator`; combinator strings between rules)' : 'RuleGroupType (group `combinator`; no combinator strings in `rules`)'}, got ${actualType === 'ic' ? 'RuleGroupTypeIC' : 'RuleGroupType'}. Convert with \`convertQuery\`.`,
        path: [],
      });
    }
    // formatQuery ignores object-map fields; normalize to array (key → name/value)
    const fieldList: FullField[] = Array.isArray(fields)
      ? (fields as FullField[])
      : // oxlint-disable-next-line oxc/no-map-spread
        Object.entries(fields).map(([name, f]) => ({ ...(f as FullField), name, value: name }));
    const { diagnostics } = formatQuery(rg, { format: 'diagnostics', fields: fieldList });
    errors.push(...diagnostics.filter(d => !warningCodes.has(d.code)).map(toIssue));
    const warnings = diagnostics.filter(d => warningCodes.has(d.code)).map(toIssue);
    const valid = errors.length === 0;
    const summary = valid
      ? `Valid.${warnings.length > 0 ? `\nWarnings:\n${warnings.map(w => `- ${w.message}`).join('\n')}` : ''}`
      : undefined;
    return ok({ valid, errors, warnings }, summary);
  }
);

export const handleGetQuerySchema: (args: GetQuerySchemaArgs) => Promise<ToolResult> = safe(
  ({ fields, options }: GetQuerySchemaArgs) => {
    const schema = getQueryJsonSchema(fields as FullField[], options);
    return ok({ schema }, stringify(schema));
  }
);

export const handleSearchDocs: (args: SearchDocsArgs) => Promise<ToolResult> = safe(
  ({ query, limit = 5 }: SearchDocsArgs) => {
    const results = searchDocs(query, limit);
    const text =
      results.length === 0
        ? `No results for "${query}". Try fewer or different terms.`
        : results.map(r => `## ${r.title}\n${r.url}\n${r.snippet}`).join('\n\n');
    return ok({ results, docsVersion: docsIndex.version }, text);
  }
);

export const handleGetDoc: (args: GetDocArgs) => Promise<ToolResult> = safe(
  ({ page }: GetDocArgs) => {
    const ref = resolveDocRef(page);
    const markdown = ref && getDocMarkdown(ref.page, ref.anchor);
    if (!ref || markdown === undefined) {
      const suggestions = searchDocs(page.replace(/[^\w]+/g, ' '), 3);
      return fail(
        `No doc ${ref ? `section "#${ref.anchor}" on page "${ref.page.slug}"` : `page "${page}"`}.` +
          (suggestions.length > 0
            ? ` Did you mean:\n${suggestions.map(s => `- ${s.url}`).join('\n')}`
            : ' Use search_docs to find pages.')
      );
    }
    return ok({ url: ref.page.url, title: ref.page.title, markdown }, markdown);
  }
);

// #endregion
