## @react-querybuilder/material

Official [react-querybuilder](https://npmjs.com/package/react-querybuilder) components for [MUI](https://mui.com/)/[Material Design](https://material.io/design).

To see them in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/demo/material) or [load the example in CodeSandbox](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/material).

**[Full documentation](https://react-querybuilder.js.org/)**

## Installation

```bash
npm i react-querybuilder @react-querybuilder/material @mui/icons-material @mui/material
# OR yarn add / pnpm add / bun add
```

## Usage

To render MUI-compatible components in the query builder, wrap the `<QueryBuilder />` element in `<QueryBuilderMaterial />`.

```tsx
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryBuilderMaterial } from '@react-querybuilder/material';
import { QueryBuilder, RuleGroupType } from 'react-querybuilder';

const muiTheme = createTheme();

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <ThemeProvider theme={muiTheme}>
      <QueryBuilderMaterial>
        <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
      </QueryBuilderMaterial>
    </ThemeProvider>
  );
};
```

## Notes

- This package exports `materialControlElements` which can be assigned directly to the `controlElements` prop on `<QueryBuilder />` (and also exports each component individually), but wrapping `<QueryBuilder />` in `<QueryBuilderMaterial />` is the recommended method.
- In an environment based on React Server Components, [preloading the MUI components](https://react-querybuilder.js.org/docs/compat#preload-mui-components) may be necessary.
