## @react-querybuilder/bulma

Official [Bulma](https://bulma.io/) components for [react-querybuilder](https://npmjs.com/package/react-querybuilder).

To see them in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/react-querybuilder/) and choose "Bulma" from the Style drop-down.

## Installation

```bash
npm i --save react-querybuilder @react-querybuilder/bulma bulma react-bulma-components
# OR
yarn add react-querybuilder @react-querybuilder/bulma bulma react-bulma-components
```

## Usage

```tsx
import QueryBuilder, { RuleGroupType } from 'react-querybuilder';
import {
  BulmaActionElement,
  BulmaNotToggle,
  BulmaValueEditor,
  BulmaValueSelector,
} from '@react-querybuilder/bulma';
import 'bulma/bulma.sass';

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
      controlElements={{
        addGroupAction: BulmaActionElement,
        addRuleAction: BulmaActionElement,
        cloneGroupAction: BulmaActionElement,
        cloneRuleAction: BulmaActionElement,
        combinatorSelector: BulmaValueSelector,
        fieldSelector: BulmaValueSelector,
        notToggle: BulmaNotToggle,
        operatorSelector: BulmaValueSelector,
        removeGroupAction: BulmaActionElement,
        removeRuleAction: BulmaActionElement,
        valueEditor: BulmaValueEditor,
      }}
    />
  );
};
```

Some additional styling may be necessary, e.g.:

```scss
.input {
  width: auto;
}
```
