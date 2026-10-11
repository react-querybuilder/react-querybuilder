# Server usage

Use **`@react-querybuilder/core`** in API routes, workers, edge functions, and CLIs. It has no React dependency. Never import `react-querybuilder` on the server: it pulls in React and the UI.

```ts
import { formatQuery, defaultValidator, isRuleGroupTypeIC } from '@react-querybuilder/core';
import { parseSQL } from '@react-querybuilder/core/parseSQL'; // parsers: subpath only
```

Subpaths: `/formatQuery`, `/parseSQL`, `/parseCEL`, `/parseMongoDB`, `/parseJsonLogic`, `/parseSpEL`, `/parseJSONata`, `/parseCypher` (also exports `parseGQL`), `/parseGremlin`, `/parseSPARQL`, `/transformQuery`, `/getQueryJsonSchema`, `/derivations`.

## Security: queries from clients are untrusted

**`formatQuery` does not validate field names, operators, or combinators**, in any format, including `parameterized`. Values are bound/escaped. Field names are escaped only when quoted (`quoteFieldNamesWith`/`preset`, v8.25+) or where the target language has escape syntax (see [export-formats](export-formats.md)); unquoted SQL field names (the default), operators, and combinators are emitted verbatim. `formatQuery`'s `fields` option does **not** reject unknown names. A crafted query like `{ field: 'a) or (1=1', … }` is injected verbatim into unquoted SQL.

Parser `fields` options do drop unknown fields (reliably as of v8.25), but a query object posted directly by a client never goes through a parser. Always enforce a whitelist before formatting:

```ts
import type { RuleGroupTypeAny } from '@react-querybuilder/core';

const ALLOWED_OPERATORS = new Set([
  '=',
  '!=',
  '<',
  '>',
  '<=',
  '>=',
  'contains',
  'beginsWith',
  'endsWith',
  'doesNotContain',
  'doesNotBeginWith',
  'doesNotEndWith',
  'null',
  'notNull',
  'in',
  'notIn',
  'between',
  'notBetween',
]);
const ALLOWED_COMBINATORS = new Set(['and', 'or']);

/** Throws if any field/operator/combinator/valueSource isn't whitelisted. */
export const assertSafeQuery = (rg: RuleGroupTypeAny, fieldNames: ReadonlySet<string>): void => {
  if ('combinator' in rg && !ALLOWED_COMBINATORS.has(String(rg.combinator).toLowerCase()))
    throw new Error(`Invalid combinator: ${rg.combinator}`);
  for (const r of rg.rules) {
    if (typeof r === 'string') {
      // IC combinator
      if (!ALLOWED_COMBINATORS.has(r.toLowerCase())) throw new Error(`Invalid combinator: ${r}`);
    } else if ('rules' in r) {
      assertSafeQuery(r, fieldNames);
    } else {
      if (!fieldNames.has(r.field)) throw new Error(`Unknown field: ${r.field}`);
      if (!ALLOWED_OPERATORS.has(r.operator)) throw new Error(`Invalid operator: ${r.operator}`);
      if (r.valueSource !== undefined && r.valueSource !== 'value' && r.valueSource !== 'field')
        throw new Error(`Invalid valueSource: ${r.valueSource}`);
      if (r.valueSource === 'field') {
        const refs = Array.isArray(r.value) ? r.value : String(r.value).split(',');
        for (const f of refs)
          if (!fieldNames.has(String(f).trim())) throw new Error(`Unknown field: ${f}`);
      }
      if (r.match || r.lhs) throw new Error('Match modes/expressions not allowed');
    }
  }
};
```

Adjust the whitelists to the operators/combinators/value sources the app actually uses. Also limit nesting depth and rule count if queries are user-supplied.

## Pipeline: validate → format → execute

```ts
import { formatQuery } from '@react-querybuilder/core';
import type { Field, RuleGroupTypeAny } from '@react-querybuilder/core';

const fields: Field[] = [
  { name: 'firstName', label: 'First name' },
  { name: 'age', label: 'Age', inputType: 'number' },
];
const fieldNames = new Set(fields.map(f => f.name));

// Empty/fully-invalid queries format to `(1 = 1)` (matches every row)
const assertRestricted = (sql: string) => {
  if (sql === '(1 = 1)') throw new Error('Query has no effective rules');
};

export const buildWhere = (input: unknown) => {
  const query = input as RuleGroupTypeAny; // shape-check first (Ajv + getQueryJsonSchema, zod, …)
  if (query.rules.length === 0) throw new Error('Empty query');
  assertSafeQuery(query, fieldNames);
  const result = formatQuery(query, {
    format: 'parameterized',
    preset: 'postgresql',
    fields,
    parseNumbers: 'strict-limited',
  });
  assertRestricted(result.sql);
  return result;
};

// const { sql, params } = buildWhere(body.query);
// await db.query(`SELECT * FROM users WHERE ${sql}`, params);
```

## LLM-generated queries: `getQueryJsonSchema` + `diagnostics`

`getQueryJsonSchema(fields, options?)` (v8.25+) returns a plain JSON Schema (no deps) for valid queries: per-field operator/value constraints, `between` = 2-item array, `values` → `enum`, etc. Pass it as LLM structured-output/tool input schema, MCP `inputSchema`, or to Ajv.

- `strict: true` for OpenAI structured outputs/Anthropic tools/MCP (no extra props, all props required + nullable, object root). Safe default for every provider.
- `queryType: 'ic'` for `RuleGroupTypeIC`. `mode: 'loose'` for large `fields` (~50+). Numeric `maxDepth` if the consumer rejects recursive `$ref`.
- `includeIds` defaults to `false`; run `prepareRuleGroup` on the result before passing to a controlled `<QueryBuilder>`.
- Schema is necessary, not sufficient (IC alternation, comma-string arity, everything in loose mode). Always follow with `diagnostics`, then the whitelist checks above.

```ts
import { formatQuery, getQueryJsonSchema } from '@react-querybuilder/core';
const schema = getQueryJsonSchema(fields, { strict: true });
// e.g. AI SDK: generateObject({ model, schema: jsonSchema(schema), prompt })
// e.g. OpenAI: response_format: { type: 'json_schema', json_schema: { name: 'query', strict: true, schema } }
// e.g. Anthropic: tools: [{ name: 'set_filter', input_schema: schema }]

// `query` = parsed LLM output
const { diagnostics } = formatQuery(query, { format: 'diagnostics', fields });
const problems = diagnostics.filter(d => d.code !== 'UNREFERENCED_FIELD');
// problems non-empty → reject or send back to the LLM to fix
```

Diagnostic codes beyond placeholders/validators (need `fields`, except `INVALID_STRUCTURE`): `UNDEFINED_FIELD`, `INVALID_OPERATOR` (only if field has `operators`), `INVALID_VALUE_ARITY`, `VALUE_NOT_IN_OPTIONS`, `VALUE_TYPE_MISMATCH`, `INVALID_STRUCTURE`. Most don't flip `valid`; check the `diagnostics` array, not just `query.valid`.

## Pipeline: parse → validate → format (conversion)

```ts
import { formatQuery } from '@react-querybuilder/core';
import { parseJsonLogic } from '@react-querybuilder/core/parseJsonLogic';

// `fields`, `fieldNames`, `assertSafeQuery`, `assertRestricted` as above
export const jsonLogicToSql = (input: Parameters<typeof parseJsonLogic>[0]) => {
  const query = parseJsonLogic(input, { fields }); // drops unknown fields
  if (query.rules.length === 0) throw new Error('Empty or unparseable query');
  assertSafeQuery(query, fieldNames); // still needed: operators, older versions
  const result = formatQuery(query, { format: 'parameterized', fields });
  assertRestricted(result.sql); // rules may still be dropped as invalid
  return result;
};
```

- `parseSQL` throws on syntax errors; other parsers return an empty group. See [import-parsers](import-parsers.md).
- An empty/fully-invalid query formats to the fallback (`(1 = 1)` for SQL), which **matches all rows**. Decide explicitly whether that is acceptable.

## Without React state

- Immutable updates: `add`, `remove`, `update`, `move`, `insert`, `group`, `ungroup` (all take `(query, …, pathOrId)`, return a new query).
- Stateful: `new QueryManager(query, options)` with chainable `add`/`update`/…, `undo`/`redo`, `validate()`, `format(...)`.
- Bulk transforms (rename keys, map rules): `transformQuery(query, { ruleProcessor, ruleGroupProcessor, propertyMap, … })`.
- Ids: `prepareRuleGroup(query)` adds missing `id`s recursively. Not needed for `formatQuery`.

```ts
import { add, update, remove } from '@react-querybuilder/core';

let q = add({ combinator: 'and', rules: [] }, { field: 'age', operator: '>', value: 21 }, []);
q = update(q, 'value', 30, [0]);
q = remove(q, [0]);
```
