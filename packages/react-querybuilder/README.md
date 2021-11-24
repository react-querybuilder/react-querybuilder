# react-querybuilder

[Complete documentation](https://react-querybuilder.js.org)

## Getting Started

```shell
npm install react-querybuilder --save
```

OR

```shell
yarn add react-querybuilder
```

## Demo

[Click here to see a live, interactive demo](https://react-querybuilder.github.io/react-querybuilder/).

To run the demo yourself, go through the following steps:

1. _Clone this repo_
2. `yarn` _Install dependencies_
3. `yarn lerna run start` _Run a local server_
4. _Visit http://localhost:8080 in your browser_

## Basic usage

```tsx
import { useState } from 'react';
import QueryBuilder, { RuleGroupType } from 'react-querybuilder';

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'age', label: 'Age', inputType: 'number' },
  { name: 'address', label: 'Address' },
  { name: 'phone', label: 'Phone' },
  { name: 'email', label: 'Email', validator: ({ value }) => /^[^@]+@[^@]+/.test(value) },
  { name: 'twitter', label: 'Twitter' },
  { name: 'isDev', label: 'Is a Developer?', valueEditorType: 'checkbox', defaultValue: false }
];

export const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({
    combinator: 'and',
    rules: []
  });

  return <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />;
};
```
