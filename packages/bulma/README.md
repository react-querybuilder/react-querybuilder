## @react-querybuilder/bulma

Official [react-querybuilder](https://npmjs.com/package/react-querybuilder) components for [Bulma](https://bulma.io/).

To see them in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/demo/bulma) or [load the example in CodeSandbox](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/bulma).

**[Full documentation](https://react-querybuilder.js.org/)**

## Installation

```bash
npm i --save react-querybuilder @react-querybuilder/bulma bulma
# OR
yarn add react-querybuilder @react-querybuilder/bulma bulma
```

## Usage

To render Bulma-compatible components in the query builder, wrap the `<QueryBuilder />` element in `<QueryBuilderBulma />`.

```tsx
import { QueryBuilderBulma } from '@react-querybuilder/bulma';
import 'bulma/bulma.sass';
import { QueryBuilder, RuleGroupType } from 'react-querybuilder';

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <QueryBuilderBulma>
      <QueryBuilder fields={fields} query={query} onQueryChange={q => setQuery(q)} />
    </QueryBuilderBulma>
  );
};
```

## Notes

- Some additional styling may be necessary, e.g.:

  ```css
  .queryBuilder .input {
    width: auto;
  }
  ```

- This package exports `bulmaControlElements` which can be assigned directly to the `controlElements` prop on `<QueryBuilder />` (and also exports each component individually), but wrapping `<QueryBuilder />` in `<QueryBuilderBulma />` is the recommended method.
