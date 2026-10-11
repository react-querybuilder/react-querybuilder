# Export formats (`formatQuery`)

```ts
import { formatQuery } from '@react-querybuilder/core'; // or 'react-querybuilder', or '@react-querybuilder/core/formatQuery'

formatQuery(query, 'sql'); // string shorthand
formatQuery(query, { format: 'sql', fields, parseNumbers: true }); // options object
```

- Works with both `RuleGroupType` and `RuleGroupTypeIC`.
- Ids are not required. Any plain query object works.
- No `format` = `'json'`. A `preset` with no `format` implies `'sql'`.
- Invalid / placeholder / muted rules are dropped from all formats except `json` / `json_without_ids` (see [validation](validation.md)). An empty or fully invalid query yields the format's fallback (e.g. `(1 = 1)` for SQL).

## Format table

<!-- GENERATED:start -->

| Target                 | `format`              | Returns                                       | Notes                                                                                                                |
| ---------------------- | --------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Persist/transport      | `json`                | string                                        | Pretty JSON incl. ids. Not validated.                                                                                |
| Persist/transport      | `json_without_ids`    | string                                        | Compact JSON, no `id`/`path`. Not validated.                                                                         |
| SQL (inline values)    | `sql`                 | string                                        | `WHERE` clause body. **Not for untrusted input**; prefer parameterized.                                              |
| SQL (bind params)      | `parameterized`       | `{ sql, params: unknown[] }`                  | `?` placeholders, or `$1`… with `numberedParams`/`preset: 'postgresql'`.                                             |
| SQL (named params)     | `parameterized_named` | `{ sql, params: Record<string, unknown> }`    | `:field_1` placeholders; keys lack prefix unless `paramsKeepPrefix`.                                                 |
| Prisma                 | `prisma`              | object                                        | Pass as `where`. No `valueSource: 'field'`.                                                                          |
| Drizzle                | `drizzle`             | `(columns, operators) => SQL \| undefined`    | Pass as relational `where`, or call with `(table, getOperators())`.                                                  |
| Sequelize              | `sequelize`           | object \| `undefined`                         | Requires `context: { sequelizeOperators: Op }`; field-to-field also needs `sequelizeCol: col` (+ `sequelizeFn: fn`). |
| TanStack DB            | `tanstack_db`         | `refs => expression` \| `undefined`           | Requires `context: { tanStackDbOperators }` (whole `@tanstack/db` module or picked ops).                             |
| MongoDB                | `mongodb_query`       | object                                        | Recommended Mongo format.                                                                                            |
| MongoDB (string)       | `mongodb`             | string                                        | **Deprecated**; use `mongodb_query`.                                                                                 |
| Elasticsearch          | `elasticsearch`       | object                                        | Experimental. Query DSL `bool` query.                                                                                |
| JsonLogic              | `jsonlogic`           | object                                        |                                                                                                                      |
| CEL                    | `cel`                 | string                                        |                                                                                                                      |
| Spring SpEL            | `spel`                | string                                        |                                                                                                                      |
| JSONata                | `jsonata`             | string                                        | Use `parseNumbers` for numeric comparisons.                                                                          |
| LDAP                   | `ldap`                | string                                        | No `valueSource: 'field'`.                                                                                           |
| Cypher (Neo4j)         | `cypher`              | string                                        | `WHERE` expression.                                                                                                  |
| GQL (ISO graph)        | `gql`                 | string                                        | Same output as `cypher`.                                                                                             |
| SPARQL                 | `sparql`              | string                                        | `FILTER` expression.                                                                                                 |
| Gremlin                | `gremlin`             | string                                        | `.has()` chain / `__.and()`/`__.or()` steps.                                                                         |
| Human-readable display | `natural_language`    | string                                        | **Display only**, never parse it back. Configurable via `translations`, `operatorMap`, `wordOrder`.                  |
| Debugging/validation   | `diagnostics`         | `{ query, diagnostics, stats, fieldSummary }` | Annotated tree + flat entries `{ id, path, code, message, source }`. Pass `fields` for field/type checks.            |

