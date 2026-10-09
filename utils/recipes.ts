/**
 * Generates `tips/recipes.mdx` (current + latest versioned docs): snippet + exact output per export
 * format/parser.
 *
 * - `bun ./utils/recipes.ts` - write
 * - `bun ./utils/recipes.ts --check` - exit 1 on drift
 *
 * Outputs come from running core source, so docs can't drift. Exhaustive over `ExportFormat`
 * (`satisfies`) and over `parse*` exports of core `./parse*` subpaths (runtime check).
 */
import path from 'node:path';
import type { FormatConfig } from 'oxfmt';
import { format } from 'oxfmt';
import type { ExportFormat, Field, RuleGroupType } from '../packages/core/src';
import { formatQuery } from '../packages/core/src';

const root = path.join(import.meta.dirname, '..');
// Current docs + latest version (served at /docs)
const [latest] = (await Bun.file(path.join(root, 'website/versions.json')).json()) as string[];
const outFiles = ['website/docs', `website/versioned_docs/version-${latest}`].map(d =>
  path.join(root, d, 'tips/recipes.mdx')
);

const fields: Field[] = [
  { name: 'firstName', label: 'First name' },
  { name: 'lastName', label: 'Last name' },
  { name: 'age', label: 'Age', inputType: 'number' },
  { name: 'isMusician', label: 'Is a musician', valueEditorType: 'checkbox' },
];

const query: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'firstName', operator: 'beginsWith', value: 'Stev' },
    { field: 'age', operator: 'between', value: [18, 65] },
    {
      combinator: 'or',
      rules: [
        { field: 'lastName', operator: 'in', value: ['Vai', 'Vaughan'] },
        { field: 'isMusician', operator: '=', value: true },
      ],
    },
  ],
};

interface FormatRecipe {
  /** Extra `formatQuery` options (JS source + runtime value must match). */
  opts?: { src: string; value: Record<string, unknown> };
  /** Code fence lang for output. */
  lang?: string;
  /** Prose after the heading. */
  note?: string;
  /** No runnable output (needs ORM context); show snippet only. */
  noOutput?: string;
}

const pn = { src: `{ format: '%F', parseNumbers: true }`, value: { parseNumbers: true } };

// Row order = page order. Typecheck fails if a format is missing or unknown.
const formats = {
  sql: {
    lang: 'sql',
    note: 'Inline values. **Not for untrusted input**; prefer `parameterized`. Add `parseNumbers: true` to emit unquoted numbers.',
  },
  parameterized: { lang: 'json' },
  parameterized_named: { lang: 'json' },
  mongodb_query: { lang: 'json' },
  mongodb: { lang: 'json', note: '**Deprecated**; use `mongodb_query`.' },
  elasticsearch: { lang: 'json', note: 'Experimental.' },
  jsonlogic: { lang: 'json' },
  cel: { lang: 'text' },
  spel: { lang: 'text' },
  jsonata: { opts: pn, lang: 'text' },
  ldap: { lang: 'text' },
  cypher: { lang: 'cypher' },
  gql: { lang: 'cypher' },
  sparql: { lang: 'sparql' },
  gremlin: { lang: 'groovy' },
  natural_language: {
    opts: { src: `{ format: '%F', fields }`, value: { fields } },
    lang: 'text',
    note: '**Display only.** Never parse it back.',
  },
  prisma: { lang: 'json', note: "Pass as `where`. No `valueSource: 'field'` support." },
  drizzle: {
    noOutput:
      'Returns `(columns, operators) => SQL | undefined`. Pass as a relational query `where`, or call with `(table, getOperators())` from `drizzle-orm`.',
  },
  sequelize: {
    opts: { src: `{ format: '%F', context: { sequelizeOperators: Op } }`, value: {} },
    noOutput: 'Returns a Sequelize `where` object (`Op` from `sequelize`).',
  },
  tanstack_db: {
    opts: {
      src: `{ format: '%F', context: { tanStackDbOperators } }`,
      value: {},
    },
    noOutput:
      'Returns `refs => expression` for `.where()` in a TanStack DB live query (`tanStackDbOperators` = `@tanstack/db` module or picked operators).',
  },
  json: { lang: 'json' },
  json_without_ids: { lang: 'json' },
  diagnostics: {
    opts: { src: `{ format: '%F', fields }`, value: { fields } },
    lang: 'json',
    note: 'Annotated tree + flat diagnostics. Pass `fields` for field/type checks.',
  },
} satisfies Record<ExportFormat, FormatRecipe>;

