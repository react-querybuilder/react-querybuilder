## @react-querybuilder/bulma

Official [react-querybuilder](https://npmjs.com/package/react-querybuilder) components for [Bulma](https://bulma.io/).

To see them in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/react-querybuilder/#style=bulma) or [load the example in CodeSandbox](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/bulma).

## Installation

```bash
npm i --save react-querybuilder @react-querybuilder/bulma bulma
# OR
yarn add react-querybuilder @react-querybuilder/bulma bulma
```

## Usage

This package exports `bulmaControlElements` which can be assigned directly to the `controlElements` prop on `<QueryBuilder />`, and also exports each component individually. However, the recommended usage is to wrap a `<QueryBuilder />` element in `<QueryBuilderBulma />`, like this:

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

Some additional styling may be necessary, e.g.:

```css
.queryBuilder .input {
  width: auto;
}
```
