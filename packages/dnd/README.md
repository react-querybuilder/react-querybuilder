## @react-querybuilder/dnd

Augments [react-querybuilder](https://npmjs.com/package/react-querybuilder) with drag-and-drop functionality.

To see this in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/react-querybuilder/#enableDragAndDrop=true) with the drag-and-drop option enabled.

## Installation

```bash
npm i --save react-querybuilder @react-querybuilder/dnd react-dnd react-dnd-html5-backend
# OR
yarn add react-querybuilder @react-querybuilder/dnd react-dnd react-dnd-html5-backend
```

## Usage

To enable the drag-and-drop functionality of a query builder, wrap the `<QueryBuilder />` element in `<QueryBuilderDnD />`.

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
      <QueryBuilder fields={fields} query={query} onQueryChange={q => setQuery(q)} />
    </QueryBuilderDnD>
  );
};
```

## Notes

- `<QueryBuilderDnD />` will automatically set the `enableDragAndDrop` prop to `true` on any descendant `<QueryBuilder />` elements unless `enableDragAndDrop` is explicitly set to `false` on the `<QueryBuilder />` element.

- If your application already uses `react-dnd` outside the scope of a query builder, use `QueryBuilderDndWithoutProvider` instead of `QueryBuilderDnD` to inherit context from your existing `DndProvider`.

  ```tsx
  import { QueryBuilderDndWithoutProvider } from '@react-querybuilder/dnd';
  import { QueryBuilder, RuleGroupType } from 'react-querybuilder';

  const fields = [
    { name: 'firstName', label: 'First Name' },
    { name: 'lastName', label: 'Last Name' },
  ];

  const ChildComponentOfDndProvider = () => {
    const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

    return (
      <QueryBuilderDndWithoutProvider>
        <QueryBuilder fields={fields} query={query} onQueryChange={q => setQuery(q)} />
      </QueryBuilderDndWithoutProvider>
    );
  };
  ```
