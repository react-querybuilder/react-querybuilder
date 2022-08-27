## @react-querybuilder/material

Official [react-querybuilder](https://npmjs.com/package/react-querybuilder) components for [MUI](https://mui.com/)/[Material Design](https://material.io/design).

To see them in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/react-querybuilder/#style=material) or [load the example in CodeSandbox](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/material).

## Installation

```bash
npm i --save react-querybuilder @react-querybuilder/material @mui/icons-material @mui/material
# OR
yarn add react-querybuilder @react-querybuilder/material @mui/icons-material @mui/material
```

## Usage

This package exports `materialControlElements` which can be assigned directly to the `controlElements` prop on `<QueryBuilder />`, and also exports each component individually. However, the recommended usage is to wrap a `<QueryBuilder />` element in `<QueryBuilderMaterial />`, like this:

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
        <QueryBuilder fields={fields} query={query} onQueryChange={q => setQuery(q)} />
      </QueryBuilderMaterial>
    </ThemeProvider>
  );
};
```

By default, all `@mui/material` components will be loaded asynchronously. To avoid the temporary display of basic, non-MUI controls, import the controls and pass them to `QueryBuilderMaterial`.

```tsx
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryBuilderMaterial } from '@react-querybuilder/material';
import { QueryBuilder, RuleGroupType } from 'react-querybuilder';
// MUI component imports
import Checkbox from '@mui/material/Checkbox';
import DragIndicator from '@mui/material/DragIndicator';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Input from '@mui/material/Input';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextareaAutosize from '@mui/material/TextareaAutosize';

// Assign the MUI components to an object
const muiComponents = {
  Checkbox,
  DragIndicator,
  FormControl,
  FormControlLabel,
  Input,
  ListSubheader,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextareaAutosize,
};

const muiTheme = createTheme();

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <ThemeProvider theme={muiTheme}>
      {/* Use the object as the `muiComponents` prop to enable immediate rendering */}
      <QueryBuilderMaterial muiComponents={muiComponents}>
        <QueryBuilder fields={fields} query={query} onQueryChange={q => setQuery(q)} />
      </QueryBuilderMaterial>
    </ThemeProvider>
  );
};
```
