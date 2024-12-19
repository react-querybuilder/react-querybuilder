## @react-querybuilder/datetime

Augments [react-querybuilder](https://npmjs.com/package/react-querybuilder) with enhanced date/time functionality.

To see this in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/demo#datetime=true) with the "date/time" option enabled.

**[Full documentation](https://react-querybuilder.js.org/docs/datetime)**

![Screenshot](../../_assets/screenshot.png)

## Installation

```bash
npm i react-querybuilder @react-querybuilder/datetime
# OR yarn add / pnpm add / bun add
```

## Usage

To enable the date and time functionality of a query builder, nest the `QueryBuilder` element under `QueryBuilderDateTime`.

```tsx
import { QueryBuilderDateTime } from '@react-querybuilder/datetime';
import { useState } from 'react';
import { QueryBuilder, RuleGroupType } from 'react-querybuilder';

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <QueryBuilderDateTime>
      <QueryBuilder fields={fields} defaultQuery={query} onQueryChange={setQuery} />
    </QueryBuilderDateTime>
  );
};
```

## Notes
