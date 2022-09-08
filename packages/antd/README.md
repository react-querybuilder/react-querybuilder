## @react-querybuilder/antd

Official [react-querybuilder](https://npmjs.com/package/react-querybuilder) components for [Ant Design](https://ant.design/).

To see them in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/react-querybuilder/#style=antd) or [load the example in CodeSandbox](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/antd).

**[Full documentation](https://react-querybuilder.js.org/)**

## Installation

```bash
npm i --save react-querybuilder @react-querybuilder/antd @ant-design/icons antd
# OR
yarn add react-querybuilder @react-querybuilder/antd @ant-design/icons antd
```

## Usage

This package exports `antdControlElements` which can be assigned directly to the `controlElements` prop on `<QueryBuilder />`, and also exports each component individually. However, the recommended usage is to wrap a `<QueryBuilder />` element in `<QueryBuilderAntD />`, like this:

```tsx
import { QueryBuilderAntD } from '@react-querybuilder/antd';
import { QueryBuilder, RuleGroupType } from 'react-querybuilder';

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <QueryBuilderAntD>
      <QueryBuilder fields={fields} query={query} onQueryChange={q => setQuery(q)} />
    </QueryBuilderAntD>
  );
};
```

You may also want to reduce the width of the value editor component (100% by default) with the following CSS rule:

```css
.queryBuilder .ant-input {
  width: auto;
}
```
