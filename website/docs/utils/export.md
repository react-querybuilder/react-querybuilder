---
title: Export
description: Convert query builder objects to SQL, etc.
---

%importmd ../\_ts_admonition.md

Use the `formatQuery` function to export queries in various formats. The function signature is:

```ts
function formatQuery(
  query: RuleGroupTypeAny,
  options?: ExportFormat | FormatQueryOptions
): string | ParameterizedSQL | ParameterizedNamedSQL | RQBJsonLogic | Record<string, any>;
```

`formatQuery` converts query objects into these formats:

- Formatted `JSON.stringify` result
- Unformatted `JSON.stringify` result with all `id` and `path` properties removed
- SQL `WHERE` clause
  - Parameterized with anonymous parameters
  - Parameterized with named parameters
- ORM query objects (Drizzle, Prisma, Sequelize)
- MongoDB query object
- ~~MongoDB query object as string~~ [_(deprecated)_](#mongodb)
- Common Expression Language (CEL)
- Spring Expression Language (SpEL)
- JsonLogic
- ElasticSearch
- JSONata
- LDAP
- Natural language

The following sections use this example `query`:

```ts
const query: RuleGroupType = {
  id: 'root',
  combinator: 'and',
  not: false,
  rules: [
    {
      id: 'rule1',
      field: 'firstName',
      operator: '=',
      value: 'Steve',
    },
    {
      id: 'rule2',
      field: 'lastName',
      operator: '=',
      value: 'Vai',
    },
  ],
};
```

:::tip

Use [default combinators and operators](./misc#defaults) or map custom ones to defaults with [`transformQuery`](./misc#transformquery) for best results.

<details>
<summary>More information...</summary>

`formatQuery` accepts `RuleGroupTypeAny` queries but only guarantees correct processing for `DefaultRuleGroupTypeAny` queries.

All query `combinator` and `operator` properties must match [`defaultCombinators` or `defaultOperators`](./misc#defaults) names (case-insensitive). Use [`transformQuery`](./misc#transformquery) to map custom names to defaults before calling `formatQuery`.

Example: replacing the default "between" operator with `{ name: "b/w", label: "b/w" }` creates rules with `operator: "b/w"`. For this query:

```json
{
  "combinator": "and",
  "rules": [{ "field": "someNumber", "operator": "b/w", "value": "12,14" }]
}
```

Transform it using `transformQuery` with `operatorMap`:

```ts
const newQuery = transformQuery(query, { operatorMap: { 'b/w': 'between' } });
/*
{
  "combinator": "and",
  "rules": [{ "field": "someNumber", "operator": "between", "value": "12,14" }]
}
*/
```

The `newQuery` is ready for `formatQuery`, including special "between" operator handling.

</details>

:::

## Basic usage

### JSON

Export the internal query representation (from `onQueryChange` callback) as formatted JSON:

```ts
formatQuery(query);
// or
formatQuery(query, 'json');
```

Output is multi-line JSON with 2-space indentation:

```ts
`{
  "id": "root",
  "combinator": "and",
  "not": false,
  "rules": [
    {
      "id": "rule1",
      "field": "firstName",
      "value": "Steve",
      "operator": "="
    },
    {
      "id": "rule2",
      "field": "lastName",
      "value": "Vai",
      "operator": "="
    }
  ]
}`;
```

### JSON without identifiers

Export unformatted (single-line) JSON without `id` or `path` attributes using "json_without_ids". Useful for persistent storage:

```ts
formatQuery(query, 'json_without_ids');
```

Output (string):

```
{"combinator":"and","not":false,"rules":[{"field":"firstName","value":"Steve","operator":"="},{"field":"lastName","value":"Vai","operator":"="}]}
```

### SQL

Export SQL `WHERE` clauses using "sql" format. Compatible with major RDBMS engines, though some cases need [configuration](#configuration). See [presets](#presets) for compatibility details.

```ts
formatQuery(query, 'sql');
```

Output (string):

```
(firstName = 'Steve' and lastName = 'Vai')
```

#### Parameterized SQL

Export SQL with bind variables instead of inline values using "parameterized" format. Returns object with `sql` and `params` properties:

```ts
formatQuery(query, 'parameterized');
```

Output (JSON object):

```json
{
  "sql": "(firstName = ? and lastName = ?)",
  "params": ["Steve", "Vai"]
}
```

#### Named parameters

When anonymous parameters aren't suitable, use "parameterized_named" to name parameters based on field names. Similar to "parameterized" but `params` is an object instead of array:

```ts
formatQuery(query, 'parameterized_named');
```

Output (JSON object):

```json
{
  "sql": "(firstName = :firstName_1 and lastName = :lastName_1)",
  "params": {
    "firstName_1": "Steve",
    "lastName_1": "Vai"
  }
}
```

See also: [`paramPrefix`](#parameter-prefix) and [generating parameter names](#generating-parameter-names).

### ORMs

#### Prisma ORM

Generate objects for Prisma ORM `where` properties using "prisma" format:

> _Note: Prisma does not support field-to-field comparisons, so rules with `valueSource: "field"` will always be invalid._

```ts
const where = formatQuery(query, 'prisma');

console.log(where);
// { AND: [{ firstName: 'Steve' }, { lastName: 'Vai' }] }

const users = await prisma.users.findMany({ where });
```

#### Drizzle ORM

##### Relational Queries API

Generate functions for Drizzle's [relational queries API](https://orm.drizzle.team/docs/rqb) `where` property:

```ts
const where = formatQuery(query, 'drizzle');
// typeof where === 'function'
// where.length === 2
const results = db.query.users.findMany({ where });
```

##### Query Builder API

For Drizzle's [query builder API](https://orm.drizzle.team/docs/select), pass table definition and operators to the `formatQuery`-generated function:

```ts
import { getOperators } from 'drizzle-orm';

const whereFn = formatQuery(query, 'drizzle');
const whereObj = whereFn(table, getOperators());

const query = db.select().from(table).where(whereObj);
```

:::tip

Query builder API objects work with other Drizzle operators, letting you add conditions not in the original query:

```ts
import { and, ne, getOperators } from 'drizzle-orm';

// Conditions from the React Query Builder query object:
const whereFn = formatQuery(query, 'drizzle');
const whereObj = whereFn(table, getOperators());

// All conditions from the original query object _and_ `id != 123`:
const augmentedWhere = and(whereObj, ne(table.id, 123));
const query = db.select().from(table).where(augmentedWhere);
```

:::

<details>

<summary>`@react-querybuilder/drizzle` _(deprecated)_</summary>

Use the [`@react-querybuilder/drizzle`](https://npmjs.com/package/@react-querybuilder/drizzle) package for integration with Drizzle's [query builder API](https://orm.drizzle.team/docs/select).

First, generate a [rule group processor](#rule-group-processor) by passing a Drizzle table config (or a plain object mapping field names to Drizzle `Column` definitions) to `generateDrizzleRuleGroupProcessor`, then use that processor in the `formatQuery` options. The output can be passed to the `.where()` function of a Drizzle query builder chain.

```ts
import { generateDrizzleRuleGroupProcessor } from '@react-querybuilder/drizzle';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { formatQuery } from 'react-querybuilder';

const db = drizzle(process.env.DB_FILE_NAME!);

const table = sqliteTable('musicians', {
  firstName: text(),
  lastName: text(),
});

const ruleGroupProcessor = generateDrizzleRuleGroupProcessor(table);

// Tip: `format` is not required when `ruleGroupProcessor` is provided
const where = formatQuery(query, { ruleGroupProcessor });

const query = db.select().from(table).where(where);
console.log(query.toSQL());
// {
//   sql: 'select "firstName", "lastName" from "musicians" where ("musicians"."firstName" = ? and "musicians"."lastName" = ?)',
//   params: ['Steve', 'Vai']
// }

console.log(query.all());
// [{ firstName: 'Steve', lastName: 'Vai' }]
```

</details>

#### Sequelize

Generate objects for Sequelize `findAll` `where` properties using "sequelize" format. Requirements:

- Sequelize uses `Symbol`s for operator keys, so they must be provided through the `context` option as `sequelizeOperators` (see example below).
- If any rules have `valueSource: "field"`, then the Sequelize `col` function must be provided as `sequelizeCol`.
- If any rules have `valueSource: "field"` and use one of the `doesNot*` operators, then the Sequelize `fn` function must be provided as `sequelizeFn`.

```ts
import { col, fn, Op } from 'sequelize';
const where = formatQuery(query, {
  format: 'sequelize',
  context: { sequelizeOperators: Op, sequelizeCol: col, sequelizeFn: fn },
});

const users = await Users.findAll({ where });
```

### MongoDB

Generate MongoDB queries as JSON objects or strings. Use "mongodb_query" format (recommended) for JSON objects. The "mongodb" format is just the stringified version.

:::info

The "mongodb" format was deprecated when the "mongodb_query" export format was introduced, in version 8.1.0.

:::

```ts
formatQuery(query, 'mongodb_query');
```

Output (JSON object):

```json
{ "$and": [{ "firstName": "Steve" }, { "lastName": "Vai" }] }
```

:::info

MongoDB formats don't support group inversion (`not: true`), but individual rules can use the `"!="` operator.

:::

### Common Expression Language

For Common Expression Language (CEL) output, use the "cel" format.

```ts
formatQuery(query, 'cel');
```

Output (string):

```
firstName = "Steve" && lastName = "Vai"
```

### Spring Expression Language

For Spring Expression Language (SpEL) output, use the "spel" format.

```ts
formatQuery(query, 'spel');
```

Output (string):

```
firstName == 'Steve' and lastName == 'Vai'
```

### JsonLogic

Generate objects for JsonLogic `apply` function (see https://jsonlogic.com/):

```ts
formatQuery(query, 'jsonlogic');
```

Output (JSON object):

```json
{ "and": [{ "==": [{ "var": "firstName" }, "Steve"] }, { "==": [{ "var": "lastName" }, "Vai"] }] }
```

:::tip

Register additional `startsWith` and `endsWith` operators from `react-querybuilder` before using JsonLogic's `apply()`. These aren't [standard JsonLogic operations](https://jsonlogic.com/operations.html) but correspond to "beginsWith" and "endsWith" operators.

Loop through `jsonLogicAdditionalOperators` entries for future-proof registration of any new custom operators:

```ts
import { add_operation, apply } from 'json-logic-js';
import { jsonLogicAdditionalOperators } from 'react-querybuilder';

for (const [op, func] of Object.entries(jsonLogicAdditionalOperators)) {
  add_operation(op, func);
}

apply({ startsWith: [{ var: 'firstName' }, 'Stev'] }, data);
```

:::

### ElasticSearch

Generate objects for [ElasticSearch](https://www.elastic.co/) processing:

```ts
formatQuery(query, 'elasticsearch');
```

Output (JSON object):

```json
{ "bool": { "must": [{ "term": { "firstName": "Steve" } }, { "term": { "lastName": "Vai" } }] } }
```

### JSONata

Generate [JSONata](https://jsonata.org/) filters using "jsonata" format. Use [`parseNumbers` option](#parse-numbers) for numeric values since JSONata doesn't auto-cast strings to numbers:

```ts
formatQuery(query, { format: 'jsonata', parseNumbers: true });
```

Output (string):

```
firstName = "Steve" and lastName = "Vai"
```

:::tip Handling date values in JSONata

React Query Builder lacks standard date detection, so use `datetimeRuleProcessorJSONata` from [`@react-querybuilder/datetime`](../datetime#jsonata).

For more control, implement a custom rule processor (example below lacks error checking but provides a starting point):

```ts
const customRuleProcessor: RuleProcessor = (rule, options) => {
  // `datatype` is a non-standard property of the field, used for this example only.
  // Replace this condition with your own logic to determine if the value is a date.
  if (options?.fieldData?.datatype === 'date') {
    return `$toMillis(${rule.field}) ${rule.operator} $toMillis("${rule.value}")`;
  }
  return defaultRuleProcessorJSONata(rule, options);
};
```

:::

### LDAP

Generate [LDAP](https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol) filters:

> _Note: LDAP filters do not support direct comparison between the values of two attributes within the same entry, so rules with `valueSource: "field"` will always be invalid._

```ts
formatQuery(query, 'ldap');
```

Output (string):

```
(&(givenName=Steve)(sn=Vai))
```

### Natural language

Generate natural language queries using "natural_language" format. Use `getOperators` and `fields` options to render labels instead of values. See [i18n options](#internationalization):

```ts
formatQuery(query, {
  format: 'natural_language',
  parseNumbers: true,
  getOperators: () => defaultOperators,
  fields: [
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'age', label: 'Age' },
  ],
});
```

Output (string):

```
First Name is 'Steve', and Last Name is "Vai", and Age is between 26 and 52
```

## Configuration

Pass an object as the second argument for fine-grained output control:

### Parse numbers

Render values as numbers instead of quoted strings using `parseNumbers: true`. See [Number parsing](./misc#number-parsing) for details.

#### Preserve value order

`formatQuery` sorts "between"/"notBetween" values in ascending order when `parseNumbers` renders them as numbers. Disable with `preserveValueOrder`:

```ts
const query = {
  rules: [{ field: 'age', operator: 'between', value: [30, 20] }],
};

formatQuery(query, { format: 'sql', parseNumbers: true });
/*
"(age between 20 and 30)"
*/

formatQuery(query, { format: 'sql', parseNumbers: true, preserveValueOrder: true });
/*
"(age between 30 and 20)"
*/
```

:::caution

This can create conditions that always evaluate to false. SQL's `X BETWEEN Y AND Z` equals `X >= Y AND X <= Z`—if Y > Z, no X value satisfies both conditions.

`formatQuery` assumes users mean "X is between points Y and Z" regardless of direction.

:::

### Rule processor

Customize individual rule output using `ruleProcessor`. Only validated rules reach this function:

```ts
ruleProcessor(rule, { escapeQuotes, fieldData, ...otherOptions });
```

Arguments: `RuleType` object and `ValueProcessorOptions` object with `escapeQuotes` (true for string values, false for field names), `fieldData` (corresponding `Field` object), and other `formatQuery` options.

The default rule processors for each format are available as exports from `react-querybuilder`:

- `defaultRuleProcessorCEL`
- `defaultRuleProcessorElasticSearch`
- `defaultRuleProcessorJSONata`
- `defaultRuleProcessorJsonLogic`
- `defaultRuleProcessorMongoDB`
- `defaultRuleProcessorMongoDBQuery`
- `defaultRuleProcessorNL`
- `defaultRuleProcessorSpEL`
- `defaultRuleProcessorSQL`
- `defaultRuleProcessorParameterized`

Refer to the source code to determine the appropriate return type for custom rule processors.

Use the appropriate default rule processor as a fallback so your custom processor doesn't cover all cases:

```ts
const query: RuleGroupType = {
  combinator: 'and',
  not: false,
  rules: [
    { field: 'firstName', operator: 'has', value: 'S' },
    //        non-standard operator ^^^^^
    { field: 'lastName', operator: '=', value: 'Vai' },
  ],
};

const customRuleProcessor: RuleProcessor = (rule, options) => {
  // The "has" operator is not handled by the default processor
  if (rule.operator === 'has') {
    return { in: [rule.value, { var: rule.field }] };
  }

  // Defer to the default processor for all other operators
  return defaultRuleProcessorJsonLogic(rule, options);
};

formatQuery(query, { format: 'jsonlogic', ruleProcessor: customRuleProcessor });
/*
{
  and: [
    { in: ["S", { var: "firstName" }] },
    { "==": [{ var: "lastName" }, "Vai"] }
  ]
}
*/
```

This SQL example (using Oracle syntax) demonstrates the generation of a case-insensitive condition:

```ts
// `query` is the same as in the previous example

const customRuleProcessor: RuleProcessor = (rule, options) => {
  if (rule.operator === 'has') {
    return `UPPER(${rule.field}) LIKE UPPER('%${rule.value}%')`;
  }

  return defaultRuleProcessorSQL(rule, options);
};

formatQuery(query, { format: 'sql', ruleProcessor: customRuleProcessor });
/*
"(UPPER(firstName) LIKE UPPER('%S%') and lastName = 'Vai')"
 ^------------custom--------------^ ^------default-----^
*/
```

#### Generating parameter names

The "parameterized" and "parameterized_named" formats require rule processors to return an object resembling `formatQuery`'s return type for these formats. The `getNextNamedParam` utility helps generate unique parameter names. The example below matches the Oracle SQL example above, but uses "parameterized_named" format.

```ts
const customRuleProcessor: RuleProcessor = (rule, options) => {
  if (rule.operator === 'has') {
    // TIP: `getNextNamedParam` can be called multiple times in case your SQL
    // requires multiple unique parameters (e.g., in a "between" condition).
    // Each call will generate a new name.
    const paramName = options.getNextNamedParam!(rule.field);
    return {
      sql: `UPPER(${rule.field}) LIKE UPPER('%' || ${options.paramPrefix}${paramName} || '%')`,
      params: { [paramName]: rule.value },
    };
  }

  return defaultRuleProcessorSQLParameterized(rule, options);
};

formatQuery(query, { format: 'parameterized_named', ruleProcessor: customRuleProcessor });
/*
{
  sql: "(UPPER(firstName) LIKE UPPER('%' || :firstName_1 || '%') and lastName = :lastName_1)",
  params: {
    firstName_1: "S",
    lastName_1: "Vai"
  }
}
*/
```

### Value processor

`valueProcessor` accepts the same arguments as `ruleProcessor`, but only affects the "value" portion (to the right of the operator) for "sql" format. If both are provided, `ruleProcessor` takes precedence.

:::tip

For all formats except "sql", `valueProcessor` is a synonym for `ruleProcessor`. Use `ruleProcessor` unless exporting SQL and only customizing the value portion.

:::

```ts
// `query` is the same as in the previous example

const customValueProcessor: ValueProcessorByRule = (rule, options) => {
  if (rule.operator === 'has') {
    return `'%${rule.value}%'`;
  }

  return defaultValueProcessorByRule(rule, options);
};

formatQuery(query, { format: 'sql', valueProcessor: customValueProcessor });
/*
"(firstName like '%S%' and lastName = 'Vai')"
 ^---default---^ ^---^-custom  ^--default--^
*/
```

#### Legacy `valueProcessor` behavior

:::caution

The legacy `valueProcessor` signature exists for backwards compatibility, but avoid it. Options aren't passed in, making it difficult to correctly fall back to default processors.

:::

If the `valueProcessor` function accepts three or more arguments (excluding those with default values), it's called like this:

```ts
valueProcessor(field, operator, value, valueSource);
```

No options or additional rule properties are passed as arguments. This prevents `formatQuery` from setting the `escapeQuotes` option, among other problems.

This legacy behavior is documented for completeness but not recommended.

```ts
const query: RuleGroupType = {
  combinator: 'and',
  not: false,
  rules: [
    { field: 'instrument', operator: 'in', value: ['Guitar', 'Vocals'] },
    { field: 'lastName', operator: '=', value: 'Vai' },
  ],
};

const customValueProcessor = (field, operator, value) => {
  if (operator === 'in') {
    // Assuming `value` is an array, such as from a multi-select
    return `(${value.map(v => `'${v.trim()}'`).join(',')})`;
  }

  return defaultValueProcessor(field, operator, value);
};

formatQuery(query, { format: 'sql', valueProcessor: customValueProcessor });
/*
"(instrument in ('Guitar','Vocals') and lastName = 'Vai')"
*/
```

Default value processors using the legacy signature are available for some query language formats.

| Format                | Current signature (recommended)      | Legacy signature (not recommended) |
| --------------------- | ------------------------------------ | ---------------------------------- |
| "sql"                 | `defaultValueProcessorByRule`        | `defaultValueProcessor`            |
| "parameterized"       | `defaultValueProcessorByRule`        | `defaultValueProcessor`            |
| "parameterized_named" | `defaultValueProcessorByRule`        | `defaultValueProcessor`            |
| "cel"                 | `defaultValueProcessorCELByRule`     | `defaultCELValueProcessor`         |
| "mongodb"             | `defaultValueProcessorMongoDBByRule` | `defaultMongoDBValueProcessor`     |
| "spel"                | `defaultValueProcessorSpELByRule`    | `defaultSpELValueProcessor`        |

### Operator processor

`operatorProcessor` accepts the same arguments as `ruleProcessor`, but only affects the "operator" portion for "sql", "parameterized", "parameterized_named", and "natural_language" formats.

```ts
formatQuery(query, {
  format: 'sql',
  // Convert all operators to uppercase
  operatorProcessor: (rule, options) => defaultOperatorProcessorSQL(rule, options).toUpperCase(),
});
/*
"(firstName LIKE 'Stev%' and lastName IN ('Vai', 'Vaughan'))"
*/
```

### Quote field names

Some database engines wrap field names in backticks (`` ` ``) or square brackets (`[]`). Configure this with the `quoteFieldNamesWith` option (string or array of two strings).

```ts
formatQuery(query, { format: 'sql', quoteFieldNamesWith: '`' });
/*
"(`firstName` = 'Steve' and `lastName` = 'Vai')"
*/

formatQuery(query, { format: 'sql', quoteFieldNamesWith: ['[', ']'] });
/*
"([firstName] = 'Steve' and [lastName] = 'Vai')"
*/
```

#### Field identifier chains

To quote members of field identifier chains independently, use `fieldIdentifierSeparator`. A common value is `"."`.

In this example, assume the field names are `musicians.firstName` and `musicians.lastName`.

```ts
formatQuery(query, {
  format: 'sql',
  quoteFieldNamesWith: ['[', ']'],
  fieldIdentifierSeparator: '.',
});
/*
"([musicians].[firstName] = 'Steve' and [musicians].[lastName] = 'Vai')"
*/
```

### Quote values

Some database engines can accept string literals in double quotes (`"`). This can be configured with the `quoteValuesWith` option which should be assigned a one-character string.

```ts
formatQuery(query, { format: 'sql', quoteValuesWith: '"' });
/*
"(firstName = "Steve" and lastName = "Vai")"
*/
```

### Parameter prefix

If the "parameterized_named" format is used, configure the parameter prefix used in the `sql` string with the `paramPrefix` option, should the default `":"` be inappropriate.

```ts
const p = formatQuery(query, {
  format: 'parameterized_named',
  paramPrefix: '$',
});
/*
p.sql === "(firstName = $firstName_1 and lastName = $lastName_1)"
//                     ^^^                         ^^^
*/
```

### Retain parameter prefixes

`paramsKeepPrefix` simplifies compatibility with [SQLite](https://sqlite.org/). With "parameterized_named" format, `params` object keys maintain the `paramPrefix` string as it appears in the `sql` string (e.g. `{ ":param_1": "val" }` instead of `{ "param_1": "val" }`).

### Numbered parameters

For "parameterized" format, parameter placeholders in generated SQL are "?" by default. When `numberedParams` is `true`, placeholders become numbered indices starting with `1`, incrementing left to right. Each placeholder number is prefixed with the configured `paramPrefix` string (default `":"`).

```ts
const p = formatQuery(query, {
  format: 'parameterized',
  paramPrefix: '$',
  numberedParams: true,
});
/*
p.sql === "(firstName = $1 and lastName = $2)"
*/
```

Previously, [manual post-processing](../tips/custom-bind-variables) was necessary for this effect.

### Concatenation operator

Most SQL database dialects use the `||` operator to concatenate strings. SQL Server uses `+`, and MySQL uses the `CONCAT` function instead.

Configure the concatenation operator (used for "contains", "beginswith", and "endswith" operators when `valueSource` is "field") with the `concatOperator` option. `formatQuery` uses the ANSI standard `||` by default.

If the value is `"CONCAT"` (case-insensitive), the `CONCAT` function is used. (Note: Oracle SQL doesn't support more than two values in `CONCAT`, so avoid this option with Oracle. The default `||` operator is Oracle-compatible.)

```ts
const query = {
  combinator: 'and',
  rules: [
    { field: 'firstName', operator: '=', value: 'Kris' },
    { field: 'lastName', operator: 'beginswith', value: 'firstName', valueSource: 'field' },
  ],
};

formatQuery(query, { format: 'sql', concatOperator: '+' });
/*
"(firstName = 'Kris' and lastName like firstName + '%')"
*/

formatQuery(query, { format: 'sql', concatOperator: 'CONCAT' });
/*
"(firstName = 'Kris' and lastName like CONCAT(firstName, '%'))"
*/
```

### Presets

The `preset` option configures options known to enable or improve compatibility with particular query language dialects. Individual options override their respective preset values. Available presets:

:::info

If `preset` is from `sqlDialectPresets`, it only applies if `format` is undefined or one of the SQL-based formats.

:::

<table>
  <thead>
    <tr><th>Dialect</th><th>Preset options</th></tr>
  </thead>
  <tbody>
    <tr><td>

`'ansi'`

</td><td>

```json
{}
```

</td></tr>
    <tr><td>

`'sqlite'`

</td><td>

```json
{ "paramsKeepPrefix": true }
```

</td></tr>
    <tr><td>

`'oracle'`

</td><td>

```json
{}
```

</td></tr>
    <tr><td>

`'mssql'`

</td><td>

```json
{
  "quoteFieldNamesWith": ["[", "]"],
  "concatOperator": "+",
  "fieldIdentifierSeparator": ".",
  "paramPrefix": "@"
}
```

</td></tr>
    <tr><td>

`'mysql'`

</td><td>

```json
{ "concatOperator": "CONCAT" }
```

</td></tr>
    <tr><td>

`'postgresql'`

</td><td>

```json
{ "quoteFieldNamesWith": "\"", "numberedParams": true, "paramPrefix": "$" }
```

</td></tr>
  </tbody>
</table>

Examples:

```ts
formatQuery(query, { format: 'parameterized', preset: 'postgresql' });
/*
{
  sql: `("firstName" like $1 and "lastName" in ($2, $3))`,
  params: ['Stev%', 'Vai', 'Vaughan']
}
*/

formatQuery(query, { format: 'sql', preset: 'mssql' });
/*
"([musicians].[firstName] = 'Kris' and [musicians].[lastName] like [musicians].[firstName] + '%')"
*/
```

### Fallback expression

`fallbackExpression` is a string included in output when `formatQuery` can't determine what to do for a particular rule or group. The intent is to maintain valid syntax while not affecting query criteria. If not provided, the default fallback expression for the format is used:

| Format                  | Default `fallbackExpression`  |
| ----------------------- | ----------------------------- |
| `'sql'`                 | `'(1 = 1)'`                   |
| `'parameterized'`       | `'(1 = 1)'`                   |
| `'parameterized_named'` | `'(1 = 1)'`                   |
| `'ldap'`                | `''`                          |
| `'mongodb'`             | `'{"$and":[{"$expr":true}]}'` |
| `'mongodb_query'`       | `'{"$and":[{"$expr":true}]}'` |
| `'natural_language'`    | `'1 is 1'`                    |
| `'cel'`                 | `'1 == 1'`                    |
| `'spel'`                | `'1 == 1'`                    |
| `'jsonata'`             | `'(1 = 1)'`                   |
| `'jsonlogic'`           | `false`                       |
| `'elasticsearch'`       | `{}`                          |

### Value sources

When a rule's `valueSource` property is "field", no parameters are generated.

```ts
const pf = formatQuery(
  {
    combinator: 'and',
    rules: [
      { field: 'firstName', operator: '=', value: 'lastName', valueSource: 'field' },
      { field: 'firstName', operator: 'beginsWith', value: 'middleName', valueSource: 'field' },
    ],
  },
  'parameterized_named'
);
```

Output (JSON object):

```json
{
  "sql": "(firstName = lastName and firstName like middleName || '%')",
  "params": {}
}
```

### Placeholder values

Rules where `field`, `operator`, or `value` matches the placeholder value (default `"~"`) are excluded from output for most export formats (see [Automatic validation](#automatic-validation)). To use a different placeholder string, set the `placeholderFieldName`, `placeholderOperatorName`, or `placeholderValueName` options. These correspond to `fields.placeholderName`, `operators.placeholderName`, and `values.placeholderName` properties on the main component's [`translations` prop](../components/querybuilder#translations) object. This behavior for the `value` property only applies if `placeholderValueName` is explicitly set. The others use their defaults if undefined.

### Internationalization

These i18n options are specific to ["natural_language"](#natural-language) format.

#### Word order

Based on [constituent word order](https://en.wikipedia.org/wiki/Word_order#Constituent_word_orders), the `wordOrder` option accepts all permutations of "SVO" ("SOV", "VSO", etc.) and outputs field, operator, and value in corresponding order (S = field, V = operator, O = value).

```ts
formatQuery(query, {
  format: 'natural_language',
  wordOrder: 'SOV',
});
// `First Name 'Steve' is`
```

#### Translations

Map "and", "or", "true", and "false" to their translated equivalents, plus prefix and suffix options for rule groups.

The base prefix/suffix options are "groupPrefix" and "groupSuffix". The applicability of a group-related translation is determined by two conditions: (1) whether the group's `not` property is true, and (2) whether the combinator for the group is `"xor"`. The base `"group*"` translations are the fallbacks for when neither condition is true. When one or more conditions are true, `formatQuery` will look for a property on the `translations` object that matches the base property with a suffix of underscore (`"_"`) plus the condition ID (`"not"` or `"xor"`).

For example, when a group has a `not: true` property, but the `combinator` is something other than `"xor"`, `formatQuery` will look for the `groupSuffix_not` key. For example:

```ts
formatQuery(query, {
  format: 'natural_language',
  translations: {
    groupSuffix: 'is def the truth',
    groupSuffix_not: 'is so not true',
  },
});
// Given the following query:
// const query = {
//   rules: [
//     { rules: [{ field: 'firstName', operator: '=', value: 'Steve' }] },
//     'and',
//     { not: true, rules: [{ field: 'firstName', operator: '=', value: 'Vai' }] },
//   ]
// };
// ...potential output could be:
// `(First Name is 'Steve') is def the truth, and (Last Name is 'Vai') is so not true`
```

When `not` is falsy but the `combinator` is `"xor"`, `groupSuffix_xor` will be used if it exists. Otherwise it will fall back to the default. If both conditions are true, the order of the suffixes doesn't matter: both "groupSuffix_not_xor" and "groupSuffix_xor_not" would be valid (although there is no guarantee which one will be used if both are present).

#### Operator map

`operatorMap` is a map of operators to their natural language equivalents. If the result can differ based on the `valueSource`, the key should map to an array where the second element represents the string to be used when `valueSource` is "field"; the first element will be used in all other cases.

```ts
formatQuery(query, {
  format: 'natural_language',
  operatorMap: {
    '=': 'is most assuredly',
    '!=': ['is not', 'differs from'],
  },
});
// `First Name is most assuredly 'Steve', and Last Name differs from First Name`
```

### Rule group processor

`formatQuery` processes, validates, and augments configuration options before passing the query and "final" options object to the appropriate rule group processor for the requested format.

To leverage this pre-processing but generate custom output, use the `ruleGroupProcessor` option. The function is called with the rule group and "final" prepared options object:

```ts
ruleGroupProcessor(ruleGroup, finalOptions);
```

> **_Note: The `ruleGroupProcessor` option overrides the `format` option._**

The default rule group processors for each format are available as exports from `react-querybuilder`:

- `defaultRuleGroupProcessorCEL`
- `defaultRuleGroupProcessorElasticSearch`
- `defaultRuleGroupProcessorJSONata`
- `defaultRuleGroupProcessorJsonLogic`
- `defaultRuleGroupProcessorMongoDB`
- `defaultRuleGroupProcessorMongoDBQuery`
- `defaultRuleGroupProcessorNL`
- `defaultRuleGroupProcessorSpEL`
- `defaultRuleGroupProcessorSQL`
- `defaultRuleGroupProcessorParameterized`

Use the appropriate default rule group processor as a fallback so your custom processor doesn't need to cover all cases:

```ts
const query: RuleGroupType = {
  combinator: 'and',
  not: false,
  rules: [
    { combinator: 'and', rules: [] },
    // empty rules array ^^^^^^^^^
    { field: 'firstName', operator: 'beginsWith', value: 'S' },
  ],
};

const customRuleGroupProcessor: RuleGroupProcessor<string> = (ruleGroup, options) => {
  if (ruleGroup.rules.length === 0) {
    // Normally, empty rule groups are ignored, but here they evaluate to false
    return '(1 = 0)';
  }

  // Defer to the default rule group processor for all other operators
  return defaultRuleGroupProcessorSQL(ruleGroup, options);
};

formatQuery(query, { ruleGroupProcessor: customRuleGroupProcessor });
/*
"((1 = 0) and firstName LIKE 'S%')"
*/
```

## Validation

Validation options (`validator` and `fields` – see [Validation](./validation)) only affect output when `format` is not "json" or "json_without_ids". If the `validator` function returns `false`, the `fallbackExpression` is returned. Otherwise, groups and rules marked as invalid (by the validation map from the `validator` function or field-based `validator` function) are ignored.

Example:

```ts
const query: RuleGroupType = {
  id: 'root',
  rules: [
    { id: 'r1', field: 'firstName', value: '', operator: '=' },
    { id: 'r2', field: 'lastName', value: 'Vai', operator: '=' },
  ],
  combinator: 'and',
  not: false,
};

// Example 1
// Query is invalid based on the validator function
formatQuery(query, {
  format: 'sql',
  validator: () => false,
});
/*
"(1 = 1)" <-- see `fallbackExpression` option
*/

// Example 2
// Rule "r1" is invalid based on the validation map
formatQuery(query, {
  format: 'sql',
  validator: () => ({ r1: false }),
});
/*
"(lastName = 'Vai')" <-- skipped `firstName` rule with `id === 'r1'`
*/

// Example 3
// Rule "r1" is invalid based on the field validator for `firstName`
formatQuery(query, {
  format: 'sql',
  fields: [{ name: 'firstName', validator: () => false }],
});
/*
"(lastName = 'Vai')" <-- skipped `firstName` rule because field validator returned `false`
*/
```

### Automatic validation

To minimize invalid syntax, `formatQuery` performs basic validation for "in", "notIn", "between", and "notBetween" operators for all formats except "json" and "json_without_ids", even without specified validator functions or field validators.

- Rules with "in" or "notIn" operators are invalid if the `value` is neither an array with at least one element (`value.length > 0`) nor a non-empty string.
- Rules with "between" or "notBetween" operators are invalid if the `value` is neither an array with at least two elements (`value.length >= 2`) nor a string with at least one comma not at the first or last position (`value.split(',').length >= 2`, and neither element is empty).
- Rules where `field`, `operator`, or `value` match their respective placeholder are invalid:
  <!-- prettier-ignore -->
  ```ts
  field === placeholderFieldName ||
    operator === placeholderOperatorName ||
    (placeholderValueName !== undefined && value === placeholderValueName)
  ```
