/**
 * Generates the export-format and parser tables in `skills/react-querybuilder/references/*.md`
 * (between `<!-- GENERATED:start -->`/`<!-- GENERATED:end -->`).
 *
 * - `bun ./utils/skill-tables.ts` - write
 * - `bun ./utils/skill-tables.ts --check` - exit 1 on drift
 *
 * Sources of truth: `ExportFormat` (exhaustive via `satisfies Record<ExportFormat, …>`) and the
 * `parse*` exports of each `./parse*` subpath in `packages/core/package.json`.
 */
import path from 'node:path';
import type { FormatConfig } from 'oxfmt';
import { format } from 'oxfmt';
import type { ExportFormat } from '../packages/core/src/types/export';

const root = path.join(import.meta.dirname, '..');
const refsDir = path.join(root, 'skills/react-querybuilder/references');
const START = '<!-- GENERATED:start -->';
const END = '<!-- GENERATED:end -->';

interface FormatMeta {
  target: string;
  returns: string;
  notes: string;
}

// Row order = table order. Typecheck fails if a format is missing or unknown.
const formats = {
  json: {
    target: 'Persist/transport',
    returns: 'string',
    notes: 'Pretty JSON incl. ids. Not validated.',
  },
  json_without_ids: {
    target: 'Persist/transport',
    returns: 'string',
    notes: 'Compact JSON, no `id`/`path`. Not validated.',
  },
  sql: {
    target: 'SQL (inline values)',
    returns: 'string',
    notes: '`WHERE` clause body. **Not for untrusted input**; prefer parameterized.',
  },
  parameterized: {
    target: 'SQL (bind params)',
    returns: '`{ sql, params: unknown[] }`',
    notes: "`?` placeholders, or `$1`… with `numberedParams`/`preset: 'postgresql'`.",
  },
  parameterized_named: {
    target: 'SQL (named params)',
    returns: '`{ sql, params: Record<string, unknown> }`',
    notes: '`:field_1` placeholders; keys lack prefix unless `paramsKeepPrefix`.',
  },
  prisma: {
    target: 'Prisma',
    returns: 'object',
    notes: "Pass as `where`. No `valueSource: 'field'`.",
  },
  drizzle: {
    target: 'Drizzle',
    returns: '`(columns, operators) => SQL \\| undefined`',
    notes: 'Pass as relational `where`, or call with `(table, getOperators())`.',
  },
  sequelize: {
    target: 'Sequelize',
    returns: 'object \\| `undefined`',
    notes:
      'Requires `context: { sequelizeOperators: Op }`; field-to-field also needs `sequelizeCol: col` (+ `sequelizeFn: fn`).',
  },
  tanstack_db: {
    target: 'TanStack DB',
    returns: '`refs => expression` \\| `undefined`',
    notes:
      'Requires `context: { tanStackDbOperators }` (whole `@tanstack/db` module or picked ops).',
  },
  mongodb_query: { target: 'MongoDB', returns: 'object', notes: 'Recommended Mongo format.' },
  mongodb: {
    target: 'MongoDB (string)',
    returns: 'string',
    notes: '**Deprecated**; use `mongodb_query`.',
  },
  elasticsearch: {
    target: 'Elasticsearch',
    returns: 'object',
    notes: 'Experimental. Query DSL `bool` query.',
  },
  jsonlogic: { target: 'JsonLogic', returns: 'object', notes: '' },
  cel: { target: 'CEL', returns: 'string', notes: '' },
  spel: { target: 'Spring SpEL', returns: 'string', notes: '' },
  jsonata: {
    target: 'JSONata',
    returns: 'string',
    notes: 'Use `parseNumbers` for numeric comparisons.',
  },
  ldap: { target: 'LDAP', returns: 'string', notes: "No `valueSource: 'field'`." },
  cypher: { target: 'Cypher (Neo4j)', returns: 'string', notes: '`WHERE` expression.' },
  gql: { target: 'GQL (ISO graph)', returns: 'string', notes: 'Same output as `cypher`.' },
  sparql: { target: 'SPARQL', returns: 'string', notes: '`FILTER` expression.' },
  gremlin: {
    target: 'Gremlin',
    returns: 'string',
    notes: '`.has()` chain / `__.and()`/`__.or()` steps.',
  },
  natural_language: {
    target: 'Human-readable display',
    returns: 'string',
    notes:
      '**Display only**, never parse it back. Configurable via `translations`, `operatorMap`, `wordOrder`.',
  },
  diagnostics: {
    target: 'Debugging/validation',
    returns: '`{ query, diagnostics, stats, fieldSummary }`',
    notes:
      'Annotated tree + flat entries `{ id, path, code, message, source }`. Pass `fields` for field/type checks.',
  },
} satisfies Record<ExportFormat, FormatMeta>;

