# @react-querybuilder/graph

Graph query language support (Cypher, GQL, SPARQL, Gremlin) for [React Query Builder](https://react-querybuilder.js.org/).

> [!CAUTION]
>
> This package is in a very early stage of development.

## Installation

```bash
npm install react-querybuilder @react-querybuilder/graph
# OR yarn add / pnpm add / bun add
```

## Usage

### Formatting

```ts
import { formatGraphQuery } from '@react-querybuilder/graph';

const output = formatGraphQuery(query, { format: 'cypher' });
```

Supported formats: `cypher`, `gql`, `sparql`, `gremlin`.

### Parsing

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

### Pattern & Filter Rules

Rules in the query use the `meta` property to distinguish between **pattern rules** (graph structure) and **filter rules** (conditions):

```ts
// Pattern rule (defines graph structure)
{ field: '_pattern', operator: '=', value: '', meta: { graphRole: 'pattern', nodeAlias: 'a', nodeLabel: 'Person' } }

// Filter rule (standard condition)
{ field: 'a.age', operator: '>', value: '30' }
```

### Companion Components

Projection zone editors work alongside `QueryBuilder` to configure format options:

```tsx
import { CypherReturnEditor, SparqlSelectEditor, GremlinProjectionEditor } from '@react-querybuilder/graph';

// Cypher/GQL — configure RETURN clause
<CypherReturnEditor
  query={query}
  includeReturn={includeReturn}
  onIncludeReturnChange={setIncludeReturn}
/>

// SPARQL — configure SELECT variables and PREFIX declarations
<SparqlSelectEditor
  query={query}
  selectVariables={vars}
  onSelectVariablesChange={setVars}
  prefixes={prefixes}
  onPrefixesChange={setPrefixes}
/>

// Gremlin — configure traversal source
<GremlinProjectionEditor
  traversalSource={source}
  onTraversalSourceChange={setSource}
/>
```

### Meta Editor

`GraphMetaEditor` provides inline editing of graph-specific `meta` properties on individual rules:

```tsx
import { GraphMetaEditor } from '@react-querybuilder/graph';

<GraphMetaEditor rule={rule} handleOnChange={handleMetaChange} graphLang="cypher" />;
```

## Documentation

Full documentation is available at [react-querybuilder.js.org](https://react-querybuilder.js.org/).
