---
title: Import
description: Convert SQL and other formats to query builder objects
---

%importmd ../\_ts_admonition.md

Import/parser functions convert query strings or objects from specific languages to query objects for `<QueryBuilder />` components.

The optional second parameter configures parsing behavior and query generation (see [Configuration](#configuration)).

:::info Importing `parse*` functions

Since `parse*` functions are used less frequently and rarely together, they were removed from the main export in version 7.

```diff
 // Version 6 only
-import { parseCEL } from "react-querybuilder"
-import { parseJsonLogic } from "react-querybuilder"
-import { parseMongoDB } from "react-querybuilder"
-import { parseSQL } from "react-querybuilder"

 // Version 6 or 7
+import { parseCEL } from "react-querybuilder/parseCEL"
+import { parseJsonLogic } from "react-querybuilder/parseJsonLogic"
+import { parseMongoDB } from "react-querybuilder/parseMongoDB"
+import { parseSQL } from "react-querybuilder/parseSQL"
 // (New in version 7)
+import { parseSpEL } from "react-querybuilder/parseSpEL"
+import { parseJSONata } from "react-querybuilder/parseJSONata"
```

These functions were available as separate exports in version 6 (along with [`formatQuery`](./export) and [`transformQuery`](./misc#transformquery)) but could also be imported from `"react-querybuilder"`. In version 7, they're _only_ available as separate exports. (This reduced the main bundle size by almost 50%.)

:::

## SQL

```ts
import { parseSQL } from 'react-querybuilder/parseSQL';

function parseSQL(sql: string, options?: ParseSQLOptions): RuleGroupTypeAny;
```

`parseSQL` accepts either a SQL `SELECT` statement or `WHERE` clause.

Click the "Import SQL" button in [the demo](/demo) to try it out.

### Options

Beyond standard [configuration](#configuration) options, `parseSQL` accepts these two options for handling named or anonymous bind variables in SQL strings:

- `params` (`any[] | Record<string, any>`): An array of parameter values or a parameter-to-value mapping object.
- `paramPrefix` (`string`): Ignores this string at the beginning of parameter identifiers when matching to parameter names in the `params` object.

### Usage

All these statements produce the same result:

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

:::tip

Since v5.0, `parseSQL` detects `XOR` operators and converts them to rule groups with the "xor" combinator. Since "xor" isn't in `defaultCombinators`, specify `defaultCombinatorsExtended` in your `<QueryBuilder />` props if the original SQL might contain `XOR` clauses.

```ts
import { defaultCombinatorsExtended, parseSQL, QueryBuilder } from 'react-querybuilder';

const query = parseSQL(`SELECT * FROM tbl WHERE a = 'b' XOR c = 'd';`);

const App = () => {
  return (
    <QueryBuilder
      query={query}
      // highlight-start
      combinators={defaultCombinatorsExtended}
      // highlight-end
    />
  );
};
```

:::

## MongoDB

```ts
import { parseMongoDB } from 'react-querybuilder/parseMongoDB';

function parseMongoDB(
  mongoDbQuery: string | Record<string, any>,
  options?: ParseMongoDbOptions
): RuleGroupTypeAny;
```

`parseMongoDB` accepts a MongoDB query as either a JSON object or `JSON.parse`-able string.

Click the "Import MongoDB" button in [the demo](/demo) to try it out.

### Usage

```ts
parseMongoDB(`{ "firstName": "Steve", "lastName": { $eq: "Vai" } }`);
// OR
parseMongoDB({ firstName: 'Steve', lastName: { $eq: 'Vai' } });
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

### Custom operators

`parseMongoDB` identifies and processes custom operators with the `additionalOperators` option. This option maps operators to their processing functions. Functions receive the operator, associated value, and other options, then should return `RuleType` or `RuleGroupType`. (Don't return `RuleGroupTypeIC`, even with [independent combinators](../components/querybuilder#independent-combinators). If `independentCombinators` is `true`, `parseMongoDB` converts the final query to `RuleGroupTypeIC` before returning.)

Example:

```ts
parseMongoDB(
  {
    $myCustomOp: ['Vai', 'Vaughan'],
  },
  {
    additionalOperators: {
      $myCustomOp: (_op, val) => ({
        field: 'lastName',
        operator: 'in',
        value: val,
      }),
    },
  }
);
```

Output (`RuleGroupType`):

```json
{
  "combinator": "and",
  "rules": [
    {
      "field": "lastName",
      "operator": "in",
      "value": ["Vai", "Vaughan"]
    }
  ]
}
```

:::tip

Valid MongoDB query strings may not strictly conform to JSON. To handle extended formats, pre-parse query strings with a library like [mongodb-query-parser](https://www.npmjs.com/package/mongodb-query-parser) before passing them to `parseMongoDB`.

:::

## JsonLogic

```ts
import { parseJsonLogic } from 'react-querybuilder/parseJsonLogic';

function parseJsonLogic(
  jsonLogic: string | JsonLogic,
  options?: ParseJsonLogicOptions
): RuleGroupTypeAny;
```

`parseJsonLogic` accepts a [JsonLogic](https://jsonlogic.com/) object or `JSON.parse`-able string.

Click the "Import JsonLogic" button in [the demo](/demo) to try it out.

### Usage

```ts
parseJsonLogic(
  `{ "and": [{ "===": [{ "var": "firstName" }, "Steve"] }, { "===": [{ "var": "lastName" }, "Vai"] }] }`
);
// OR
parseJsonLogic({
  and: [{ '===': [{ var: 'firstName' }, 'Steve'] }, { '===': [{ var: 'lastName' }, 'Vai'] }],
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

### Custom operations

By default, `parseJsonLogic` handles standard JsonLogic operations that correspond to default React Query Builder operators. Use the `jsonLogicOperations` option to handle custom operations.

`jsonLogicOperations` is `Record<string, (val: any) => RuleType | RuleGroupTypeAny>`. Keys are custom operations; values are functions returning a rule or group.

:::note

Including standard JsonLogic operations as keys in `jsonLogicOperations` overrides the default `parseJsonLogic` behavior for those operations.

:::

This example uses a custom "regex" operation to produce a rule with the "contains" operator, using the regular expression's `source` property as the `value`.

```ts
parseJsonLogic(
  { regex: [{ var: 'firstName' }, /^Stev/] },
  {
    jsonLogicOperations: {
      regex: val => ({ field: val[0].var, operator: 'contains', value: val[1].source }),
    },
  }
);
```

Output (`RuleGroupType`):

```json
{
  "combinator": "and",
  "rules": [
    {
      "field": "firstName",
      "operator": "contains",
      "value": "^Stev"
    }
  ]
}
```

## Spring Expression Language (SpEL)

```ts
import { parseSpEL } from 'react-querybuilder/parseSpEL';

function parseSpEL(spelQuery: string, options?: ParseSpELOptions): RuleGroupTypeAny;
```

`parseSpEL` accepts a [SpEL](https://docs.spring.io/spring-framework/docs/3.0.x/reference/expressions.html) string.

Click the "Import SpEL" button in [the demo](/demo) to try it out.

### Usage

```ts
parseSpEL(`firstName == "Steve" && lastName == "Vai"`);
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

```ts
import { parseCEL } from 'react-querybuilder/parseCEL';

function parseCEL(celQuery: string, options?: ParseCELOptions): RuleGroupTypeAny;
```

`parseCEL` accepts a [CEL](https://github.com/google/cel-spec) string.

Click the "Import CEL" button in [the demo](/demo) to try it out.

### Usage

```ts
parseCEL(`firstName == "Steve" && lastName == "Vai"`);
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

### Custom expressions

Provide a `customExpressionHandler` function to process AST fragments that are not recognized by the default parser.

Example:

```ts
parseCEL('opted_in_at.isBirthday(-1)', {
  customExpressionHandler: expr => ({
    field: expr.left.value,
    operator: expr.right.value,
    value: expr.list.value[0].value,
  }),
});
```

Output (`RuleGroupType`):

```json
{
  "combinator": "and",
  "rules": [
    {
      "field": "opted_in_at",
      "operator": "isBirthday",
      "value": -1
    }
  ]
}
```

## JSONata

```ts
import { parseJSONata } from 'react-querybuilder/parseJSONata';

function parseJSONata(jsonataQuery: string, options?: ParseJSONataOptions): RuleGroupTypeAny;
```

`parseJSONata` accepts a [JSONata](https://jsonata.org/) string.

Click the "Import JSONata" button in [the demo](/demo) to try it out.

### Usage

```ts
parseJSONata(`firstName = "Steve" and lastName in ["Vai", "Vaughan"]`);
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
      "operator": "in",
      "value": ["Vai", "Vaughan"]
    }
  ]
}
```

JSONata lists are always translated to arrays. The [`listsAsArrays` option](#lists-as-arrays) is ignored (effectively always `true`).

## Configuration

### Lists as arrays

To generate arrays instead of comma-separated strings for "in"- and "between"-type operator values, use the `listsAsArrays` option.

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
      // highlight-start
      "value": ["Vai", "Vaughan"]
      // highlight-end
    },
    {
      "field": "age",
      "operator": "between",
      // highlight-start
      "value": [20, 100]
      // highlight-end
    }
  ]
}
```

### Independent combinators

When `independentCombinators` is `true`, `parse*` functions output queries with combinator identifiers _between_ sibling rules/groups instead of at the group level.

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
    // highlight-start
    "and",
    // highlight-end
    {
      "field": "lastName",
      "operator": "=",
      "value": "Vai"
    }
  ]
}
```

### Fields as value source

When the `fields` option is provided (accepting the same types as the [`fields` prop](../components/querybuilder#fields)), `parse*` functions validate clauses with field identifiers to the right of the operator instead of primitive values. A `getValueSources` function (same signature as the [prop](../components/querybuilder#getvaluesources)) can also help validate rules.

For such rules to be valid, one of these must be an array including "field": (1) the `getValueSources` return value, (2) the field's `valueSources` function return value, or (3) the field's `valueSources` property. The code below demonstrates all three methods.

```ts
parseSQL(`SELECT * FROM t WHERE firstName = lastName`, {
  fields: [
    { name: 'firstName', label: 'First Name', valueSources: ['value', 'field'] },
    { name: 'lastName', label: 'Last Name', valueSources: () => ['value', 'field'] },
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
      // highlight-start
      "valueSource": "field"
      // highlight-end
    }
  ]
}
```

### Generating `id`s

When `generateIDs` is `true`, `parse*` functions generate a unique `id` property for the output query object and each nested rule and group using `prepareRuleGroup`.

:::note

`parse*` functions only validate clauses where "field" is the _only_ detected value source. Operators like "between" and "in" must have either only field names or only scalar values to the right of the operator—not mixed. See examples below.

#### Invalid clauses

```ts
// 1 is a scalar value and `iq` is a field name
parseSQL(`SELECT * FROM tbl WHERE age between 1 and iq`);
// List contains a mix of scalar values and field names
parseSQL(`SELECT * FROM tbl WHERE firstName IN (lastName, 'Steve', 'Stevie')`);
```

#### Valid clauses

```ts
// Both are field names
parseSQL(`SELECT * FROM tbl WHERE age between numChildren and iq`);
// Both are scalar values
parseSQL(`SELECT * FROM tbl WHERE age between 26 and 52`);
// All items are field names
parseSQL(`SELECT * FROM tbl WHERE firstName IN (lastName, middleName)`);
// All items are scalar values
parseSQL(`SELECT * FROM tbl WHERE firstName IN ('Steve', 'Stevie')`);
```

:::