<!-- GENERATED:end -->

## SQL

```ts
const { sql, params } = formatQuery(query, { format: 'parameterized', preset: 'postgresql' });
// sql: '("firstName" = $1 and "age" > $2)', params: ['Steve', 30]
await db.query(`SELECT * FROM users WHERE ${sql}`, params);
```

- **Always use `parameterized` / `parameterized_named` with untrusted queries.** `sql` inlines values (escaped, but not bound).
- `preset`: `ansi`, `sqlite`, `oracle`, `mssql`, `mysql`, `postgresql`. Applies to `sql`, `parameterized`, `parameterized_named` (and ORMs). Sets quoting, `paramPrefix`, `numberedParams`, `concatOperator`.
- Field names are **not** quoted by default. Set `quoteFieldNamesWith` (`'"'` or `['[', ']']`) and, for `table.column`, `fieldIdentifierSeparator: '.'`.
- With `quoteFieldNamesWith`, the closing quote char inside field names is escaped by doubling (`a"b` → `"a""b"`, `a]b` → `[a]]b]`), per `fieldIdentifierSeparator` part, incl. `valueSource: 'field'` values (v8.25+; earlier versions emit field names verbatim even when quoted). `parameterized`/`parameterized_named` honor `fieldIdentifierSeparator` too (v8.25+).
- **Unquoted field names (the default), operators, and combinators are emitted verbatim.** `fields` does **not** filter out unknown fields in `formatQuery`. If the query comes from a client, whitelist fields/operators/combinators before formatting (see [server-usage](server-usage.md)). Otherwise they are SQL injection vectors, even with `parameterized`.
- Other options: `paramPrefix` (default `':'`), `paramsKeepPrefix`, `numberedParams`, `quoteValuesWith`, `concatOperator` (`'||'`, `'+'`, `'CONCAT'`), `preserveValueOrder` (don't sort `between` bounds), `fallbackExpression`.

## Field name escaping in other formats (v8.25+)

- `cypher`/`gql`: non-identifier `.`-segments backtick-quoted (`n.first name` → ``n.`first name` ``).
- `gremlin`: property keys escaped inside `'…'`.
- `elasticsearch`: field names escaped inside Painless scripts (`doc['…']`).
- `mongodb_query`/`mongodb`: `$where` JS uses bracket notation for non-identifiers (`this["first name"]`). Object keys and `$field` refs are emitted as-is.
- `cel`, `spel`, `sparql`, `ldap`, `jsonata`: no escape syntax; field names emitted verbatim. Whitelist them.

## ORMs

<!-- snippet:skip -->

```ts
// Prisma
const users = await prisma.user.findMany({ where: formatQuery(query, 'prisma') });

// Drizzle (relational queries API)
const users = await db.query.users.findMany({ where: formatQuery(query, 'drizzle') });

// Drizzle (query builder API)
import { getOperators } from 'drizzle-orm';
const where = formatQuery(query, 'drizzle')(usersTable, getOperators());
const rows = await db.select().from(usersTable).where(where);

// Sequelize
import { Op, col, fn } from 'sequelize';
const where = formatQuery(query, {
  format: 'sequelize',
  context: { sequelizeOperators: Op, sequelizeCol: col, sequelizeFn: fn },
});
const rows = await User.findAll({ where });

// TanStack DB
import * as tsdb from '@tanstack/db';
const where = formatQuery(query, { format: 'tanstack_db', context: { tanStackDbOperators: tsdb } });
// useLiveQuery(q => q.from({ users: usersCollection }).where(where))
// Joins: use dotted fields ('alias.field') for non-primary collections.
```

## Key options (`FormatQueryOptions`)

| Option                                                                      | Purpose                                                                                                             |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `format`                                                                    | `ExportFormat`                                                                                                      |
| `fields`                                                                    | Enables per-field `validator`s, `fieldData` in processors, `parseNumbers` per `inputType`, diagnostics field checks |
| `validator`                                                                 | Query-level validator (`false` → fallback; object → per-id validation map)                                          |
| `parseNumbers`                                                              | Emit numeric-looking strings as numbers (`true`, `'strict'`, `'enhanced'`, `'native'`, `'*-limited'`)               |
| `preset`                                                                    | SQL dialect preset                                                                                                  |
| `context`                                                                   | Arbitrary data passed to processors (required for `sequelize`, `tanstack_db`)                                       |
| `ruleProcessor`                                                             | Replace per-rule output (custom operators, dates, expressions)                                                      |
| `valueProcessor`                                                            | Replace value rendering only (SQL-like formats); acts as `ruleProcessor` for object formats                         |
| `operatorProcessor`                                                         | Map operator → output operator                                                                                      |
| `ruleGroupProcessor`                                                        | Replace the whole output (custom formats; `format` then optional)                                                   |
| `fallbackExpression`                                                        | Output for empty/invalid groups                                                                                     |
| `placeholderFieldName` / `placeholderOperatorName` / `placeholderValueName` | Rules using these are dropped (defaults `'~'`, `'~'`, unset)                                                        |
| `getParameters`                                                             | Valid names for `valueSource: 'parameter'` rules                                                                    |
| `translations`, `operatorMap`, `wordOrder`                                  | `natural_language` only                                                                                             |

There is **no** `listsAsArrays` option on `formatQuery`: list values may be arrays or comma strings, and both are handled.

## Custom rule processor

Extend the default for the target format instead of reimplementing it:

```ts
import { defaultRuleProcessorSQL, formatQuery } from '@react-querybuilder/core';
import type { RuleProcessor } from '@react-querybuilder/core';

const ruleProcessor: RuleProcessor = (rule, opts) =>
  rule.operator === 'isAdult' ? `(${rule.field} >= 18)` : defaultRuleProcessorSQL(rule, opts);

formatQuery(query, { format: 'sql', ruleProcessor });
```

- The return type is **format-specific**: a string for `sql`/`cel`/etc., an object for `mongodb_query`/`jsonlogic`/etc., and `{ sql, params }` for `parameterized`/`parameterized_named`. Never reuse a SQL processor for `parameterized`. Unknown operators fall through the default processor as garbage (e.g. `age isadult ''`), so handle every custom operator.
- Format-specific options (e.g. `parameterized`'s param-name generator) arrive in `opts`. Always forward `opts` to the default processor unchanged.

Defaults exist per format: `defaultRuleProcessorSQL`, `defaultRuleProcessorParameterized`, `defaultRuleProcessorMongoDBQuery`, `defaultRuleProcessorJsonLogic`, `defaultRuleProcessorCEL`, `defaultRuleProcessorSpEL`, `defaultRuleProcessorElasticSearch`, `defaultRuleProcessorJSONata`, `defaultRuleProcessorLDAP`, `defaultRuleProcessorPrisma`, `defaultRuleProcessorDrizzle`, `defaultRuleProcessorSequelize`, `defaultRuleProcessorTanStackDB`, `defaultRuleProcessorNL`, `defaultRuleProcessorCypher`, `defaultRuleProcessorSPARQL`, `defaultRuleProcessorGremlin`. Check the installed exports.

## Field-to-field (`valueSource: 'field'`)

The rule's `value` is another field name. Supported by most formats. **Not** supported by `prisma` and `ldap` (rule dropped). `elasticsearch` supports it only via scripts with string values.

## Dates, expressions

- Date-aware output: `@react-querybuilder/datetime` rule processors (see [extensions](extensions.md)).
- `rule.lhs` / `valueSource: 'expression'`: needs `@react-querybuilder/expr` processors. Default processors ignore `lhs`.
