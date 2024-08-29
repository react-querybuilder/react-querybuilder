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
): string | ParameterizedSQL | ParameterizedNamedSQL | RQBJsonLogic;
```

`formatQuery` converts a given query object into one of the following formats:

- Formatted `JSON.stringify` result
- Unformatted `JSON.stringify` result with all `id` and `path` properties removed
- SQL `WHERE` clause
- Parameterized SQL, anonymous parameters
- Parameterized SQL, named parameters
- MongoDB
- Common Expression Language (CEL)
- Spring Expression Language (SpEL)
- JsonLogic
- ElasticSearch
- JSONata

For the next few sections (unless otherwise noted), assume the `query` variable has been defined as:

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

> **_<abbr title="Too long; didn't read">TL;DR</abbr>: For best results, use the [default combinators and operators](./misc#defaults) or map your custom combinators/operators to the defaults with [`transformQuery`](./misc#transformquery)._**

While `formatQuery` technically accepts query objects of type `RuleGroupTypeAny` (i.e., `RuleGroupType` or `RuleGroupTypeIC`), it is not guaranteed to process a query correctly unless the query also conforms to the type `DefaultRuleGroupTypeAny` (i.e., `DefaultRuleGroupType` or `DefaultRuleGroupTypeIC`).

In practice, this means that all `combinator` and `operator` properties in the query must match the `name` of an element in [`defaultCombinators` or `defaultOperators`](./misc#defaults), respectively. If you implement custom combinator and/or operator names, you can use the [`transformQuery` function](./misc#transformquery) to map your query properties to the defaults.

For example, assume your implementation replaces the default "between" operator (`{ name: "between", label: "between" }`) with `{ name: "b/w", label: "b/w" }`. Any rules using this operator would have `operator: "b/w"` instead of `operator: "between"`. So if a query looked like this...

```json
{
  "combinator": "and",
  "rules": [
    {
      "field": "someNumber",
      "operator": "b/w",
      "value": "12,14"
    }
  ]
}
```

...you could run it through `transformQuery` with the `operatorMap` option:

```ts
const newQuery = transformQuery(query, { operatorMap: { 'b/w': 'between' } });
/*
{
  "combinator": "and",
  "rules": [
    {
      "field": "someNumber",
      "operator": "between",
      "value": "12,14"
    }
  ]
}
*/
```

The `newQuery` object would be ready for processing by `formatQuery`, including special handling of the "between" operator.

:::

## Basic usage

### JSON

To export the internal query representation (like what `react-querybuilder` passes to the `onQueryChange` callback) formatted by `JSON.stringify`, simply pass the query to `formatQuery`:

```ts
formatQuery(query);
// or
formatQuery(query, 'json');
```

The output will be a multi-line string representation of the query using 2 spaces for indentation.

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

To export the internal query representation without formatting (single-line, no indentation) and without any `id` or `path` attributes, use the "json_without_ids" format. This can be useful for serializing the query for persistent storage.

```ts
formatQuery(query, 'json_without_ids');
```

Output:

```ts
`{"combinator":"and","not":false,"rules":[{"field":"firstName","value":"Steve","operator":"="},{"field":"lastName","value":"Vai","operator":"="}]}`;
```

### SQL

To export a SQL `WHERE` clause, use the "sql" format. The output should be largely compatible with major RDBMS engines, but may require [configuration](#configuration) in some cases. See [presets](#presets) for more details about known compatibility issues.

```ts
formatQuery(query, 'sql');
```

Output:

```ts
`(firstName = 'Steve' and lastName = 'Vai')`;
```

#### Parameterized SQL

To export a SQL `WHERE` clause with bind variables instead of inline values, use the "parameterized" format. The output is an object with `sql` and `params` attributes.

```ts
formatQuery(query, 'parameterized');
```

Output:

```json
{
  "sql": "(firstName = ? and lastName = ?)",
  "params": ["Steve", "Vai"]
}
```

#### Named parameters

If anonymous parameters (aka bind variables) are not acceptable, `formatQuery` can name each parameter based on the field name when the "parameterized_named" format is used. The output object is similar to the "parameterized" format, but the `params` attribute is an object instead of an array.

```ts
formatQuery(query, 'parameterized_named');
```

Output:

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

### MongoDB

For MongoDB-compatible output, use the "mongodb" format.

```ts
formatQuery(query, 'mongodb');
```

Output:

```ts
`{"$and":[{"firstName":"Steve"},{"lastName":"Vai"}]}`;
```

:::info

The MongoDB export format does not support the inversion operator (setting `not: true` for a rule group). However, rules _can_ be created using the `"!="` operator.

:::

### Common Expression Language

For Common Expression Language (CEL) output, use the "cel" format.

```ts
formatQuery(query, 'cel');
```

Output:

```ts
`firstName = "Steve" && lastName = "Vai"`;
```

### Spring Expression Language

For Spring Expression Language (SpEL) output, use the "spel" format.

```ts
formatQuery(query, 'spel');
```

Output:

```ts
`firstName == 'Steve' and lastName == 'Vai'`;
```

### JsonLogic

The "jsonlogic" format produces an object that can be processed by the JsonLogic `apply` function (see https://jsonlogic.com/).

```ts
formatQuery(query, 'jsonlogic');
```

Output:

```json
{ "and": [{ "==": [{ "var": "firstName" }, "Steve"] }, { "==": [{ "var": "lastName" }, "Vai"] }] }
```

:::tip

Before using JsonLogic's `apply()` method to apply the result of `formatQuery(query, 'jsonlogic')`, register the additional operators `startsWith` and `endsWith` exported from `react-querybuilder`. These are not [standard JsonLogic operations](https://jsonlogic.com/operations.html), but they correspond to the "beginsWith" and "endsWith" operators, respectively, from `react-querybuilder`.

The most future-proof way to do this is to loop through the `jsonLogicAdditionalOperators` entries like below. This way, if any more custom operators are added in the future they will be automatically available.

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

The "elasticsearch" format produces an object that can be processed by [ElasticSearch](https://www.elastic.co/).

```ts
formatQuery(query, 'elasticsearch');
```

Output:

```json
{ "bool": { "must": [{ "term": { "firstName": "Steve" } }, { "term": { "lastName": "Vai" } }] } }
```

### JSONata

For [JSONata](http://jsonata.org/) filters, use the "jsonata" format. Use the [`parseNumbers` option](#parse-numbers) to ensure that numeric values are rendered as numbers in the output since JSONata does not automatically cast strings to numbers.

```ts
formatQuery(query, { format: 'jsonata', parseNumbers: true });
```

Output:

```ts
`firstName = "Steve" and lastName = "Vai"`;
```

:::tip

Since React Query Builder does not have an official way to determine when values should be treated as dates or date-like strings, we recommend implementing a custom rule processor to handle date rules when exporting to JSONata. The example below has no error checking or validation (among other issues), but it can be a good starting point.

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

## Configuration

An object can be passed as the second argument instead of a string to have more fine-grained control over the output.

### Parse numbers

Since HTML `<input>` controls store values as strings (even for `type="number"`), exporting a query to various formats may produce a string representation of a value when a true numeric value is required or more appropriate. Set the `parseNumbers` option to `true` (or one of the specific algorithms: "enhanced", "native", or "strict"; "strict" is the same as `true`) and `formatQuery` will attempt to convert all `value` properties to type `number`. When numeric parsing fails, the original value is retained.

```ts
const query: RuleGroupType = {
  combinator: 'and',
  not: false,
  rules: [
    { field: 'digits', operator: '=', value: '20' },
    { field: 'age', operator: 'between', value: '26, 52' },
    { field: 'lastName', operator: '=', value: 'Vai' },
  ],
};

