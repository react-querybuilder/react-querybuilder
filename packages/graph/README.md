# @react-querybuilder/graph

Graph query language support (Cypher, GQL, SPARQL, Gremlin) for [React Query Builder](https://react-querybuilder.js.org/).

> [!CAUTION]
>
> This package is in a very early stage of development.

## Documentation

Full documentation is available at [react-querybuilder.js.org](https://react-querybuilder.js.org/).

## Installation

```bash
npm install react-querybuilder @react-querybuilder/graph
# OR yarn add / pnpm add / bun add
```

## Usage

### Export

```ts
import { formatGraphQuery } from '@react-querybuilder/graph';

const output = formatGraphQuery(query, { format: 'cypher' });
```

Supported formats: `cypher`, `gql`, `sparql`, `gremlin`.

### Import

Parsers are available as independent sub-path imports so you only bundle what you use:

```ts
import { parseCypher, parseGQL } from '@react-querybuilder/graph/parseCypher';
import { parseSPARQL } from '@react-querybuilder/graph/parseSPARQL';
import { parseGremlin } from '@react-querybuilder/graph/parseGremlin';

const query = parseCypher('MATCH (a:Person) WHERE a.age > 30 RETURN a');
```

| Import path                              | Exports                   | Parser                                                                              |
| ---------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------- |
| `@react-querybuilder/graph/parseCypher`  | `parseCypher`, `parseGQL` | [Chevrotain](https://chevrotain.io/) CST grammar                                    |
| `@react-querybuilder/graph/parseSPARQL`  | `parseSPARQL`             | [`@traqula/parser-sparql-1-2`](https://github.com/traqula/traqula) (SPARQL 1.1/1.2) |
| `@react-querybuilder/graph/parseGremlin` | `parseGremlin`            | Regex-based tokenizer                                                               |

> **Note:** `parseSPARQL` automatically injects stub `PREFIX` declarations for undeclared prefixed names (e.g. `rdf:type`, `foaf:Person`), so callers don't need to provide explicit PREFIX lines.

> **Optional dependencies:** `parseCypher`/`parseGQL` require `chevrotain`, and `parseSPARQL` requires `@traqula/parser-sparql-1-2`. Both are optional peer dependencies — install only the one(s) you need:
>
> ```bash
> npm install chevrotain                  # for parseCypher / parseGQL
> npm install @traqula/parser-sparql-1-2  # for parseSPARQL
> ```
>
> `parseGremlin` has no additional dependencies.
