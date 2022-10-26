---
title: Import
description: Convert SQL and other formats to query builder objects
---

import TypeScriptAdmonition from './_ts_admonition.md';

<TypeScriptAdmonition />

## SQL

Use the `parseSQL` function to convert SQL `SELECT` statements into a format suitable for the `<QueryBuilder />` component's `query` prop. The function signature is:

```ts
function parseSQL(sql: string, options?: ParseSQLOptions): RuleGroupTypeAny;
```

`parseSQL` takes a SQL `SELECT` statement (either the full statement or the `WHERE` clause by itself). Try it out in the [demo](/demo) by clicking the "Load from SQL" button.

The optional second parameter to `parseSQL` is an options object that configures how the function handles named or anonymous bind variables within the SQL string.

Click the "Import SQL" button in [the demo](/demo) to try it out.

### Basic usage

Running any of the following statements will produce the same result (see below):

```ts
parseSQL(`SELECT * FROM t WHERE firstName = 'Steve' AND lastName = 'Vai'`);

parseSQL(`SELECT * FROM t WHERE firstName = ? AND lastName = ?`, {
  params: ['Steve', 'Vai'],
});

parseSQL(`SELECT * FROM t WHERE firstName = :p1 AND lastName = :p2`, {
  params: { p1: 'Steve', p2: 'Vai' },
});

parseSQL(`SELECT * FROM t WHERE firstName = $p1 AND lastName = $p2`, {
  params: { p1: 'Steve', p2: 'Vai' },
  paramPrefix: '$',
});
```

Output (`RuleGroupType`):

```json
{
  "combinator": "and",
  "rules": [
    {
      "field": "firstName",
      "operator": "=",
      "value": "Steve"
    },
    {
      "field": "lastName",
      "operator": "=",
      "value": "Vai"
    }
  ]
}
```

## Common Expression Language (CEL)

`parseCEL` takes a [CEL](https://github.com/google/cel-spec) string and converts it to `RuleGroupType`.

Click the "Import CEL" button in [the demo](/demo) to try it out.

## JsonLogic

`parseJsonLogic` takes a [JsonLogic](https://jsonlogic.com/) object and converts it to `RuleGroupType`.

Click the "Import JsonLogic" button in [the demo](/demo) to try it out.

## Configuration

### Lists as arrays

To generate actual arrays instead of comma-separated strings for lists of values following `IN` and `BETWEEN` operators, use the `listsAsArrays` option.

```ts
parseSQL(`SELECT * FROM t WHERE lastName IN ('Vai', 'Vaughan') AND age BETWEEN 20 AND 100`, {
  listsAsArrays: true;
});
```

Output:

```json
{
  "combinator": "and",
  "rules": [
    {
      "field": "lastName",
      "operator": "in",
      "value": ["Vai", "Vaughan"]
    },
    {
      "field": "age",
      "operator": "between",
      "value": [20, 100]
    }
  ]
}
```

### Independent combinators

When the `independentCombinators` option is `true`, `parse*` functions will output a query with combinator identifiers between sibling rules/groups.

```ts
parseSQL(`SELECT * FROM t WHERE firstName = 'Steve' AND lastName = 'Vai'`, {
  independentCombinators: true,
});
```

Output (`RuleGroupTypeIC`):

```json
{
  "rules": [
    {
      "field": "firstName",
      "operator": "=",
      "value": "Steve"
    },
    "and",
    {
      "field": "lastName",
      "operator": "=",
      "value": "Vai"
    }
  ]
}
```

### Fields as value source

When the `fields` option (which accepts the same types as the [`fields` prop](./querybuilder#fields)) is provided, and _only_ if it is provided, then `parse*` functions will validate clauses that have a field identifier to the right of the operator instead of a primitive value. A `getValueSources` function (with the same signature as the [prop of the same name](./querybuilder#getvaluesources)) can also be provided to help validate rules.

In order for such a rule to be considered valid, one of the following must be an array that includes the string "field": 1) the `getValueSources` return value, 2) the field's `valueSources` property return value, or 3) the field's `valueSources` property itself.

```ts
parseSQL(`SELECT * FROM t WHERE firstName = lastName`, {
  fields: [
    { name: 'firstName', label: 'First Name' },
    { name: 'lastName', label: 'Last Name' },
  ],
  getValueSources: () => ['value', 'field'],
});
```

Output:

```json
{
  "combinator": "and",
  "rules": [
    {
      "field": "firstName",
      "operator": "=",
      "value": "lastName",
      "valueSource": "field"
    }
  ]
}
```

:::note

`parse*` functions will only validate clauses where "field" is the _only_ value source. Operators that take multiple values, like "between" and "in", must only have field names to the right of the operator, not a mix of field names and primitive values.

:::