// Default configuration - all values are strings:
formatQuery(query, { format: 'sql' });
// "(digits = '20' and age between '26' and '52' and lastName = 'Vai')"

// `parseNumbers: true` - numeric strings converted to actual numbers:
formatQuery(query, { format: 'sql', parseNumbers: true });
// "(digits = 20 and age between 26 and 52 and lastName = 'Vai')"
```

:::info

To avoid information loss, this option is more strict about what qualifies as "numeric" than [the standard `parseFloat` function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseFloat). To oversimplify a bit, `parseFloat` works with any string that _starts_ with a numeric sequence, ignoring the rest of the string beginning with the first non-numeric character. In contrast, when `parseNumbers` is `true`, `formatQuery` will only convert a `value` to a `number` if it appears to be numeric _in its entirety_ (after trimming whitespace).

Each of the following expressions evaluates to `true`:

```ts
// Everything after the '3' is ignored by `parseFloat`
parseFloat('000123abcdef') === 123;

// `value` contains non-numeric characters, so remains as-is
formatQuery(
  { rules: [{ field: 'f', operator: '=', value: '000123abcdef' }] },
  { format: 'sql', parseNumbers: true }
) === "(f = '000123abcdef')";

// `value` is wholly numeric (after trimming whitespace) so it gets converted to a number
formatQuery(
  { rules: [{ field: 'f', operator: '=', value: '  000123  ' }] },
  { format: 'sql', parseNumbers: true }
) === '(f = 123)';
```

:::

### Rule processor

To customize the output for individual rules, use the `ruleProcessor` configuration option. Rules will only be passed to the provided processor function if they first pass [validation](#validation). The function will be called like this:

```ts
ruleProcessor(rule, { escapeQuotes, fieldData, ...otherOptions });
```

The first argument is the `RuleType` object from the query. The second argument is a `ValueProcessorOptions` object. `escapeQuotes` is `true` or `false` when appropriate as determined by the internal `formatQuery` logic (generally speaking, quotes are escaped for string values and not escaped otherwise—as when values represent field names). `fieldData` is the corresponding `Field` object from the `fields` array if it was passed to `formatQuery`. Other options are copied directly from the `formatQuery` options, or the default value if not specified.

The default rule processors for each format are available as exports from `react-querybuilder`:

- `defaultRuleProcessorCEL`
- `defaultRuleProcessorElasticSearch`
- `defaultRuleProcessorJSONata`
- `defaultRuleProcessorJsonLogic`
- `defaultRuleProcessorMongoDB`
- `defaultRuleProcessorSpEL`
- `defaultRuleProcessorSQL`
- `defaultRuleProcessorParameterized`

Refer to the source code for each to determine the appropriate return type for a custom rule processor.

You can use the appropriate default rule processor as a fallback so your custom rule processor doesn't have to cover all cases, as shown below.

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

The "parameterized" and "parameterized_named" formats require rule processors to return an object that closely resembles the return type of `formatQuery` itself for these formats. A utility function `getNextNamedParam` is provided to help generate unique parameter names. The example below is effectively the same as the Oracle SQL example above, but using the "parameterized_named" format.

```ts
const customRuleProcessor: RuleProcessor = (rule, options) => {
  if (rule.operator === 'has') {
    // TIP: `getNextNamedParam` can be called multiple times in case your SQL
    // requires multiple unique parameters. Each call will generate a new name.
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

`valueProcessor` accepts the same arguments as `ruleProcessor`, but only affects the "value" portion of the output (to the right of the operator) for the "sql" format. If both options are provided, `ruleProcessor` takes precedence.

:::tip

For all formats except "sql", `valueProcessor` is merely a synonym for `ruleProcessor`. We recommend using `ruleProcessor` unless you are exporting SQL and only need to customize the value portion of the output.

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

The legacy `valueProcessor` signature exists for backwards compatibility, but we recommend avoiding it. For one reason, the options are not passed in so it becomes more difficult to correctly fall back to a default processor.

:::

If the function assigned to `valueProcessor` accepts three or more arguments (not including those with default values), it will be called like this:

```ts
valueProcessor(field, operator, value, valueSource);
```

Notice that no options or additional properties of the rule are passed as arguments. Among other problems, this prevents `formatQuery` from setting the `escapeQuotes` option.

This legacy behavior is documented here for completeness but, as stated above, is not recommended.

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

Versions of the default value processors using the newer `fn(rule, options)` signature as well as the legacy signature are available for all query language formats except "jsonlogic" ([use `ruleProcessor` instead](#rule-processor)).

- Current signature (recommended):
  - `defaultValueProcessorByRule` (for all SQL-based formats)
  - `defaultValueProcessorCELByRule`
  - `defaultValueProcessorMongoDBByRule`
  - `defaultValueProcessorSpELByRule`
- Legacy signature:
  - `defaultValueProcessor` (for all SQL-based formats)
  - `defaultMongoDBValueProcessor`
  - `defaultCELValueProcessor`
  - `defaultSpELValueProcessor`

### Quote field names

Some database engines wrap field names in backticks (`` ` ``) or square brackets (`[]`). This can be configured with the `quoteFieldNamesWith` option which can be assigned a string or an array of two strings.

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

`paramsKeepPrefix` simplifies compatibility with [SQLite](https://sqlite.org/). When used in conjunction with the "parameterized_named" format, the keys of the `params` object will maintain the `paramPrefix` string as it appears in the `sql` string (e.g. `{ "$param_1": "val" }` instead of `{ "param_1": "val" }`).

### Numbered parameters

For the "parameterized" format, all parameter placeholders in the generated SQL are "?" by default. When the `numberedParams` option is `true`, placeholders will instead be a numbered index beginning with `1`, incrementing by 1 from left to right. Each placeholder number will be prefixed with the configured `paramPrefix` string (default `":"`).

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

Previously, some [manual post-processing](../tips/custom-bind-variables) was necessary to achieve the same effect.

### Concatenation operator

Most SQL database dialects use the `||` operator to concatenate strings. SQL Server uses `+`, and MySQL does not have a concatenation operator—the `CONCAT` function is used instead.

To configure the concatenation operator (used for the "contains", "beginswith", and "endswith" operators when `valueSource` is "field"), use the `concatOperator` option. `formatQuery` uses the ANSI standard `||` by default so this is not usually necessary.

If the value is `"CONCAT"` (case-insensitive), the `CONCAT` function will be used. (Note that Oracle SQL does not support more than two values in the `CONCAT` function, so this option should not be used in that context. The default operator `||` is already compatible with Oracle SQL.)

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

The `preset` option configures options known to enable (or at least improve) compatibility with particular query language dialects. Individual options will override their respective preset values. The following presets are available:

| Dialect        | Preset options                                                                            |
| -------------- | ----------------------------------------------------------------------------------------- |
| `'ansi'`       | N/A                                                                                       |
| `'sqlite'`     | `paramsKeepPrefix: true`                                                                  |
| `'oracle'`     | N/A                                                                                       |
| `'mssql'`      | `quoteFieldNamesWith: ['[', ']']`, `concatOperator: '+'`, `fieldIdentifierSeparator: '.'` |
| `'mysql'`      | `concatOperator: 'CONCAT'`                                                                |
| `'postgresql'` | `quoteFieldNamesWith: '"'`, `numberedParams: true`, `paramPrefix: '$'`                    |

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

The `fallbackExpression` is a string that will be part of the output when `formatQuery` can't quite figure out what to do for a particular rule or group. The intent is to maintain valid syntax while (hopefully) not detrimentally affecting the query criteria. If not provided, the default fallback expression for the given format will be used:

| Format                  | Default `fallbackExpression`  |
| ----------------------- | ----------------------------- |
| `'sql'`                 | `'(1 = 1)'`                   |
| `'parameterized'`       | `'(1 = 1)'`                   |
| `'parameterized_named'` | `'(1 = 1)'`                   |
| `'mongodb'`             | `'{"$and":[{"$expr":true}]}'` |
| `'cel'`                 | `'1 == 1'`                    |
| `'spel'`                | `'1 == 1'`                    |
| `'jsonata'`             | `'(1 = 1)'`                   |
| `'jsonlogic'`           | `false`                       |
| `'elasticsearch'`       | `{}`                          |

### Value sources

When the `valueSource` property for a rule is set to "field", no parameters will be generated.

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

Output:

```json
{
  "sql": "(firstName = lastName and firstName like middleName || '%')",
  "params": {}
}
```

### Placeholder values

Any rule where the `field` or `operator` matches the placeholder value (default `"~"`) will be excluded from the output for most export formats (see [Automatic validation](#automatic-validation)). To use a different string as the placeholder value, set the `placeholderFieldName` and/or `placeholderOperatorName` options. These correspond to the `fields.placeholderName` and `operators.placeholderName` properties on the main component's [`translations` prop](../components/querybuilder#translations) object.

## Validation

The validation options (`validator` and `fields` – see [Validation](./validation) for more information) only affect the output when `format` is not "json" or "json_without_ids". If the `validator` function returns `false`, the `fallbackExpression` will be returned. Otherwise, groups and rules marked as invalid (either by the validation map produced by the `validator` function or the result of the field-based `validator` function) will be ignored.

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

To minimize the chance of invalid syntax, some basic validation will be performed by `formatQuery` for the "in", "notIn", "between", and "notBetween" operators for all formats except "json" and "json_without_ids", even if no validator function or field validators are specified.

- Rules with an `operator` of "in" or "notIn" will be deemed invalid if the rule's `value` is neither an array with at least one element (`value.length > 0`) nor a non-empty string.
- Rules with an `operator` of "between" or "notBetween" will be deemed invalid if the rule's `value` is neither an array with length of at least two (`value.length >= 2`) nor a string with at least one comma that isn't the first or last character (`value.split(',').length >= 2`, and neither element is an empty string).
- Rules where either the `field` or `operator` match their respective placeholder will be deemed invalid (`field === placeholderFieldName || operator === placeholderOperatorName`).