interface ParserRecipe {
  input: string;
  note?: string;
}

// Keyed by exported fn name. Inputs are idiomatic for each language.
const parsers: Record<string, ParserRecipe> = {
  parseSQL: {
    input: `SELECT * FROM t WHERE firstName LIKE 'Stev%' AND (lastName IN ('Vai', 'Vaughan') OR age BETWEEN 18 AND 65)`,
  },
  parseMongoDB: {
    input: `{"$and":[{"firstName":{"$regex":"^Stev"}},{"age":{"$gte":18,"$lte":65}}]}`,
  },
  parseJsonLogic: {
    input: `{"and":[{"startsWith":[{"var":"firstName"},"Stev"]},{"<=":[18,{"var":"age"},65]}]}`,
  },
  parseCEL: { input: `firstName.startsWith("Stev") && (age >= 18 || isMusician == true)` },
  parseSpEL: { input: `lastName == 'Vai' and age >= 18` },
  parseJSONata: { input: `$contains(firstName, "Stev") and age >= 18` },
  parseCypher: {
    input: `MATCH (p:Person) WHERE p.firstName STARTS WITH 'Stev' AND p.age >= 18 RETURN p`,
    note: 'Only `WHERE` conditions are kept; property access (`p.age`) stays in `field`.',
  },
  parseGQL: { input: `MATCH (p:Person) WHERE p.age >= 18 AND p.lastName IN ['Vai', 'Vaughan']` },
  parseGremlin: {
    input: `g.V().has('firstName', startingWith('Stev')).has('age', between(18, 65))`,
  },
  parseSPARQL: {
    input: `SELECT ?p WHERE { ?p ex:age ?age . FILTER(STRSTARTS(?firstName, "Stev") && ?age >= 18) }`,
    note: 'Only `FILTER` conditions are kept; variables keep their `?` prefix.',
  },
};

/** Maps each exported `parse*` fn to [subpath, fn], from core `package.json` `exports`. */
const discoverParsers = async () => {
  const pkg = await Bun.file(path.join(root, 'packages/core/package.json')).json();
  const found = new Map<string, [string, (...args: unknown[]) => unknown]>();
  for (const subpath of Object.keys(pkg.exports as Record<string, unknown>)) {
    const name = subpath.replace(/^\.\//, '');
    if (!name.startsWith('parse')) continue;
    // oxlint-disable-next-line no-await-in-loop
    const mod: Record<string, unknown> = await import(
      path.join(root, 'packages/core/src/utils', name, 'index.ts')
    );
    for (const [k, v] of Object.entries(mod))
      if (k.startsWith('parse') && typeof v === 'function')
        found.set(k, [`@react-querybuilder/core/${name}`, v as (...args: unknown[]) => unknown]);
  }
  return found;
};

const show = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v));
const fence = (lang: string, body: string, title?: string) =>
  `\`\`\`${lang}${title ? ` title="${title}"` : ''}\n${body}\n\`\`\``;
const jsStr = (s: string) => (s.includes("'") ? JSON.stringify(s) : `'${s}'`);

const header = `---
title: Recipes
description: Shortest working snippet and exact output for every export format and import parser
---

{/* GENERATED by utils/recipes.ts. Do not edit; run \`bun recipes:generate\`. */}

Every snippet on this page was run against the current source and the output shown is exact. All snippets work on the server with \`@react-querybuilder/core\` (\`react-querybuilder\` re-exports the same functions). See [Export](../utils/export) and [Import](../utils/import) for full option references.

## Shared setup

The export recipes use this \`query\` and \`fields\`:

${fence(
  'ts',
  `import type { Field, RuleGroupType } from '@react-querybuilder/core';