interface ParserMeta {
  input: string;
  options: string;
}

const graphOpts = '`fields`/`getValueSources` only (whitelist; see below)';

// Keyed by exported function name. Checked at runtime against actual subpath exports.
const parsers: Record<string, ParserMeta> = {
  parseSQL: {
    input: 'string: full `SELECT` or `WHERE` clause',
    options: '`params` (array or record), `paramPrefix`, `parseParameters`, `getExpression`',
  },
  parseMongoDB: {
    input: 'object or JSON string',
    options: '`additionalOperators`, `preventOperatorNegation`, `getExpression`',
  },
  parseJsonLogic: {
    input: 'object or JSON string',
    options: '`jsonLogicOperations`, `getExpression`',
  },
  parseCEL: { input: 'string', options: '`customExpressionHandler`, `getExpression`' },
  parseSpEL: { input: 'string', options: '`getExpression`' },
  parseJSONata: { input: 'string', options: '`getExpression`' },
  parseCypher: { input: 'string: full query, `WHERE …`, or expression', options: graphOpts },
  parseGQL: { input: 'string', options: graphOpts },
  parseGremlin: { input: 'string: traversal or `.has()` chain', options: graphOpts },
  parseSPARQL: { input: 'string: full query or `FILTER` expression', options: graphOpts },
};

const row = (cells: string[]) => `| ${cells.join(' | ')} |`;
const table = (header: string[], rows: string[][]) =>
  [row(header), row(header.map(() => '---')), ...rows.map(r => row(r))].join('\n');

const formatTable = (): string =>
  table(
    ['Target', '`format`', 'Returns', 'Notes'],
    Object.entries(formats).map(([f, m]) => [m.target, `\`${f}\``, m.returns, m.notes])
  );

/** Maps each exported `parse*` fn to its subpath, from core `package.json` `exports`. */
const discoverParsers = async (): Promise<Map<string, string>> => {
  const pkg = await Bun.file(path.join(root, 'packages/core/package.json')).json();
  const found = new Map<string, string>();
  for (const subpath of Object.keys(pkg.exports as Record<string, unknown>)) {
    const name = subpath.replace(/^\.\//, '');
    if (!name.startsWith('parse')) continue;
    // oxlint-disable-next-line no-await-in-loop
    const mod: Record<string, unknown> = await import(
      path.join(root, 'packages/core/src/utils', name, 'index.ts')
    );
    for (const [k, v] of Object.entries(mod))
      if (k.startsWith('parse') && typeof v === 'function')
        found.set(k, `@react-querybuilder/core/${name}`);
  }
  return found;
};

const parserTable = async (): Promise<string> => {
  const actual = await discoverParsers();
  const missing = [...actual.keys()].filter(p => !(p in parsers));
  const extra = Object.keys(parsers).filter(p => !actual.has(p));
  if (missing.length || extra.length)
    throw new Error(
      `skill-tables: parser metadata out of sync. Missing: [${missing}]. Unknown: [${extra}].`
    );
  return table(
    ['Parser', 'Subpath', 'Input', 'Extra options (besides common)'],
    Object.entries(parsers).map(([p, m]) => [
      `\`${p}\``,
      `\`${actual.get(p)}\``,
      m.input,
      m.options,
    ])
  );
};

const replaceGenerated = (src: string, body: string, file: string): string => {
  const s = src.indexOf(START);
  const e = src.indexOf(END);
  if (s < 0 || e < s) throw new Error(`skill-tables: markers not found in ${file}`);
  return `${src.slice(0, s + START.length)}\n\n${body}\n\n${src.slice(e)}`;
};

const targets: [file: string, gen: () => string | Promise<string>][] = [
  ['export-formats.md', formatTable],
  ['import-parsers.md', parserTable],
];

// `format()` doesn't read `.oxfmtrc.json` itself
const { $schema: _, ...fmtConfig }: FormatConfig & { $schema?: string } = Bun.JSONC.parse(
  await Bun.file(path.join(root, '.oxfmtrc.json')).text()
) as FormatConfig;

const check = process.argv.includes('--check');
let drift = false;

for (const [file, gen] of targets) {
  const p = path.join(refsDir, file);
  // oxlint-disable-next-line no-await-in-loop
  const current = await Bun.file(p).text();
  // oxlint-disable-next-line no-await-in-loop
  const next = (await format(p, replaceGenerated(current, await gen(), file), fmtConfig)).code;
  if (next === current) continue;
  if (check) {
    drift = true;
    console.error(`Out of date: ${path.relative(root, p)}`);
  } else {
    // oxlint-disable-next-line no-await-in-loop
    await Bun.write(p, next);
    console.log(`Updated ${path.relative(root, p)}`);
  }
}

if (drift) {
  console.error('Run `bun skills:generate`.');
  process.exit(1);
}
