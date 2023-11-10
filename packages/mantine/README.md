## @react-querybuilder/mantine

Official [react-querybuilder](https://npmjs.com/package/react-querybuilder) components for [Mantine](https://mantine.dev/).

To see them in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/demo/mantine) or [load the example in CodeSandbox](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/mantine).

**[Full documentation](https://react-querybuilder.js.org/)**

## Installation

```bash
npm i react-querybuilder @react-querybuilder/mantine @mantine/core @mantine/hooks
# OR yarn add / pnpm add / bun add
```

## Usage

To render Mantine-compatible components in the query builder, wrap the `<QueryBuilder />` element in `<QueryBuilderMantine />`.

```tsx
import { QueryBuilderMantine } from '@react-querybuilder/mantine';
import { QueryBuilder, RuleGroupType } from 'react-querybuilder';

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <QueryBuilderMantine>
      <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
    </QueryBuilderMantine>
  );
};
```

## Notes

- This package exports `mantineControlElements` which can be assigned directly to the `controlElements` prop on `<QueryBuilder />` (and also exports each component individually), but wrapping `<QueryBuilder />` in `<QueryBuilderMantine />` is the recommended method.
