# @react-querybuilder/core

Core (non-React) utilities for React Query Builder - types, query processing, validation, and formatters.

## Description

This package contains the React-independent core functionality of React Query Builder, including:

- **Types**: All TypeScript type definitions for queries, rules, fields, and operators
- **Query Processing**: Utilities for transforming, validating, and manipulating queries
- **Formatters**: Export queries to various formats (SQL, MongoDB, JSON Logic, etc.)
- **Parsers**: Import queries from various formats (SQL, CEL, JSONata, etc.)
- **Utilities**: Helper functions for working with queries and rules

## Features

- **Zero React Dependencies**: Can be used in server-side environments, Node.js, or any JavaScript runtime
- **Framework Agnostic**: Works with Vue, Angular, Svelte, or vanilla JavaScript
- **Comprehensive**: Includes all the core logic from React Query Builder
- **Type Safe**: Full TypeScript support with comprehensive type definitions
- **Lightweight**: Smaller bundle size when you don't need React components

## Installation

```bash
npm install @react-querybuilder/core
# or
yarn add @react-querybuilder/core
# or
bun add @react-querybuilder/core
```

## Usage

### Basic Query Processing

```typescript
import { formatQuery, isRuleGroup, defaultValidator } from '@react-querybuilder/core';

const query = {
  combinator: 'and',
  rules: [
    { field: 'name', operator: '=', value: 'John' },
    { field: 'age', operator: '>', value: 25 },
  ],
};

// Format query to SQL
const sql = formatQuery(query, 'sql');
// Result: "(name = 'John' and age > 25)"

// Validate query
const isValid = defaultValidator(query);

// Check if object is a rule group
if (isRuleGroup(query)) {
  console.log('This is a rule group');
}
```

### Server-Side Processing

```typescript
import { formatQuery, parseSQL } from '@react-querybuilder/core';

// Parse SQL to query object
const sqlQuery = "name = 'John' AND age > 25";
const query = parseSQL(sqlQuery);

// Process on server
const mongoQuery = formatQuery(query, 'mongodb');
const elasticQuery = formatQuery(query, 'elasticsearch');
```

### Working with Types

```typescript
import type {
  RuleGroupType,
  Rule,
  Field,
  Operator,
  QueryBuilderProps,
} from '@react-querybuilder/core';

const fields: Field[] = [
  { name: 'name', label: 'Name' },
  { name: 'age', label: 'Age' },
];

const operators: Operator[] = [
  { name: '=', label: 'equals' },
  { name: '>', label: 'greater than' },
];
```

## Available Exports

### Types

- All type definitions from React Query Builder
- `RuleGroupType`, `Rule`, `Field`, `Operator`, etc.

### Utilities

- `formatQuery` - Export queries to various formats
- `parseSQL`, `parseCEL`, `parseJSONata`, etc. - Import from various formats
- `defaultValidator` - Validate queries
- `transformQuery` - Transform query structures
- `isRuleGroup`, `isRule` - Type guards
- `generateID` - Generate unique IDs
- And many more...

### Formatters

- SQL, MongoDB, JSON Logic, Elasticsearch, LDAP, Natural Language, etc.

### Parsers

- SQL, CEL, JSONata, JSON Logic, MongoDB, SpEL

## Documentation

For complete documentation, visit [https://react-querybuilder.js.org/](https://react-querybuilder.js.org/).

## Relationship to react-querybuilder

This package contains the core functionality extracted from `react-querybuilder`. The main `react-querybuilder` package re-exports everything from this package and adds React-specific components and hooks.

- Use `@react-querybuilder/core` for server-side processing, non-React applications, or when you need smaller bundle sizes
- Use `react-querybuilder` for React applications with UI components

## License

MIT
