# Import parsers

Parsers turn external query strings/objects into RQB queries. Import each from its **subpath**. Parsers are not exported from the package root.

```ts
import { parseSQL } from '@react-querybuilder/core/parseSQL';
// In React apps, the same subpaths exist on react-querybuilder: 'react-querybuilder/parseSQL'
```

<!-- GENERATED:start -->

| Parser           | Subpath                                   | Input                                        | Extra options (besides common)                                                |
| ---------------- | ----------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| `parseSQL`       | `@react-querybuilder/core/parseSQL`       | string: full `SELECT` or `WHERE` clause      | `params` (array or record), `paramPrefix`, `parseParameters`, `getExpression` |
| `parseMongoDB`   | `@react-querybuilder/core/parseMongoDB`   | object or JSON string                        | `additionalOperators`, `preventOperatorNegation`, `getExpression`             |
| `parseJsonLogic` | `@react-querybuilder/core/parseJsonLogic` | object or JSON string                        | `jsonLogicOperations`, `getExpression`                                        |
| `parseCEL`       | `@react-querybuilder/core/parseCEL`       | string                                       | `customExpressionHandler`, `getExpression`                                    |
| `parseSpEL`      | `@react-querybuilder/core/parseSpEL`      | string                                       | `getExpression`                                                               |
| `parseJSONata`   | `@react-querybuilder/core/parseJSONata`   | string                                       | `getExpression`                                                               |
| `parseCypher`    | `@react-querybuilder/core/parseCypher`    | string: full query, `WHERE …`, or expression | `fields`/`getValueSources` only (whitelist; see below)                        |
| `parseGQL`       | `@react-querybuilder/core/parseCypher`    | string                                       | `fields`/`getValueSources` only (whitelist; see below)                        |
| `parseGremlin`   | `@react-querybuilder/core/parseGremlin`   | string: traversal or `.has()` chain          | `fields`/`getValueSources` only (whitelist; see below)                        |
| `parseSPARQL`    | `@react-querybuilder/core/parseSPARQL`    | string: full query or `FILTER` expression    | `fields`/`getValueSources` only (whitelist; see below)                        |

<!-- GENERATED:end -->

There are **no** parsers for Elasticsearch, LDAP, Prisma, Drizzle, Sequelize, TanStack DB, or natural language. Don't invent `parseElasticSearch` etc.

## Common options (`ParserCommonOptions`)

Supported by parseSQL, parseMongoDB, parseJsonLogic, parseCEL, parseSpEL, parseJSONata. `parseCypher`/`parseGQL`/`parseGremlin`/`parseSPARQL` support only `fields` and `getValueSources` (v8.25+; earlier versions ignore all options), and only for whitelisting: field names match as emitted (`n.age` for Cypher, `?age` for SPARQL), and field-to-field rules aren't produced.

| Option                   | Effect                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fields`                 | Drops rules whose field isn't in `fields` (or whose operator/value source is invalid for it), then prunes empty groups. Use it to whitelist fields on untrusted input. Before v8.25, some paths leaked unknown fields (`parseSQL` `in`/`between`, `parseMongoDB` `$gte`+`$lte` → `between`, `parseJsonLogic` `in`); on older versions, also whitelist after parsing (see [server-usage](server-usage.md)). |
| `getValueSources`        | Per-field value sources (controls whether field-to-field rules are kept)                                                                                                                                                                                                                                                                                                                                   |
| `independentCombinators` | `true` → returns `RuleGroupTypeIC`                                                                                                                                                                                                                                                                                                                                                                         |
| `listsAsArrays`          | `in`/`between` values as arrays instead of comma strings                                                                                                                                                                                                                                                                                                                                                   |
| `generateIDs`            | Add `id`s to every rule/group                                                                                                                                                                                                                                                                                                                                                                              |
| `bigIntOnOverflow`       | Use `bigint` for integers beyond `Number.MAX_SAFE_INTEGER`                                                                                                                                                                                                                                                                                                                                                 |

## Examples

```ts
import { parseJsonLogic } from '@react-querybuilder/core/parseJsonLogic';
import { parseMongoDB } from '@react-querybuilder/core/parseMongoDB';
import { parseSQL } from '@react-querybuilder/core/parseSQL';

parseSQL(`SELECT * FROM t WHERE firstName = 'Steve' AND age > 30`);
// { combinator: 'and', rules: [
//   { field: 'firstName', operator: '=', value: 'Steve' },
//   { field: 'age', operator: '>', value: 30 } ] }

parseSQL('firstName = ? and lastName = ?', { params: ['Steve', 'Vai'] });
parseSQL('firstName = :fn', { params: { fn: 'Steve' } });

parseMongoDB({ $or: [{ age: { $gt: 30 } }, { status: 'active' }] }, { listsAsArrays: true });

parseJsonLogic({ '==': [{ var: 'firstName' }, 'Steve'] }, { fields, generateIDs: true });
```

## Loading into the UI

```tsx
const [query, setQuery] = useState<RuleGroupType>(() => parseSQL(savedWhereClause, { fields }));
<QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />;
```

- Ids are added automatically by `QueryBuilder` (or pass `generateIDs: true`).
- If the app uses IC queries, pass `independentCombinators: true`.
- Failure behavior differs. **`parseSQL` throws** on syntax errors, so wrap it in `try`/`catch`. All other parsers return an empty group (`{ combinator: 'and', rules: [] }`) for unparseable input (including invalid JSON strings), so check `rules.length`.
- Unsupported constructs (functions, subqueries, etc.) are dropped silently. For example, `lower(a) = 'x' and b = 1` parses to just the `b = 1` rule. Use `getExpression` (where available) or `@react-querybuilder/expr` parsers to keep expressions.

## Conversion = parse + format

```ts
import { formatQuery } from '@react-querybuilder/core';
import { parseJsonLogic } from '@react-querybuilder/core/parseJsonLogic';

const { sql, params } = formatQuery(parseJsonLogic(input, { fields }), {
  format: 'parameterized',
  fields,
});
```
