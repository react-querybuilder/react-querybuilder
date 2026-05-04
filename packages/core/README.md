# @react-querybuilder/core

Core non-React utilities for [React Query Builder](https://react-querybuilder.js.org/) — types, query processing, validation, formatters, and parsers.

## Installation

```bash
npm i @react-querybuilder/core
# OR yarn add / pnpm add / bun add
```

> **Note:** `react-querybuilder` re-exports everything from this package, so projects already using the main package don't need to install `@react-querybuilder/core` separately.

## Export

[Full export documentation](https://react-querybuilder.js.org/docs/utils/export)

Use `formatQuery` to convert a query object into any of the supported output formats:

```ts
import { formatQuery } from '@react-querybuilder/core';

const query = {
  combinator: 'and',
  rules: [
    { field: 'first_name', operator: 'beginsWith', value: 'Stev' },
    { field: 'last_name', operator: 'in', value: 'Vai, Vaughan' },
  ],
};

formatQuery(query, 'sql');
// "(first_name like 'Stev%' and last_name in ('Vai', 'Vaughan'))"
```

### Supported export formats

| Format                                                                          | `formatQuery` type string | Output type             | Description                                 |
| ------------------------------------------------------------------------------- | ------------------------- | ----------------------- | ------------------------------------------- |
| JSON (formatted)                                                                | `"json"`                  | `string`                | 2-space indented `JSON.stringify`           |
| JSON (no IDs)                                                                   | `"json_without_ids"`      | `string`                | Compact JSON without `id`/`path` properties |
| [SQL](https://en.wikipedia.org/wiki/SQL)                                        | `"sql"`                   | `string`                | Standard `WHERE` clause                     |
| SQL (parameterized)                                                             | `"parameterized"`         | `ParameterizedSQL`      | SQL with anonymous (`?`) bind variables     |
| SQL (named params)                                                              | `"parameterized_named"`   | `ParameterizedNamedSQL` | SQL with named (`:param`) bind variables    |
| [MongoDB](https://www.mongodb.com/)                                             | `"mongodb_query"`         | `Record<string, any>`   | MongoDB query object                        |
| [CEL](https://cel.dev/)                                                         | `"cel"`                   | `string`                | Common Expression Language                  |
| [SpEL](https://docs.spring.io/spring-framework/reference/core/expressions.html) | `"spel"`                  | `string`                | Spring Expression Language                  |
| [JsonLogic](https://jsonlogic.com/)                                             | `"jsonlogic"`             | `JsonLogic`             | JsonLogic object                            |
| [JSONata](https://jsonata.org/)                                                 | `"jsonata"`               | `string`                | JSONata expression                          |
| [ElasticSearch](https://www.elastic.co/elasticsearch)                           | `"elasticsearch"`         | `Record<string, any>`   | ElasticSearch query DSL                     |
| [LDAP](https://ldap.com/)                                                       | `"ldap"`                  | `string`                | LDAP filter string                          |
| [Cypher](https://neo4j.com/docs/cypher-manual/current/)                         | `"cypher"`                | `string`                | Neo4j Cypher `WHERE` clause                 |
| [SPARQL](https://www.w3.org/TR/sparql11-query/)                                 | `"sparql"`                | `string`                | SPARQL `FILTER` clause                      |
| [Gremlin](https://tinkerpop.apache.org/gremlin.html)                            | `"gremlin"`               | `string`                | Apache TinkerPop Gremlin traversal          |
| Natural language                                                                | `"natural_language"`      | `string`                | Human-readable description                  |
| [Drizzle](https://orm.drizzle.team/)                                            | `"drizzle"`               | Drizzle `SQL`           | Drizzle ORM `where` clause                  |
| [Prisma](https://www.prisma.io/)                                                | `"prisma"`                | `Record<string, any>`   | Prisma `where` object                       |
| [Sequelize](https://sequelize.org/)                                             | `"sequelize"`             | `Record<string, any>`   | Sequelize `where` object                    |

## Import

[Full import documentation](https://react-querybuilder.js.org/docs/utils/import)

Parser functions convert query strings or objects from various languages into React Query Builder query objects. Each parser must be imported from its own sub-path.

```ts
import { parseSQL } from '@react-querybuilder/core/parseSQL';

// Accepts a full SELECT statement or just a WHERE clause
const query = parseSQL(
  `SELECT * FROM my_table WHERE first_name LIKE 'Stev%' AND last_name IN ('Vai', 'Vaughan')`
);
```

### Supported import formats

| Format                                                                          | Import statement                                                           |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [SQL](https://en.wikipedia.org/wiki/SQL)                                        | `import { parseSQL } from "@react-querybuilder/core/parseSQL"`             |
| [MongoDB](https://www.mongodb.com/)                                             | `import { parseMongoDB } from "@react-querybuilder/core/parseMongoDB"`     |
| [JsonLogic](https://jsonlogic.com/)                                             | `import { parseJsonLogic } from "@react-querybuilder/core/parseJsonLogic"` |
| [JSONata](https://jsonata.org/)                                                 | `import { parseJSONata } from "@react-querybuilder/core/parseJSONata"`     |
| [CEL](https://cel.dev/)                                                         | `import { parseCEL } from "@react-querybuilder/core/parseCEL"`             |
| [SpEL](https://docs.spring.io/spring-framework/reference/core/expressions.html) | `import { parseSpEL } from "@react-querybuilder/core/parseSpEL"`           |
| [Cypher](https://neo4j.com/docs/cypher-manual/current/)                         | `import { parseCypher } from "@react-querybuilder/core/parseCypher"`       |
| [GQL](https://www.iso.org/standard/76120.html)                                  | `import { parseGQL } from "@react-querybuilder/core/parseCypher"`          |
| [SPARQL](https://www.w3.org/TR/sparql11-query/)                                 | `import { parseSPARQL } from "@react-querybuilder/core/parseSPARQL"`       |
| [Gremlin](https://tinkerpop.apache.org/gremlin.html)                            | `import { parseGremlin } from "@react-querybuilder/core/parseGremlin"`     |

## Query manipulation

[Full documentation](https://react-querybuilder.js.org/docs/utils/misc#query-tools)

Programmatically modify query objects with the same functions used internally by the `<QueryBuilder />` component:

```ts
import { add, remove, update, move } from '@react-querybuilder/core';

const updated = add(query, newRule, parentPath);
const removed = remove(query, rulePath);
const modified = update(query, 'value', 'newValue', rulePath);
const moved = move(query, oldPath, newPath);
```

Available methods: `add`, `remove`, `update`, `move`, `insert`, `group`.

## `transformQuery`

[Full documentation](https://react-querybuilder.js.org/docs/utils/misc#transformquery)

Recursively processes a query object, transforming rules, groups, operators, combinators, and property names:

```ts
import { transformQuery } from '@react-querybuilder/core';

const transformed = transformQuery(query, {
  operatorMap: { '=': '==', '!=': '<>' },
  combinatorMap: { and: '&&', or: '||' },
  propertyMap: { field: 'column' },
  ruleProcessor: rule => ({ ...rule, value: rule.value.trim() }),
});
```

## TypeScript

The core package exports the complete type system used throughout React Query Builder, enabling strongly-typed query manipulation without a React dependency:

```ts
import type {
  RuleGroupType, // Standard query structure (combinators at group level)
  RuleGroupTypeIC, // Independent combinators structure
  RuleType, // Individual rule
  FullField, // Field definition with all options
  FullOperator, // Operator definition
  FullCombinator, // Combinator definition
  ExportFormat, // Union of all format strings
  DefaultRuleGroupType,
  DefaultRuleType,
} from '@react-querybuilder/core';
```

## Further reading

- [Full documentation](https://react-querybuilder.js.org/)
- [API reference](https://react-querybuilder.js.org/docs/api)
- [Demo](https://react-querybuilder.js.org/demo)
