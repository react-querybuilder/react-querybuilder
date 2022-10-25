# react-querybuilder

_The Query Builder component for React_

![Screenshot](../../_assets/screenshot.png)

## Documentation

Complete documentation is available at [react-querybuilder.js.org](https://react-querybuilder.js.org).

## Demo

[Click here to see a live, interactive demo](https://react-querybuilder.js.org/demo).

To use the official compatibility components as seen in the demo, take a look at the packages under the [`@react-querybuilder` org on npmjs.com](https://www.npmjs.com/org/react-querybuilder). We currently support:

| Library                                | npm                                                                                          | Demo                                                     | Example                                                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [Ant Design](https://ant.design/)      | [@react-querybuilder/antd](https://www.npmjs.com/package/@react-querybuilder/antd)           | [demo](https://react-querybuilder.js.org/demo/antd)      | [example](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/antd)      |
| [Bootstrap](https://getbootstrap.com/) | [@react-querybuilder/bootstrap](https://www.npmjs.com/package/@react-querybuilder/bootstrap) | [demo](https://react-querybuilder.js.org/demo/bootstrap) | [example](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/bootstrap) |
| [Bulma](https://bulma.io/)             | [@react-querybuilder/bulma](https://www.npmjs.com/package/@react-querybuilder/bulma)         | [demo](https://react-querybuilder.js.org/demo/bulma)     | [example](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/bulma)     |
| [Chakra UI](https://chakra-ui.com/)    | [@react-querybuilder/chakra](https://www.npmjs.com/package/@react-querybuilder/chakra)       | [demo](https://react-querybuilder.js.org/demo/chakra)    | [example](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/chakra)    |
| [MUI](https://mui.com/)                | [@react-querybuilder/material](https://www.npmjs.com/package/@react-querybuilder/material)   | [demo](https://react-querybuilder.js.org/demo/material)  | [example](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/material)  |

## Basic usage

```shell
npm install react-querybuilder --save
# OR
yarn add react-querybuilder
```

```tsx
import { useState } from 'react';
import { QueryBuilder, RuleGroupType } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'age', label: 'Age', inputType: 'number' },
  { name: 'address', label: 'Address' },
  { name: 'phone', label: 'Phone' },
  { name: 'email', label: 'Email', validator: ({ value }) => /^[^@]+@[^@]+/.test(value) },
  { name: 'twitter', label: 'Twitter' },
  { name: 'isDev', label: 'Is a Developer?', valueEditorType: 'checkbox', defaultValue: false },
];

const initialQuery: RuleGroupType = {
  combinator: 'and',
  rules: [],
};

export const App = () => {
  const [query, setQuery] = useState(initialQuery);

  return <QueryBuilder fields={fields} query={query} onQueryChange={q => setQuery(q)} />;
};
```

To enable drag-and-drop functionality, install the [`@react-querybuilder/dnd` package](https://www.npmjs.com/package/@react-querybuilder/) and nest `<QueryBuilder />` under `<QueryBuilderDnD />`.

## Export

To [export queries](https://react-querybuilder.js.org/docs/api/export) as SQL, MongoDB, or one of several other formats, use the `formatQuery` function.

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
const sqlWhere = formatQuery(query, 'sql');
console.log(sqlWhere);
/*
`(first_name like 'Stev%' and last_name in ('Vai', 'Vaughan'))`
*/
```

## Import

To [import queries](https://react-querybuilder.js.org/docs/api/import) use `parseSQL`, `parseCEL`, `parseJsonLogic`, or `parseMongoDB` depending on the source.

**Tip:** `parseSQL` will accept a full `SELECT` statement or the `WHERE` clause by itself. Trailing semicolon is optional.

```ts
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

Note: `formatQuery` and the `parse*` functions can be used without importing React (e.g., on the server) like this:

```js
import { formatQuery } from 'react-querybuilder/dist/formatQuery';
import { parseCEL } from 'react-querybuilder/dist/parseCEL';
import { parseJsonLogic } from 'react-querybuilder/dist/parseJsonLogic';
import { parseMongoDB } from 'react-querybuilder/dist/parseMongoDB';
import { parseSQL } from 'react-querybuilder/dist/parseSQL';
```
