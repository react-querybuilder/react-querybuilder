---
title: Date/time features
---

By default, the components and utilities provided by React Query Builder handle dates and times in a very generic, unopinionated way. We recommend storing dates as strings in an ISO 8601-compatible format and taking advantage of built-in date/time functionality like "date" and "datetime-local" inputs (see [`inputType`](./components/querybuilder#getinputtype)).

The `@react-querybuilder/datetime` package augments React Query Builder with enhanced date/time functionality.

## Initialization

A date/time processor library with parsing and formatting capability must be used in conjunction with `@react-querybuilder/datetime`. Ready-to-use plugins are provided for [Day.js](https://day.js.org/), [date-fns](https://date-fns.org/), and [Luxon](https://moment.github.io/luxon/). Other third-party or custom date/time libraries can be used (see [below](#custom-plugins)).

> _A plugin using only native JavaScript `Date` and `String` functionality is available, but we don't recommended it except as a last resort since it has limited formatting capability (full ISO strings in UTC only) and has not passed rigorous testing like the popular libraries._

The documentation below assumes the use of the Day.js plugin. To use one of the others, replace `@react-querybuilder/datetime/dayjs` with `@react-querybuilder/datetime/date-fns` or `@react-querybuilder/datetime/luxon`.

## Export

```ts
import { datetimeRuleProcessorSQL } from '@react-querybuilder/datetime/dayjs';
// Other options:
// import { datetimeRuleProcessorSQL } from '@react-querybuilder/datetime/date-fns';
// import { datetimeRuleProcessorSQL } from '@react-querybuilder/datetime/luxon';
```

The date/time package provides `formatQuery` rule processors that handle date/time fields in a manner appropriate for the target platform.

### Conditional use

By default, the date/time rule processors will only treat a rule value as a date (or series of dates) if the `field` configuration has a `datatype` property starting with "date", "datetime", "datetimeoffset", or "timestamp" (using the `defaultIsDateField` function). Otherwise rule processing will be passed off to the default rule processor for that export format.

You can customize the algorithm by passing a `context.isDateField` configuration in the `formatQuery` options. `isDateField` can be a `boolean`, a function that returns a `boolean`, an object matching `field` properties, or an array of objects matching `field` properties.

- As a `boolean`, `true` will cause the rule value to be treated as a date, and `false` will fall back to the default rule processor.
- As a `function`, the function will be passed the rule object and the options object (the same two arguments as the rule processor). The function should return a `boolean` that indicates whether the rule value should be treated as a date.
- As an object, fields that match _all_ the properties of the object will be treated as dates.
- As an array of objects, fields that match all properties of _at least one_ of the objects in the array will be treated as dates.

In the example below, the value in the "birthDate" rule matches the regular expression in the `isDateField` function, so the corresponding SQL output has the `date` keyword prepended to the value string (per the "postgresql" preset). The "mathNotDate" rule value does _not_ match the pattern and is therefore processed by the default SQL rule processor.

```ts
// Returns true if the value appears to be an ISO date-only string (YYYY-MM-DD)
const isDateField = (rule, opts) => /^\d\d\d\d-\d\d-\d\d$/.test(rule.value);

const query: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'birthDate', operator: '<', value: '1950-01-01' },
    { field: 'mathNotDate', operator: '=', value: '1950-1-1' },
  ],
};

formatQuery(query, {
  preset: 'postgresql',
  ruleProcessor: datetimeRuleProcessorSQL,
  context: { isDateField },
});
// `(birthDate < date'1950-01-01' and mathNotDate = '1950-1-1')`
```

In the next example, `isDateField` is an array of objects. If the field object (`options.fieldData`) matches all properties of any element in the array, the field will be treated as a date. Note that this method depends on the `fields` array being passed in the `formatQuery` options.

```ts
// Triggers date processing if the field has `datatype: "date"` _or_ `inputType: "datetime-local"`
const isDateField = [{ datatype: 'date' }, { inputType: 'datetime-local' }];

const fields: Field[] = [
  { name: 'birthDate', label: 'Birth Date', datatype: 'date' },
  { name: 'mathNotDate', label: 'Math, Not Date', datatype: 'number' },
];

const query: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'birthDate', operator: '<', value: '1950-01-01' },
    { field: 'mathNotDate', operator: '=', value: '1950-1-1' },
  ],
};

formatQuery(query, {
  preset: 'postgresql',
  fields,
  ruleProcessor: datetimeRuleProcessorSQL,
  context: { isDateField },
});
// `(birthDate < date'1950-01-01' and mathNotDate = '1950-1-1')`
```

### SQL

The `datetimeRuleProcessorSQL` rule processor will produce different output based on the `preset` option, which defaults to "ansi". For example, if `preset` is "postgresql", date values will be prefixed with `date` (e.g. `date'2000-01-01'`), but for "mssql" they will be wrapped in `cast([...] as date)` (e.g. `cast('2000-01-01' as date)`).

### MongoDB

Since the `datetimeRuleProcessorMongoDBQuery` rule processor handles real date/time values (as `Date` objects), it should be used in conjunction with the "mongodb_query" format and not "mongodb".

```ts
import { datetimeRuleProcessorMongoDBQuery } from '@react-querybuilder/datetime/dayjs';

const mongodbQuery = formatQuery(query, {
  format: 'mongodb_query',
  ruleProcessor: datetimeRuleProcessorMongoDBQuery,
});
```

### JsonLogic

The `datetimeRuleProcessorJsonLogic` rule processor produces custom JsonLogic operations to indicate that rules should be handled as date/time values. As with [`jsonLogicAdditionalOperators`](./utils/export#jsonlogic) from the `react-querybuilder` package, the date/time package provides an easy way to add support for its custom operations with the `jsonLogicDateTimeOperations` object.

```ts
import { add_operation, apply } from 'json-logic-js';
import { jsonLogicDateTimeOperations } from '@react-querybuilder/datetime/dayjs';

for (const [op, func] of Object.entries(jsonLogicDateTimeOperations)) {
  add_operation(op, func);
}

const jsonLogic = formatQuery(query, {
  format: 'jsonlogic',
  ruleProcessor: datetimeRuleProcessorJsonLogic,
});

const results = data.filter(d => apply(jsonLogic, d));
```

### Common Expression Language (CEL)

```ts
import { datetimeRuleProcessorCEL } from '@react-querybuilder/datetime/dayjs';

const cel = formatQuery(query, { format: 'cel', ruleProcessor: datetimeRuleProcessorCEL });
```

### JSONata

```ts
import { datetimeRuleProcessorJSONata } from '@react-querybuilder/datetime/dayjs';

const jsonata = formatQuery(query, {
  format: 'jsonata',
  ruleProcessor: datetimeRuleProcessorJSONata,
});
```

### Natural language

The `datetimeRuleProcessorNL` will format date/time values using `Intl.DateTimeFormat`. By default, the formatter will be instantiated as follows:

```ts
// For date-only values, e.g. "1969-01-01":
new Intl.DateTimeFormat(undefined, { dateStyle: 'full' });

// For date+time values, e.g. "1969-01-01T12:14:26.052Z":
new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'long' });
```

To customize the output, use the `context` option. The `locales` property will be passed as the first argument to the `Intl.DateTimeFormat` constructor, and either `dateFormat` or `dateTimeFormat`&mdash;depending on the rule&mdash;will be passed as the second argument.

```ts
import { datetimeRuleProcessorNL } from '@react-querybuilder/datetime/dayjs';

const nl = formatQuery(query, {
  format: 'natural_language',
  ruleProcessor: datetimeRuleProcessorNL,
  context: {
    locales: 'en-GB',
    dateFormat: { dateStyle: 'full' },
    dateTimeFormat: { dateStyle: 'full', timeStyle: 'long' },
  },
});
```

<!--
## Value editor

Augments [`ValueEditor`](./components/valueeditor) with date/time functionality.
-->

## Custom plugins

If the official date/time processor plugins do not meet your requirements, you can provide a custom plugin that conforms to the `RQBDateTimeLibraryAPI` interface:

```ts
type DateOrString = string | Date;

interface RQBDateTimeLibraryAPI {
  /** Format a `Date` or ISO 8601 string with format `fmt` */
  format: (d: DateOrString, fmt: string) => string;
  /** `a` is after `b`. */
  isAfter: (a: DateOrString, b: DateOrString) => boolean;
  /** `a` is before `b`. */
  isBefore: (a: DateOrString, b: DateOrString) => boolean;
  /**
   * `a` evaluates to the same timestamp as `b`. If either `a` or `b` is an
   * ISO date-only string, they are the same date (time component is ignored).
   */
  isSame: (a: DateOrString, b: DateOrString) => boolean;
  /** `d` is, or evaluates to, a valid `Date` object */
  isValid: (d: DateOrString) => boolean;
  /** Convert a string to a `Date` object (returns a `Date` unchanged) */
  toDate: (d: DateOrString) => Date;
  /** 'YYYY-MM-DDTHH:mm:ss.SSSZ' format */
  toISOString: (d: DateOrString) => string;
  /** Format `Date` or ISO 8601 string in ISO date-only format ('YYYY-MM-DD') */
  toISOStringDateOnly: (d: DateOrString) => string;
}
```

Most exports from the date/time library have a corresponding `get*` method that accepts a processor plugin and returns a method or component ready to use in the typical fashion within React Query Builder. For example, to generate a rule processor for `formatQuery` that uses a custom date/time plugin `myDateTimeLibraryAPI`, pass it to the `getDatetimeRuleProcessorSQL` function like this:

```ts
const mySQLRuleProcessor = getDatetimeRuleProcessorSQL(myDateTimeLibraryAPI);

const sql = formatQuery(query, { format: 'sql', ruleProcessor: mySQLRuleProcessor });
```