const fields: Field[] = ${JSON.stringify(fields)};

const query: RuleGroupType = ${JSON.stringify(query)};`
)}

## Export (\`formatQuery\`)
`;

const genFormats = () =>
  Object.entries(formats as Record<ExportFormat, FormatRecipe>)
    .map(([f, r]) => {
      const optsSrc = r.opts?.src.replace('%F', f) ?? `'${f}'`;
      const imports =
        f === 'tanstack_db'
          ? `import * as tanStackDbOperators from '@tanstack/db';\n`
          : f === 'sequelize'
            ? `import { Op } from 'sequelize';\n`
            : '';
      const snippet = fence(
        'ts',
        `${imports}import { formatQuery } from '@react-querybuilder/core';\n\nformatQuery(query, ${optsSrc});`
      );
      const parts = [`### \`${f}\``];
      if (r.note) parts.push(r.note);
      parts.push(snippet);
      if (r.noOutput) parts.push(r.noOutput);
      else {
        const out = formatQuery(query, { format: f as ExportFormat, ...r.opts?.value });
        parts.push(fence(r.lang ?? 'text', show(out), 'Output'));
      }
      return parts.join('\n\n');
    })
    .join('\n\n');

const genParsers = async () => {
  const actual = await discoverParsers();
  const missing = [...actual.keys()].filter(p => !(p in parsers));
  const extra = Object.keys(parsers).filter(p => !actual.has(p));
  if (missing.length || extra.length)
    throw new Error(
      `recipes: parser list out of sync. Missing: [${missing}]. Unknown: [${extra}].`
    );
  return Object.entries(parsers)
    .map(([p, r]) => {
      const [subpath, fn] = actual.get(p)!;
      const out = fn(r.input);
      const parts = [`### \`${p}\``];
      if (r.note) parts.push(r.note);
      parts.push(
        fence('ts', `import { ${p} } from '${subpath}';\n\n${p}(${jsStr(r.input)});`),
        fence('json', show(out), 'Output')
      );
      return parts.join('\n\n');
    })
    .join('\n\n');
};

const content = `${header}
${genFormats()}

## Import (parsers)

Parsers return a \`RuleGroupType\` without \`id\`s. Most parsers return list values (\`in\`, \`between\`) as comma-separated strings unless you pass \`{ listsAsArrays: true }\`. Pass \`{ fields }\` to drop unknown fields, and \`{ independentCombinators: true }\` for \`RuleGroupTypeIC\`. Use \`prepareRuleGroup\` before passing the result to a controlled \`<QueryBuilder query>\`.

${await genParsers()}
`;

// `format()` doesn't read `.oxfmtrc.json` itself
const { $schema: _, ...fmtConfig }: FormatConfig & { $schema?: string } = Bun.JSONC.parse(
  await Bun.file(path.join(root, '.oxfmtrc.json')).text()
) as FormatConfig;

const check = process.argv.includes('--check');
let drift = false;

for (const outFile of outFiles) {
  // oxlint-disable-next-line no-await-in-loop
  const next = (await format(outFile, content, fmtConfig)).code;
  const file = Bun.file(outFile);
  // oxlint-disable-next-line no-await-in-loop
  const current = (await file.exists()) ? await file.text() : '';
  if (next === current) continue;
  if (check) {
    drift = true;
    console.error(`Out of date: ${path.relative(root, outFile)}`);
  } else {
    // oxlint-disable-next-line no-await-in-loop
    await Bun.write(outFile, next);
    console.log(`Updated ${path.relative(root, outFile)}`);
  }
}

if (drift) {
  console.error('Run `bun recipes:generate`.');
  process.exit(1);
}
