## @react-querybuilder/prime

Official [react-querybuilder](https://npmjs.com/package/react-querybuilder) compatibility package for [PrimeReact](https://primereact.org/).

- [Full documentation](https://react-querybuilder.js.org/)

## Installation

```bash
npm i react-querybuilder @react-querybuilder/prime primereact primeicons
# OR yarn add / pnpm add / bun add
```

## Usage

To configure the query builder to use PrimeReact-compatible components, place `QueryBuilderPrime` above `QueryBuilder` in the component hierarchy.

```tsx
import { QueryBuilderPrime } from '@react-querybuilder/prime';
import { useState } from 'react';
import { type Field, QueryBuilder, type RuleGroupType } from 'react-querybuilder';
import 'primeicons/primeicons.css';

const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

export function App() {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <QueryBuilderPrime>
      <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
    </QueryBuilderPrime>
  );
}
```
