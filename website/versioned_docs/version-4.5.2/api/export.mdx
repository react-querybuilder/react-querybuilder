---
title: Export
description: Convert query builder objects to SQL, etc.
---

import TypeScriptAdmonition from './_ts_admonition.md';

<TypeScriptAdmonition />

Use the `formatQuery` function to export queries in various formats. The function signature is:

```ts
function formatQuery(
  query: RuleGroupTypeAny,
  options?: ExportFormat | FormatQueryOptions
): string | ParameterizedSQL | ParameterizedNamedSQL | RQBJsonLogic;
```

`formatQuery` converts a given query into one of the following formats:

- JSON (with or without `id`s)
- SQL `WHERE` clause
- Parameterized SQL (with anonymous or named parameters)
- MongoDB
- Common Expression Language (CEL)
- Spring Expression Language (SpEL)
- JsonLogic

For the next few sections, assume the `query` variable has been defined as:

```ts
const query: RuleGroupType = {
  id: 'root',
  combinator: 'and',
  not: false,
  rules: [
    {
      id: 'rule1',
      field: 'firstName',
      value: 'Steve',
      operator: '=',
    },
    {
      id: 'rule2',
      field: 'lastName',
      value: 'Vai',
      operator: '=',
    },
  ],
};
```

:::tip

