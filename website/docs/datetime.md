---
title: Date/time features
---

By default, the components and utilities provided by React Query Builder handle dates and times in a very generic, unopinionated way. We recommend storing dates as strings in an ISO 8601-compatible format and taking advantage of built-in date/time functionality like "date" and "datetime-local" input types.

React Query Builder provides the `@react-querybuilder/datetime` package to add enhanced date/time functionality.

## Initialization

A date/time parser/formatter library must be installed in order to use the `@react-querybuilder/datetime` package. Ready-to-use plugins are provided for [Day.js](https://day.js.org/), [date-fns](https://date-fns.org/), and [Luxon](https://moment.github.io/luxon/), but any date/time library can be used.

```ts
import { datetimeRuleProcessorSQL } from '@react-querybuilder/datetime/dayjs';
// Other options:
// import { datetimeRuleProcessorSQL } from '@react-querybuilder/datetime/date-fns';
// import { datetimeRuleProcessorSQL } from '@react-querybuilder/datetime/luxon';
```

## Export

The date/time package provides `formatQuery` rule processors that handle date/time fields in a manner appropriate for the target platform.

### SQL

The `datetimeRuleProcessorSQL` rule processor will produce different output based on the `preset` option, defaulting to "ansi". For example, if `preset` is "postgresql", date values will be prefixed with `date` (e.g. `date'2000-01-01'`), but for "mssql" they will be wrapped in `cast([...] as date)` (e.g. `cast('2000-01-01' as date)`).

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
