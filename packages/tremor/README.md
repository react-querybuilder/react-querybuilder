## @react-querybuilder/tremor

Official [react-querybuilder](https://npmjs.com/package/react-querybuilder) components for [Tremor](https://www.tremor.so/).

To see them in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/demo/tremor) or [load the example in CodeSandbox](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/tremor).

**[Full documentation](https://react-querybuilder.js.org/)**

## Installation

```bash
npm i react-querybuilder @react-querybuilder/tremor @tremor/react
# OR yarn add / pnpm add / bun add
```

## Usage

To render Tremor-compatible components in the query builder, wrap the `<QueryBuilder />` element in `<QueryBuilderTremor />`.

```tsx
import { QueryBuilderTremor } from '@react-querybuilder/tremor';
import { QueryBuilder, RuleGroupType } from 'react-querybuilder';

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <QueryBuilderTremor>
      <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
    </QueryBuilderTremor>
  );
};
```

## Notes

- This package exports `tremorControlElements` which can be assigned directly to the `controlElements` prop on `<QueryBuilder />` (and also exports each component individually), but wrapping `<QueryBuilder />` in `<QueryBuilderTremor />` is the recommended method.
