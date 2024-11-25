---
title: Date/time features
---

By default, the components and utilities provided by React Query Builder handle dates and times in a very generic, unopinionated way. We recommend storing dates as strings in an ISO 8601-compatible format and taking advantage of built-in date/time functionality like "date" and "datetime-local" inputs.

The `@react-querybuilder/datetime` package adds enhanced date/time functionality to various features of React Query Builder.

## Initialization

A date/time processor library with parsing and formatting capability must be used in conjunction with `@react-querybuilder/datetime`. Ready-to-use plugins are provided for [Day.js](https://day.js.org/), [date-fns](https://date-fns.org/), and [Luxon](https://moment.github.io/luxon/), but any third-party or custom date/time library can be used.

A plugin using only native JavaScript `Date` and `String` functionality is available, but we don't recommended it except as a last resort since it has not gone through the rigorous testing that the popular libraries have.

The documentation below assumes the use of the Day.js plugin. To use one of the others, replace `@react-querybuilder/datetime/dayjs` with `@react-querybuilder/datetime/date-fns` or `@react-querybuilder/datetime/luxon`. Information on creating and using custom plugins is [below](#custom-plugins).

## Export

```ts
import { datetimeRuleProcessorSQL } from '@react-querybuilder/datetime/dayjs';
// Other options:
// import { datetimeRuleProcessorSQL } from '@react-querybuilder/datetime/date-fns';
// import { datetimeRuleProcessorSQL } from '@react-querybuilder/datetime/luxon';
```

The date/time package provides `formatQuery` rule processors that handle date/time fields in a manner appropriate for the target platform.

### SQL

The `datetimeRuleProcessorSQL` rule processor will produce different output based on the `preset` option, defaulting to "ansi". For example, if `preset` is "postgresql", date values will be prefixed with `date` (e.g. `date'2000-01-01'`), but for "mssql" they will be wrapped in `cast([...] as date)` (e.g. `cast('2000-01-01' as date)`).

### MongoDB

The `datetimeRuleProcessorMongoDBQuery` rule processor should be used in conjunction with the "mongodb_query" format.

### JsonLogic

The `datetimeRuleProcessorJsonLogic` rule processor produces custom JsonLogic operations to indicate that rules should be handled as date/time values. As with [`jsonLogicAdditionalOperators`](./utils/export#jsonlogic) from the `react-querybuilder` package, the date/time package provides an easy way to add support for its custom operations with the `jsonLogicDateTimeOperations` object.

```ts
import { add_operation, apply } from 'json-logic-js';
import { jsonLogicDateTimeOperations } from '@react-querybuilder/datetime/dayjs';

for (const [op, func] of Object.entries(jsonLogicDateTimeOperations)) {
  add_operation(op, func);
}
```

## Value editor

Augments [`ValueEditor`](./components/valueeditor) with date/time functionality.

## Custom plugins

If the official date/time processor plugins do not meet your requirements, you can provide a custom plugin that conforms to the `RQBDateTimeLibraryAPI` interface:

```ts
type DateOrString = string | Date;

interface RQBDateTimeLibraryAPI {
  /** Format a Date or ISO 8601 string with format `fmt` */
  format: (d: DateOrString, fmt: string) => string;
  /** `a` is after `b`. */
  isAfter: (a: DateOrString, b: DateOrString) => boolean;
  /** `a` is before `b`. */
  isBefore: (a: DateOrString, b: DateOrString) => boolean;
  /**
   * `a` evaluates to the same timestamp as `b`. If `a` or `b` are an
   * ISO date-only string, they are the same date (no time component).
   */
  isSame: (a: DateOrString, b: DateOrString) => boolean;
  /** `d` is, or evaluates to, a valid Date object */
  isValid: (d: DateOrString) => boolean;
  /** Convert a string to a Date object (return Dates unchanged) */
  toDate: (d: DateOrString) => Date;
  /** 'YYYY-MM-DDTHH:mm:ss.SSSZ' format */
  toISOString: (d: DateOrString) => string;
  /** Format Date or ISO 8601 string in ISO date-only format ('YYYY-MM-DD') */
  toISOStringDayOnly: (d: DateOrString) => string;
}
```

Most exports from the date/time library have a corresponding `get*` method that accepts a processor plugin and returns a method or component ready to use in the typical fashion within React Query Builder. For example:

```ts
const mySQLRuleProcessor = getDatetimeRuleProcessorSQL(myDateTimeLibraryAPI);

const sql = formatQuery(query, { format: 'sql', ruleProcessor: mySQLRuleProcessor });
```
