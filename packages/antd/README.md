## @react-querybuilder/antd

Official [Ant Design](https://ant.design/) components for [react-querybuilder](https://npmjs.com/package/react-querybuilder).

To see them in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/react-querybuilder/) and choose "Ant Design" from the Style drop-down.

## Installation

```bash
npm i --save react-querybuilder @react-querybuilder/antd @ant-design/icons antd
# OR
yarn add react-querybuilder @react-querybuilder/antd @ant-design/icons antd
```

## Usage

```tsx
import QueryBuilder, { RuleGroupType } from 'react-querybuilder';
import {
  AntDActionElement,
  AntDDragHandle,
  AntDNotToggle,
  AntDValueEditor,
  AntDValueSelector
} from '@react-querybuilder/antd';

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
        addGroupAction: AntDActionElement,
        addRuleAction: AntDActionElement,
        cloneGroupAction: AntDActionElement,
        cloneRuleAction: AntDActionElement,
        combinatorSelector: AntDValueSelector,
        fieldSelector: AntDValueSelector,
        notToggle: AntDNotToggle,
        operatorSelector: AntDValueSelector,
        removeGroupAction: AntDActionElement,
        removeRuleAction: AntDActionElement,
        valueEditor: AntDValueEditor,
        dragHandle: AntDDragHandle
      }}
    />
  );
};
```

You may also want to reduce the width of the value editor component, which is 100% by default, with the following CSS rule:

```css
.ant-input {
  width: auto;
}
```
