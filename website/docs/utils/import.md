---
title: Import
description: Convert SQL and other formats to query builder objects
---

%importmd ../\_ts_admonition.md

Import/parser functions take a string or object representing a query in a specific language and translate it to a query suitable for the `query` or `defaultQuery` props in a `<QueryBuilder />` component.

The optional second parameter is an options object to configure the parsing behavior or query generation (see [Configuration](#configuration)).

:::info Importing `parse*` functions

Since the `parse*` functions are used less frequently than other utility functions&mdash;and not generally alongside each other&mdash;they were removed from the main export in version 7.

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

These functions were available as separate exports in version 6 (along with [`formatQuery`](./export) and [`transformQuery`](./misc#transformquery)), but they could also be imported from `"react-querybuilder"`. In version 7, they are _only_ available as separate exports. (This change reduced the main bundle size by almost 50%.)

:::

## SQL

```ts
import { parseSQL } from 'react-querybuilder/parseSQL';

function parseSQL(sql: string, options?: ParseSQLOptions): RuleGroupTypeAny;
```

`parseSQL` accepts a SQL `SELECT` statement (either the full statement or the `WHERE` clause by itself).

Click the "Import SQL" button in [the demo](/demo) to try it out.

### Options

In addition to the standard [configuration](#configuration) options, `parseSQL` accepts two options that configure the handling of named or anonymous bind variables within the SQL string.

- `params` (`any[] | Record<string, any>`): An array of parameter values or a parameter-to-value mapping object.
- `paramPrefix` (`string`): Ignores this string at the beginning of parameter identifiers when matching to parameter names in the `params` object.

### Usage

Running any of the following statements will produce the same result (see output below).

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

Since v5.0, `parseSQL` can detect `XOR` operators and convert the expressions into rule groups with combinator "xor". However, since "xor" is not one of the members of `defaultCombinators`, you will need to specify `defaultCombinatorsExtended` (or some derivation of that) in your `<QueryBuilder />` props if you believe the original SQL might contain `XOR` clauses.

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

`parseMongoDB` takes a MongoDB query as a JSON object or `JSON.parse`-able string.

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

`parseMongoDB` can identify and process custom operators with the `additionalOperators` option. The option is a map of operators to their respective processing functions. Functions are passed the operator, the associated value, and any other options that were set. They should return a `RuleType` or `RuleGroupType`. (They should _not_ return `RuleGroupTypeIC`, even if using [independent combinators](../components/querybuilder#independent-combinators). If the `independentCombinators` option is `true`, `parseMongoDB` will convert the final query to `RuleGroupTypeIC` before returning it.)

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

Valid MongoDB query strings may not strictly conform to the JSON specification. To cover the extended format, you may want to pre-parse query strings with a library like [mongodb-query-parser](https://www.npmjs.com/package/mongodb-query-parser) before passing them to `parseMongoDB`.

:::

## JsonLogic

```ts
import { parseJsonLogic } from 'react-querybuilder/parseJsonLogic';

function parseJsonLogic(
  jsonLogic: string | JsonLogic,
  options?: ParseJsonLogicOptions
): RuleGroupTypeAny;
```

`parseJsonLogic` takes a [JsonLogic](https://jsonlogic.com/) object or `JSON.parse`-able string.

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

By default, `parseJsonLogic` handles the standard JsonLogic operations that correspond to one of the default operators in React Query Builder. To handle custom operations, use the `jsonLogicOperations` option.

`jsonLogicOperations` is `Record<string, (val: any) => RuleType | RuleGroupTypeAny`. The keys of the object should be the custom operations, and the corresponding values should be functions that return a rule or group.

:::note

Including any of the standard JsonLogic operations as keys in the `jsonLogicOperations` object will override the default `parseJsonLogic` behavior for those operations.

:::

The example below uses a custom "regex" operation to produce a rule with the "contains" operator, the `value` being the `source` of the regular expression in the JsonLogic rule.

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

`parseSpEL` takes a [SpEL](https://docs.spring.io/spring-framework/docs/3.0.x/reference/expressions.html) string.

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

`parseCEL` takes a [CEL](https://github.com/google/cel-spec) string.

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

## JSONata

```ts
import { parseJSONata } from 'react-querybuilder/parseJSONata';

function parseJSONata(jsonataQuery: string, options?: ParseJSONataOptions): RuleGroupTypeAny;
```

`parseJSONata` takes a [JSONata](https://jsonata.org/) string.

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

JSONata lists are always translated to arrays. The [`listsAsArrays` option](#lists-as-arrays) is ignored and effectively always `true`.

## Configuration

### Lists as arrays

To generate arrays instead of comma-separated strings for lists of values following "in"- and "between"-type operators, use the `listsAsArrays` option.

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

When the `independentCombinators` option is `true`, `parse*` functions will output a query with combinator identifiers _between_ sibling rules/groups instead of the group level.

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

When the `fields` option (which accepts the same types as the [`fields` prop](../components/querybuilder#fields)) is provided, and _only_ if it is provided, then `parse*` functions will validate clauses that have a field identifier to the right of the operator instead of a primitive value. A `getValueSources` function (with the same signature as the [prop of the same name](../components/querybuilder#getvaluesources)) can also be provided to help validate rules.

In order for such a rule to be considered valid, one of the following must be an array that includes the string "field": 1) the `getValueSources` return value, 2) the field's `valueSources` function return value, or 3) the field's `valueSources` property itself. The code below demonstrates all three methods.

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

When the `generateIDs` option is `true`, `parse*` functions will generate a unique `id` property for the output query object and each nested rule and group using `prepareRuleGroup`.

:::note

`parse*` functions will only validate clauses where "field" is the _only_ detected value source. Operators like "between" and "in" that take multiple values must only have field names or only scalar values to the right of the operator, not a mix of field names and scalar values. See examples below.

#### Clauses that will be deemed invalid

```ts
// 1 is a scalar value and `iq` is a field name
parseSQL(`SELECT * FROM tbl WHERE age between 1 and iq`);
// List contains a mix of scalar values and field names
parseSQL(`SELECT * FROM tbl WHERE firstName IN (lastName, 'Steve', 'Stevie')`);
```

#### Clauses that will (probably) be deemed valid

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
