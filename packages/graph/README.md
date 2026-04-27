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

```ts
import { parseCypher, parseSPARQL, parseGremlin } from '@react-querybuilder/graph';

const query = parseCypher('MATCH (a:Person) WHERE a.age > 30 RETURN a');
```

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
<CypherReturnEditor query={query} includeReturn={includeReturn} onIncludeReturnChange={setIncludeReturn} />

// SPARQL — configure SELECT variables and PREFIX declarations
<SparqlSelectEditor query={query} selectVariables={vars} onSelectVariablesChange={setVars} prefixes={prefixes} onPrefixesChange={setPrefixes} />

// Gremlin — configure traversal source
<GremlinProjectionEditor traversalSource={source} onTraversalSourceChange={setSource} />
```

### Meta Editor

`GraphMetaEditor` provides inline editing of graph-specific `meta` properties on individual rules:

```tsx
import { GraphMetaEditor } from '@react-querybuilder/graph';

<GraphMetaEditor rule={rule} handleOnChange={handleMetaChange} graphLang="cypher" />;
```

## Documentation

Full documentation is available at [react-querybuilder.js.org](https://react-querybuilder.js.org/).
