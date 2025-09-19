# @react-querybuilder/core

Core non-React utilities for `react-querybuilder` and associated packages - types, query processing, validation, and formatters.

[Full documentation](https://react-querybuilder.js.org/)

## Basic usage

`react-querybuilder` re-exports everything from this package, so you normally won't need to install `@react-querybuilder/core` by itself.

```bash
npm i @react-querybuilder/core
# OR yarn add / pnpm add / bun add
```

### Export

To [export queries](https://react-querybuilder.js.org/docs/utils/export) as a SQL `WHERE` clause, MongoDB query object, or one of several other formats, use `formatQuery`.

```ts
const query = {
  combinator: 'and',
  rules: [
    {
      field: 'first_name',
      operator: 'beginsWith',
      value: 'Stev',
    },
    {
      field: 'last_name',
      operator: 'in',
      value: 'Vai, Vaughan',
    },
  ],
};

formatQuery(query, 'sql');
/*
"(first_name like 'Stev%' and last_name in ('Vai', 'Vaughan'))"
*/
```

### Import

To [import queries](https://react-querybuilder.js.org/docs/utils/import) use `parseSQL`, `parseMongoDB`, `parseJsonLogic`, `parseJSONata`, `parseCEL`, or `parseSpEL` depending on the source.

```ts
// Tip: `parseSQL` will accept either a full `SELECT` statement or a `WHERE` clause by itself.
// Everything but the `WHERE` expressions will be ignored.

const query = parseSQL(
  `SELECT * FROM my_table WHERE first_name LIKE 'Stev%' AND last_name in ('Vai', 'Vaughan')`
);

console.log(query);
/*
{
  "combinator": "and",
  "rules": [
    {
      "field": "first_name",
      "operator": "beginsWith",
      "value": "Stev",
    },
    {
      "field": "last_name",
      "operator": "in",
      "value": "Vai, Vaughan",
    },
  ],
}
*/
```

The `parse*` functions must be imported from a sub-path, like this:

```js
import { parseCEL } from '@react-querybuilder/core/parseCEL';
import { parseJSONata } from '@react-querybuilder/core/parseJSONata';
import { parseJsonLogic } from '@react-querybuilder/core/parseJsonLogic';
import { parseMongoDB } from '@react-querybuilder/core/parseMongoDB';
import { parseSpEL } from '@react-querybuilder/core/parseSpEL';
import { parseSQL } from '@react-querybuilder/core/parseSQL';
```
