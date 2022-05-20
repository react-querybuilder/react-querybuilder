## @react-querybuilder/bootstrap

Official [react-querybuilder](https://npmjs.com/package/react-querybuilder) components for [Bootstrap](https://getbootstrap.com/).

To see them in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/react-querybuilder/) and choose "Bootstrap" from the Style drop-down.

## Installation

```bash
npm i --save react-querybuilder @react-querybuilder/bootstrap bootstrap bootstrap-icons
# OR
yarn add react-querybuilder @react-querybuilder/bootstrap bootstrap bootstrap-icons
```

## Usage

```tsx
import {
  bootstrapControlClassnames,
  bootstrapControlElements,
} from '@react-querybuilder/bootstrap';
import { QueryBuilder, RuleGroupType } from 'react-querybuilder';
import 'bootstrap/scss/bootstrap.scss';

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <QueryBuilder
      fields={fields}
      query={query}
      onQueryChange={q => setQuery(q)}
      controlClassnames={bootstrapControlClassnames}
      controlElements={bootstrapControlElements}
    />
  );
};
```

Some additional styling may be necessary, e.g.:

```css
.queryBuilder .form-control,
.queryBuilder .form-select {
  display: inline-block;
  width: auto;
}
```
