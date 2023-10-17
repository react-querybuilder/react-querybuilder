## @react-querybuilder/blueprint

Official [react-querybuilder](https://npmjs.com/package/react-querybuilder) components for [Blueprint](https://blueprintjs.com/).

To see them in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/demo/blueprint) or [load the example in CodeSandbox](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/blueprint).

**[Full documentation](https://react-querybuilder.js.org/)**

## Installation

```bash
npm i react-querybuilder @react-querybuilder/blueprint @blueprintjs/core @blueprintjs/datetime2 @blueprintjs/icons @blueprintjs/select
# OR yarn add / pnpm add / bun add
```

## Usage

To render Blueprint-compatible components in the query builder, wrap the `<QueryBuilder />` element in `<QueryBuilderBlueprint />`.

```tsx
import { QueryBuilderBlueprint } from '@react-querybuilder/blueprint';
import { QueryBuilder, RuleGroupType } from 'react-querybuilder';

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <QueryBuilderBlueprint>
      <QueryBuilder fields={fields} query={query} onQueryChange={q => setQuery(q)} />
    </QueryBuilderBlueprint>
  );
};
```

## Notes

- This package exports `blueprintControlElements` which can be assigned directly to the `controlElements` prop on `<QueryBuilder />` (and also exports each component individually), but wrapping `<QueryBuilder />` in `<QueryBuilderBlueprint />` is the recommended method. Likewise with `blueprintTranslations`.
