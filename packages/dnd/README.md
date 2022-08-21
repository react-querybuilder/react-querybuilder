## @react-querybuilder/dnd

Augments [react-querybuilder](https://npmjs.com/package/react-querybuilder) with drag-and-drop functionality.

To see this in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/react-querybuilder/#enableDragAndDrop=true).

## Installation

```bash
npm i --save react-querybuilder @react-querybuilder/dnd react-dnd react-dnd-html5-backend
# OR
yarn add react-querybuilder @react-querybuilder/dnd react-dnd react-dnd-html5-backend
```

## Usage

```tsx
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import { QueryBuilder, RuleGroupType } from 'react-querybuilder';

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <QueryBuilderDnD>
      <QueryBuilder
        fields={fields}
        query={query}
        onQueryChange={q => setQuery(q)}
        enableDragAndDrop
      />
    </QueryBuilderDnD>
  );
};
```

If your application already uses `react-dnd` outside the scope of a query builder, use `QueryBuilderWithoutDndProvider` instead of `QueryBuilderDnD` to inherit context from your existing `DndProvider`.

```tsx
import { QueryBuilderWithoutDndProvider } from '@react-querybuilder/dnd';
import { QueryBuilder, RuleGroupType } from 'react-querybuilder';

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const ChildComponentOfDndProvider = () => {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <QueryBuilderWithoutDndProvider>
      <QueryBuilder
        fields={fields}
        query={query}
        onQueryChange={q => setQuery(q)}
        enableDragAndDrop
      />
    <QueryBuilderWithoutDndProvider/>
  );
};
```
