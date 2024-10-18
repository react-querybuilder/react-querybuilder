## @react-querybuilder/bulma

Official [react-querybuilder](https://npmjs.com/package/react-querybuilder) compatibility package for [Bulma](https://bulma.io/).

- [Demo](https://react-querybuilder.js.org/demo/bulma)
- [Full documentation](https://react-querybuilder.js.org/)
- [CodeSandbox](https://react-querybuilder.js.org/sandbox?t=bulma) / [StackBlitz](https://react-querybuilder.js.org/sandbox?p=stackblitz&t=bulma) example projects

## Installation

```bash
npm i react-querybuilder @react-querybuilder/bulma bulma
# OR yarn add / pnpm add / bun add
```

## Usage

To configure the query builder to use Bulma-compatible components, place `QueryBuilderBulma` above `QueryBuilder` in the component hierarchy.

```tsx
import { QueryBuilderBulma } from '@react-querybuilder/bulma';
import { type Field, QueryBuilder, type RuleGroupType } from 'react-querybuilder';

const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

export function App() {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <QueryBuilderBulma>
      <QueryBuilder fields={fields} defaultQuery={query} onQueryChange={setQuery} />
    </QueryBuilderBulma>
  );
}
```

> [!NOTE]
>
> Some additional styling may be necessary. We recommend the following:
>
> ```css
> .queryBuilder .input {
>   width: auto;
> }
> ```

`QueryBuilderBulma` is a React context provider that assigns the following props to all descendant `QueryBuilder` elements. The props can be overridden on the `QueryBuilder` or used directly without the context provider.

| Export                   | `QueryBuilder` prop             |
| ------------------------ | ------------------------------- |
| `bulmaControlClassnames` | `controlClassnames`             |
| `bulmaControlElements`   | `controlElements`               |
| `BulmaNotToggle`         | `controlElements.notToggle`     |
| `BulmaValueEditor`       | `controlElements.valueEditor`   |
| `BulmaValueSelector`     | `controlElements.valueSelector` |
