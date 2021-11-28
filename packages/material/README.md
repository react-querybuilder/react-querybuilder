## @react-querybuilder/material

Official [MUI](https://mui.com/)/[Material Design](https://material.io/design) components for [react-querybuilder](https://npmjs.com/package/react-querybuilder).

To see them in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/react-querybuilder/) and choose "Material" from the Style drop-down.

## Installation

```bash
npm i --save react-querybuilder @react-querybuilder/material @mui/icons-material @mui/material
# OR
yarn add react-querybuilder @react-querybuilder/material @mui/icons-material @mui/material
```

## Usage

```tsx
import QueryBuilder, { RuleGroupType } from 'react-querybuilder';
import {
  MaterialActionElement,
  MaterialDragHandle,
  MaterialNotToggle,
  MaterialValueEditor,
  MaterialValueSelector
} from '@react-querybuilder/material';

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' }
];

const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <QueryBuilder
      fields={fields}
      query={query}
      onQueryChange={(q) => setQuery(q)}
      controlElements={{
        addGroupAction: MaterialActionElement,
        addRuleAction: MaterialActionElement,
        cloneGroupAction: MaterialActionElement,
        cloneRuleAction: MaterialActionElement,
        combinatorSelector: MaterialValueSelector,
        fieldSelector: MaterialValueSelector,
        notToggle: MaterialNotToggle,
        operatorSelector: MaterialValueSelector,
        removeGroupAction: MaterialActionElement,
        removeRuleAction: MaterialActionElement,
        valueEditor: MaterialValueEditor,
        dragHandle: MaterialDragHandle
      }}
    />
  );
};
```