_<abbr title="Too long; didn't read">TL;DR</abbr>: For best results, use the [default combinators and operators](./misc#defaults) or map custom combinators/operators to the defaults with [`transformQuery`](./misc#transformquery)._

While `formatQuery` technically accepts query objects of type `RuleGroupTypeAny` (i.e. `RuleGroupType` or `RuleGroupTypeIC`), it is not guaranteed to process a query correctly unless the query also conforms to the type `DefaultRuleGroupTypeAny` (i.e. `DefaultRuleGroupType` or `DefaultRuleGroupTypeIC`).

In practice, this means that all `combinator` and `operator` properties in the query must match the `name` of an element in [`defaultCombinators` or `defaultOperators`](./misc#defaults), respectively. If you implement custom combinator/operator names, you can use the [`transformQuery` function](./misc#transformquery) to map your query properties to the defaults.

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
// {
//   "combinator": "and",
//   "rules": [
//     {
//       "field": "someNumber",
//       "operator": "between",
//       "value": "12,14"
//     }
//   ]
// }
```

The `newQuery` object would be ready for processing by `formatQuery`, including its special handling of the "between" operator.

:::

## Basic usage

### JSON

To export the internal query representation like what `react-querybuilder` passes to the `onQueryChange` callback, formatted by `JSON.stringify`, simply pass the query to `formatQuery`:

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

To export the internal query representation without formatting (single-line, no indentation) and without the `id` or `path` attributes on each object, use the "json_without_ids" format. This is useful if you need to serialize the query for storage.

```ts
formatQuery(query, 'json_without_ids');
```

Output:

```ts
`{"combinator":"and","not":false,"rules":[{"field":"firstName","value":"Steve","operator":"="},{"field":"lastName","value":"Vai","operator":"="}]}`;
```

### SQL

`formatQuery` can export SQL compatible with most RDBMS engines. To export a SQL `WHERE` clause, use the "sql" format.

```ts
formatQuery(query, 'sql');
```

Output:

```ts
`(firstName = 'Steve' and lastName = 'Vai')`;
```

### Parameterized SQL

To export a SQL `WHERE` clause with bind variables instead of explicit values, use the "parameterized" format. The output is an object with `sql` and `params` attributes.

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

### Named parameters

If anonymous parameters (aka bind variables) are not acceptable, `formatQuery` can output named parameters based on the field names. Use the "parameterized_named" format. The output object is similar to the "parameterized" format, but the `params` attribute is an object instead of an array.

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

### MongoDB

For MongoDB-compatible output, use the "mongodb" format.

```ts
formatQuery(query, 'mongodb');
```

Output:

```ts
`{"$and":[{"firstName":{"$eq":"Steve"}},{"lastName":{"$eq":"Vai"}}]}`;
```

:::info

The MongoDB export format does not support the inversion operator (setting `not: true` for a rule group), however rules _can_ be created using the `"!="` operator.

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

The "jsonlogic" format produces an object that can be processed by the `jsonLogic.apply` function (see https://jsonlogic.com/).

```ts
formatQuery(query, 'jsonlogic');
```

Output:

```json
{ "and": [{ "==": [{ "var": "firstName" }, "Steve"] }, { "==": [{ "var": "lastName" }, "Vai"] }] }
```

## Configuration

An object can be passed as the second argument instead of a string to have more fine-grained control over the output.

### Parse numbers

Since HTML `<input>` controls store values as strings (even when `type="number"`), exporting a query to various formats may produce a string representation of a value when a true numeric value is required or more appropriate. Set the `parseNumbers` option to `true` and `formatQuery` will attempt to convert all values to numbers, falling back to the original value if `parseFloat(value)` returns `NaN` (not a number).

```ts
const query: RuleGroupType = {
  combinator: 'and',
  not: false,
  rules: [
    {
      field: 'digits',
      operator: '=',
      value: '20',
    },
    {
      field: 'age',
      operator: 'between',
      value: '26, 52',
    },
    {
      field: 'lastName',
      operator: '=',
      value: 'Vai',
    },
  ],
};

// Default configuration - all values are strings:
formatQuery(query, { format: 'sql' });
// Returns: "(digits = '20' and age between '26' and '52' and lastName = 'Vai')"

// `parseNumbers: true` - numeric strings converted to actual numbers:
formatQuery(query, { format: 'sql', parseNumbers: true });
// Returns: "(digits = 20 and age between 26 and 52 and lastName = 'Vai')"
```

:::info

To avoid information loss, this option is more strict about what qualifies as "numeric" than [the standard `parseFloat` function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseFloat). To oversimplify a bit, `parseFloat` works with any string that _starts_ with a numeric sequence, ignoring the rest of the string beginning with the first non-numeric character. In contrast, when `parseNumbers` is `true`, `formatQuery` will only convert a `value` to a `number` if it appears to be numeric _in its entirety_ (after trimming whitespace).

The following expressions all evaluate to `true`:

```ts
parseFloat('000111abcdef') === 111; // everything from the 'a' on is ignored by `parseFloat`

formatQuery(
  { rules: [{ field: 'f', operator: '=', value: '000111abcdef' }] },
  { format: 'sql', parseNumbers: true }
) === "(f = '000111abcdef')"; // `value` contains non-numeric characters, so remains as-is

formatQuery(
  { rules: [{ field: 'f', operator: '=', value: '  000111  ' }] },
  { format: 'sql', parseNumbers: true }
) === '(f = 111)'; // after trimming whitespace, `value` is wholly numeric
```

:::

### Value processor

If you need to control the way the value portion of the output is processed, you can specify a custom `valueProcessor` (only applicable for certain formats).

```ts
const query: RuleGroupType = {
  combinator: 'and',
  not: false,
  rules: [
    {
      field: 'instrument',
      operator: 'in',
      value: ['Guitar', 'Vocals'],
    },
    {
      field: 'lastName',
      operator: '=',
      value: 'Vai',
    },
  ],
};

const customValueProcessor = (field, operator, value) => {
  if (operator === 'in') {
    // Assuming `value` is an array, such as from a multi-select
    return `(${value.map(v => `"${v.trim()}"`).join(', ')})`;
  }
  // Fall back to the default value processor for other operators
  return defaultValueProcessor(field, operator, value);
};

formatQuery(query, { format: 'sql', valueProcessor: customValueProcessor });
// Returns: "(instrument in ('Guitar', 'Vocals') and lastName = 'Vai')"
```

:::caution

When using the "mongodb", "cel", or "spel" export formats, `valueProcessor` functions must produce the entire MongoDB rule object or CEL/SpEL rule string, not just the expression on the right-hand side of the operator like with SQL-based formats.

:::

#### Enhanced `valueProcessor` behavior

`formatQuery` will invoke custom `valueProcessor` functions with different arguments based on the function's `length` property, which is the number of arguments a function accepts excluding those with default values.

If the `valueProcessor` function accepts fewer than three (3) arguments, it will be called like this:

```ts
valueProcessor(rule, { parseNumbers });
```

The first argument is the `RuleType` object directly from the query. The second argument is of type `ValueProcessorOptions`, which is equivalent to `Pick<FormatQueryOptions, "parseNumbers">`).

Invoking `valueProcessor` with the full `RuleType` object provides access to much more information about each rule. Standard properties that were previously unavailable include `path`, `id`, and `disabled`, but any custom properties will also be accessible.

The default value processors have not changed from the legacy function signature, but alternate functions using the new `fn(rule, options)` signature are now available:

- `defaultValueProcessorByRule` (for SQL-based formats)
- `defaultValueProcessorCELByRule`
- `defaultValueProcessorMongoDBByRule`
- `defaultValueProcessorSpELByRule`

To maintain the legacy signature (`valueProcessor(field, operator, value, valueSource)`), make sure your custom `valueProcessor` function accepts at least three arguments _with no default values_ (i.e. do not use `=` for the first three arguments). For example, the following code will log `length: 1` and the function would be called with the `(rule, options)` arguments:

```ts
const valueProcessor = (field: string, operator = '=', value = '') => '...';
console.log(`length: ${valueProcessor.length}`);
```

Removing `= ...` from the `operator` and `value` argument declarations would increase the function's `length` to 3.

If you use TypeScript, these conditions will be enforced automatically.

### Quote field names

Some database engines wrap field names in backticks (`` ` ``). This can be configured with the `quoteFieldNamesWith` option.

```ts
formatQuery(query, { format: 'sql', quoteFieldNamesWith: '`' });
// Returns: "(`firstName` = 'Steve' and `lastName` = 'Vai')"
```

### Parameter prefix

If the "parameterized_named" format is used, configure the parameter prefix used in the `sql` string with the `paramPrefix` option (should the default ":" be inappropriate).

```ts
const p = formatQuery(query, {
  format: 'parameterized_named',
  paramPrefix: '$',
});
// p.sql === "(firstName = $firstName_1 and lastName = $lastName_1)"
```

### Fallback expression

The `fallbackExpression` is a string that will be part of the output when `formatQuery` can't quite figure out what to do for a particular rule or group. The intent is to maintain valid syntax while (hopefully) not detrimentally affecting the query criteria. If not provided, the default fallback expression for the given format will be used (see table below).

| Format                | Default `fallbackExpression` |
| --------------------- | ---------------------------- |
| "sql"                 | `"(1 = 1)"`                  |
| "parameterized"       | `"(1 = 1)"`                  |
| "parameterized_named" | `"(1 = 1)"`                  |
| "mongodb"             | `"{$and:[{$expr:true}]}"`    |
| "cel"                 | `"1 == 1"`                   |
| "spel"                | `"1 == 1"`                   |
| "jsonlogic"           | `false`                      |

### Value sources

When the `valueSource` property for a rule is set to "field", `formatQuery` will place the bare, unquoted value (which should be a valid field name) in the result for the "sql", "parameterized", "parameterized_named", "mongodb", "cel", and "spel" formats. No parameters will be generated for such rules.

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

Any rule where the `field` or `operator` matches the placeholder value (default `"~"`) will be excluded from the output for most export formats (see [Automatic validation](#automatic-validation)). To use a different string as the placeholder value, set the `placeholderFieldName` and/or `placeholderOperatorName` options. These correspond to the `fields.placeholderName` and `operators.placeholderName` properties on the main component's [`translations` prop](./querybuilder#translations) object.

## Validation

The validation options (`validator` and `fields` – see [Validation](./validation) for more information) only affect the output when `format` is not "json" or "json_without_ids". If the `validator` function returns `false`, the `fallbackExpression` will be returned. Otherwise, groups and rules marked as invalid (either by the validation map produced by the `validator` function or the result of the field-based `validator` function) will be ignored.

Example:

```ts
const query: RuleGroupType = {
  id: 'root',
  rules: [
    {
      id: 'r1',
      field: 'firstName',
      value: '',
      operator: '=',
    },
    {
      id: 'r2',
      field: 'lastName',
      value: 'Vai',
      operator: '=',
    },
  ],
  combinator: 'and',
  not: false,
};

// Query is invalid based on the validator function
formatQuery(query, {
  format: 'sql',
  validator: () => false,
});
// Returns: "(1 = 1)" <-- see `fallbackExpression` option

// Rule "r1" is invalid based on the validation map
formatQuery(query, {
  format: 'sql',
  validator: () => ({ r1: false }),
});
// Returns: "(lastName = 'Vai')" <-- skipped `firstName` rule with `id === 'r1'`

// Rule "r1" is invalid based on the field validator for `firstName`
formatQuery(query, {
  format: 'sql',
  fields: [{ name: 'firstName', validator: () => false }],
});
// Returns: "(lastName = 'Vai')" <-- skipped `firstName` rule because field validator returned `false`
```

### Automatic validation

A basic form of validation will be used by `formatQuery` for the "in", "notIn", "between", and "notBetween" operators when the output format is not "json" or "json_without_ids". This validation is used regardless of the presence of any `validator` options at either the query level or field level:

- Rules that specify an "in" or "notIn" `operator` will be deemed invalid if the rule's `value` is neither an array with at least one element (i.e. `value.length > 0`) nor a non-empty string.
- Rules that specify a "between" or "notBetween" `operator` will be deemed invalid if the rule's `value` is neither an array with length of at least two (`value.length >= 2`) nor a string with at least one comma that isn't the first or last character (i.e. `value.split(',').length >= 2`, and neither element is an empty string).
- Rules where either the `field` or `operator` match their respective placeholder will be deemed invalid (`field === placeholderFieldName || operator === placeholderOperatorName`).
