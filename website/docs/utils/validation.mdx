---
title: Validation
description: Query validation methods and configuration
---

import { DemoLink } from '@site/src/components/DemoLink';

%importmd ../\_ts_admonition.md

Two methods are provided by `react-querybuilder` for validating queries: query-level validation and field-based validation.

## Query-level validation

Validating at the query level can result in the entire query being treated as valid or invalid, or you can report validation results for specific rules/groups within the query based on the `id` property.

To mark an entire query as valid or invalid, return a `boolean` value from the `validator` callback function (`true` for valid, `false` for invalid).

```tsx
import { QueryBuilder, RuleGroupType } from 'react-querybuilder';

/**
 * This function returns false (indicating "invalid") if there are no rules present.
 */
const validator = (q: RuleGroupType) => q.rules.length > 0;

const App = () => {
  return <QueryBuilder validator={validator} />;
};
```

The alternate return value from a query-level validator is a validation map, which is an object where each key represents the `id` of a rule or group. Associated values are either `boolean` (`true` for valid, `false` for invalid) or a validation result. Validation results are objects with two keys: a required `boolean` `valid` key and an optional `reasons` array specifying why that rule/group is valid or invalid. (Reasons are assumed to be strings, but the type is `any[]` since the QueryBuilder default components ignore them. Feel free to use them any way you please in your custom components.)

```tsx
import { QueryBuilder, RuleGroupType, ValidationMap } from 'react-querybuilder';

/**
 * This function returns a validation map. A real validator function would
 * have some logic to determine which rules are valid/invalid and why, but
 * this function is simple for brevity.
 */
const validator: QueryValidator = (q): ValidationMap => ({
  r1: true, // valid rule
  r2: false, // invalid rule
  r3: { valid: true, reasons: ['awesome rule'] }, // valid rule
  r4: { valid: false, reasons: ['lame rule'] }, // invalid rule
});

const query: RuleGroupType = {
  combinator: 'and',
  rules: [
    { id: 'r1', field: 'field1', operator: '=', value: 'Value 1' },
    { id: 'r2', field: 'field2', operator: '=', value: 'Value 2' },
    { id: 'r3', field: 'field3', operator: '=', value: 'Value 3' },
    { id: 'r4', field: 'field4', operator: '=', value: 'Value 4' },
  ],
};

const App = () => {
  return <QueryBuilder query={query} validator={validator} />;
};
```

## Field-based validation

Assigning a `validator` to individual fields allows you to provide a separate callback function depending on the field's value type or other attributes.

In the following configuration, any rule that specifies `field2` as the field (e.g. the second rule) will be marked invalid.

```tsx
import {
  Field,
  QueryBuilder,
  RuleGroupType,
  RuleValidator,
  ValidationResult,
} from 'react-querybuilder';

/**
 * This function returns a validation result.
 */
const validator: RuleValidator = (q): ValidationResult => ({
  valid: false,
  reasons: ['this field is always invalid'],
});

const fields: Field[] = [
  { name: 'field1', label: 'Field 1' },
  { name: 'field2', label: 'Field 2', validator },
  { name: 'field3', label: 'Field 3' },
  { name: 'field4', label: 'Field 4' },
];

const query: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'field1', operator: '=', value: 'Value 1' },
    { field: 'field2', operator: '=', value: 'Value 2' },
    { field: 'field3', operator: '=', value: 'Value 3' },
    { field: 'field4', operator: '=', value: 'Value 4' },
  ],
};

const App = () => {
  return <QueryBuilder query={query} fields={fields} />;
};
```

## Effect on HTML

If you provide a query- or field-level validator function then the wrapper `<div>` for each evaluated query object (rule, group, or the entire query) will be assigned one of two classes: `queryBuilder-valid` or `queryBuilder-invalid`. You can use these classes to style the elements with CSS.

:::tip[See it in action]

In the <DemoLink option="validateQuery" text="demo" />, check the "Use validation" option and create an empty group or a text input without a value. Empty groups will show a message where the rules usually appear (using the `:after` pseudo-selector), and text fields without values will have a [purple](https://meyerweb.com/eric/thoughts/2014/06/19/rebeccapurple/) background.

:::

## Effect on exports

See the [validation section on the Export page](./export#validation) for more information.

## Default validator

You can pass the provided [`defaultValidator`](./misc#defaultvalidator) to the `validator` prop to check for invalid combinators, empty groups, or, if the query is using independent combinators, out-of-sequence `rules` arrays. The [demo](/demo) uses the default validator.
