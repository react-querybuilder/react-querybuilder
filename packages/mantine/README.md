## @react-querybuilder/mantine

Official [react-querybuilder](https://npmjs.com/package/react-querybuilder) compatibility package for [Mantine](https://mantine.dev/).

- [Demo](https://react-querybuilder.js.org/demo/mantine)
- [Full documentation](https://react-querybuilder.js.org/)
- [CodeSandbox](https://react-querybuilder.js.org/sandbox?t=mantine) / [StackBlitz](https://react-querybuilder.js.org/sandbox?p=stackblitz&t=mantine) example projects

## Installation

```bash
npm i react-querybuilder @react-querybuilder/mantine @mantine/core @mantine/dates @mantine/hooks
# OR yarn add / pnpm add / bun add
```

## Usage

To configure the query builder to use Mantine-compatible components, place `QueryBuilderMantine` above `QueryBuilder` in the component hierarchy.

```tsx
import { QueryBuilderMantine } from '@react-querybuilder/mantine';
import { type Field, QueryBuilder, type RuleGroupType } from 'react-querybuilder';

const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

export function App() {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <QueryBuilderMantine>
      <QueryBuilder fields={fields} defaultQuery={query} onQueryChange={setQuery} />
    </QueryBuilderMantine>
  );
}
```

`QueryBuilderMantine` is a React context provider that assigns the following props to all descendant `QueryBuilder` elements. The props can be overridden on the `QueryBuilder` or used directly without the context provider.

| Export                   | `QueryBuilder` prop             |
| ------------------------ | ------------------------------- |
| `mantineControlElements` | `controlElements`               |
| `MantineActionElement`   | `controlElements.actionElement` |
| `MantineNotToggle`       | `controlElements.notToggle`     |
| `MantineShiftActions`    | `controlElements.shiftActions`  |
| `MantineValueEditor`     | `controlElements.valueEditor`   |
| `MantineValueSelector`   | `controlElements.valueSelector` |
