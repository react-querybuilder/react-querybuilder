# react-querybuilder

_The Query Builder component for React_

![Screenshot](../../_assets/screenshot.png)

## Documentation

Complete documentation is available at [react-querybuilder.js.org](https://react-querybuilder.js.org).

## Demo

[Click here to see a live, interactive demo](https://react-querybuilder.js.org/react-querybuilder/).

<detail>
<summary>To run the demo locally:</summary>

1. _Clone this repo_
2. `yarn` _Install dependencies_
3. `yarn demo` _Run a local server_
4. _Visit http://localhost:8080 in your browser_

</detail>

To use the official compatibility components as seen in the demo (select options from the Style dropdown), take a look at the packages under the [`@react-querybuilder` org on npmjs.com](https://www.npmjs.com/org/react-querybuilder). We currently support:

- [Ant Design](https://ant.design/) ([@react-querybuilder/antd](https://www.npmjs.com/package/@react-querybuilder/antd) - [demo](https://react-querybuilder.js.org/react-querybuilder/#style=antd), [usage](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/antd))
- [Bootstrap](https://getbootstrap.com/) ([@react-querybuilder/bootstrap](https://www.npmjs.com/package/@react-querybuilder/bootstrap) - [demo](https://react-querybuilder.js.org/react-querybuilder/#style=bootstrap), [usage](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/bootstrap))
- [Bulma](https://bulma.io/) ([@react-querybuilder/bulma](https://www.npmjs.com/package/@react-querybuilder/bulma) - [demo](https://react-querybuilder.js.org/react-querybuilder/#style=bulma), [usage](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/bulma))
- [Chakra UI](https://chakra-ui.com/) ([@react-querybuilder/chakra](https://www.npmjs.com/package/@react-querybuilder/chakra) - [demo](https://react-querybuilder.js.org/react-querybuilder/#style=chakra), [usage](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/chakra))
- [MUI](https://mui.com/) ([@react-querybuilder/material](https://www.npmjs.com/package/@react-querybuilder/material) - [demo](https://react-querybuilder.js.org/react-querybuilder/#style=material), [usage](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/material))

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

export const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({
    combinator: 'and',
    rules: [],
  });

  return <QueryBuilder fields={fields} query={query} onQueryChange={q => setQuery(q)} />;
};
```

## Export/import

To export queries as SQL, MongoDB, or [other formats](https://react-querybuilder.js.org/docs/api/export), use the `formatQuery` function.

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

To [import queries from SQL](https://react-querybuilder.js.org/docs/api/import), use `parseSQL`. You can pass a full `SELECT` statement or the `WHERE` clause by itself.

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

Note: `formatQuery` and `parseSQL` can be used without importing React (for example, on the server) like this:

```js
import { formatQuery } from 'react-querybuilder/dist/formatQuery';
import { parseSQL } from 'react-querybuilder/dist/parseSQL';
```
