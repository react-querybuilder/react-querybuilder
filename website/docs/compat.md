---
title: Compatibility packages
---

React Query Builder's default components use basic HTML5 form controls that are highly customizable through styling, especially via the [`controlClassnames` prop](./components/querybuilder#controlclassnames). However, some UI libraries require specific components or HTML structures to properly style their form controls.

## Packages

Official component packages compatible with several popular style libraries are available under the [`@react-querybuilder` org on npm](https://www.npmjs.com/org/react-querybuilder).

See each component package in action by selecting the "Style library" option on the [demo page](/demo). "Demo" links below load the demo with that library preselected, while [CodeSandbox](https://codesandbox.io)/[StackBlitz](https://stackblitz.com) links open editable examples on their respective platforms.

| Official site                                       | Compatibility package                                                                        | Demo                    | CodeSandbox                         | StackBlitz                              |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------- | --------------------------------------- |
| [Ant Design](https://ant.design/)                   | [@react-querybuilder/antd](https://www.npmjs.com/package/@react-querybuilder/antd)           | [Demo](/demo/antd)      | [CodeSandbox](/sandbox?t=antd)      | [StackBlitz](/sandbox?p=sb&t=antd)      |
| [Bootstrap](https://getbootstrap.com/)              | [@react-querybuilder/bootstrap](https://www.npmjs.com/package/@react-querybuilder/bootstrap) | [Demo](/demo/bootstrap) | [CodeSandbox](/sandbox?t=bootstrap) | [StackBlitz](/sandbox?p=sb&t=bootstrap) |
| [Bulma](https://bulma.io/)                          | [@react-querybuilder/bulma](https://www.npmjs.com/package/@react-querybuilder/bulma)         | [Demo](/demo/bulma)     | [CodeSandbox](/sandbox?t=bulma)     | [StackBlitz](/sandbox?p=sb&t=bulma)     |
| [Chakra UI](https://chakra-ui.com/)                 | [@react-querybuilder/chakra](https://www.npmjs.com/package/@react-querybuilder/chakra)       | [Demo](/demo/chakra)    | [CodeSandbox](/sandbox?t=chakra)    | [StackBlitz](/sandbox?p=sb&t=chakra)    |
| [Fluent UI](https://github.com/microsoft/fluentui/) | [@react-querybuilder/fluent](https://www.npmjs.com/package/@react-querybuilder/fluent)       | [Demo](/demo/fluent)    | [CodeSandbox](/sandbox?t=fluent)    | [StackBlitz](/sandbox?p=sb&t=fluent)    |
| [Mantine](https://mantine.dev/)                     | [@react-querybuilder/mantine](https://www.npmjs.com/package/@react-querybuilder/mantine)     | [Demo](/demo/mantine)   | [CodeSandbox](/sandbox?t=mantine)   | [StackBlitz](/sandbox?p=sb&t=mantine)   |
| [MUI](https://mui.com/)                             | [@react-querybuilder/material](https://www.npmjs.com/package/@react-querybuilder/material)   | [Demo](/demo/material)  | [CodeSandbox](/sandbox?t=material)  | [StackBlitz](/sandbox?p=sb&t=material)  |
| [React Native](https://reactnative.dev/)            | [@react-querybuilder/native](https://www.npmjs.com/package/@react-querybuilder/native)       | _Coming soon!_          | [CodeSandbox](/sandbox?t=native)    | [StackBlitz](/sandbox?p=sb&t=native)    |
| [Tremor](https://www.tremor.so/)                    | [@react-querybuilder/tremor](https://www.npmjs.com/package/@react-querybuilder/tremor)       | [Demo](/demo/tremor)    | [CodeSandbox](/sandbox?t=tremor)    | [StackBlitz](/sandbox?p=sb&t=tremor)    |

## Usage

The recommended approach is to wrap `<QueryBuilder />` in the appropriate `QueryBuilder*` context provider from the compatibility package.

This example uses the Ant Design library:

```tsx
import { QueryBuilderAntD } from '@react-querybuilder/antd';
import 'antd/dist/antd.compact.css'; // <- include this only if using `antd@<5`
import { QueryBuilder } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import { defaultQuery, fields } from './constants';

export function App() {
  return (
    <QueryBuilderAntD>
      <QueryBuilder fields={fields} defaultQuery={defaultQuery} />
    </QueryBuilderAntD>
  );
}
```

Each compatibility package exports its own context provider except `@react-querybuilder/native`, which provides `<QueryBuilderNative />` as a direct replacement for `<QueryBuilder />` with identical props.

| Compatibility package           | Context provider        |
| ------------------------------- | ----------------------- |
| `@react-querybuilder/antd`      | `QueryBuilderAntD`      |
| `@react-querybuilder/bootstrap` | `QueryBuilderBootstrap` |
| `@react-querybuilder/bulma`     | `QueryBuilderBulma`     |
| `@react-querybuilder/chakra`    | `QueryBuilderChakra`    |
| `@react-querybuilder/fluent`    | `QueryBuilderFluent`    |
| `@react-querybuilder/mantine`   | `QueryBuilderMantine`   |
| `@react-querybuilder/material`  | `QueryBuilderMaterial`  |
| `@react-querybuilder/tremor`    | `QueryBuilderTremor`    |

:::tip

Context providers can be nested to combine features. For example, nest a UI library provider under `QueryBuilderDnD` to add both drag-and-drop functionality and styled components.

This example uses the Bulma library _and_ enables drag-and-drop:

```tsx
import { QueryBuilderBulma } from '@react-querybuilder/bulma';
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import 'bulma/bulma.sass';
import { QueryBuilder } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import { defaultQuery, fields } from './constants';

export function App() {
  return (
    <QueryBuilderDnD>
      <QueryBuilderBulma>
        <QueryBuilder fields={fields} defaultQuery={defaultQuery} />
      </QueryBuilderBulma>
    </QueryBuilderDnD>
  );
}
```

:::

## Other exports

Each compatibility package exports a `*ControlElements` object for the [`controlElements` prop](./components/querybuilder#controlelements). Some packages also include `*ControlClassnames` and `*Translations` objects for the respective props. Use these exports when you need granular control over component replacement. See [Customization](#customization) below for advanced usage.

This example uses the Bootstrap library:

```tsx
import {
  bootstrapControlClassnames,
  bootstrapControlElements,
} from '@react-querybuilder/bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import { QueryBuilder } from 'react-querybuilder';
import { defaultQuery, fields } from './constants';

export function App() {
  return (
    <QueryBuilder
      fields={fields}
      defaultQuery={defaultQuery}
      controlElements={bootstrapControlElements}
      controlClassnames={bootstrapControlClassnames}
    />
  );
}
```

| Compatibility package           | `controlElements` object   |
| ------------------------------- | -------------------------- |
| `@react-querybuilder/antd`      | `antdControlElements`      |
| `@react-querybuilder/bootstrap` | `bootstrapControlElements` |
| `@react-querybuilder/bulma`     | `bulmaControlElements`     |
| `@react-querybuilder/chakra`    | `chakraControlElements`    |
| `@react-querybuilder/fluent`    | `fluentControlElements`    |
| `@react-querybuilder/mantine`   | `mantineControlElements`   |
| `@react-querybuilder/material`  | `materialControlElements`  |
| `@react-querybuilder/native`    | `nativeControlElements`    |
| `@react-querybuilder/tremor`    | `tremorControlElements`    |

## Customization

All compatibility components except the `*ValueEditor`s accept props defined by the style library for the actual rendered component in addition to the standard props defined by `react-querybuilder`. This allows you to idiomatically customize the style library's component while leaving the query builder integration to the compatibility layer.

For example, the `AntDActionElement` component from `@react-querybuilder/antd` renders a `Button` component from `antd`, so it accepts properties from both the `ActionProps` interface (`react-querybuilder`) and the `ButtonProps` interface (`antd`).

In the example below, the `size` prop is accepted because it's an `antd` `Button` prop (from the `ButtonProps` interface), even though it's not in the `ActionProps` interface.

```tsx
import { AntDActionElement, antdControlElements } from '@react-querybuilder/antd';
import { QueryBuilder, type ActionProps } from 'react-querybuilder';

const MyAntDActionElement = (props: ActionProps) => <AntDActionElement {...props} size="large" />;

export function App() {
  return (
    <QueryBuilder
      controlElements={{
        ...antdControlElements,
        addRuleAction: MyAntDActionElement,
        addGroupAction: MyAntDActionElement,
        cloneRuleAction: MyAntDActionElement,
        cloneGroupAction: MyAntDActionElement,
        lockRuleAction: MyAntDActionElement,
        lockGroupAction: MyAntDActionElement,
        removeRuleAction: MyAntDActionElement,
        removeGroupAction: MyAntDActionElement,
      }}
    />
  );
}
```

This list shows which library components' props are accepted by the compatibility components, in addition to those defined by `react-querybuilder`.

| Component                          | Base props (from RQB)    | Rendered library component                                      |
| ---------------------------------- | ------------------------ | --------------------------------------------------------------- |
| **`@react-querybuilder/antd`**     |                          |                                                                 |
| `AntDActionElement`                | `ActionProps`            | `import { Button } from 'antd'`                                 |
| `AntDDragHandle`                   | `DragHandleProps`        | `import { HolderOutlined } from '@ant-design/icons'`            |
| `AntDNotToggle`                    | `NotToggleProps`         | `import { Switch } from 'antd'`                                 |
| `AntDValueSelector`                | `VersatileSelectorProps` | `import { Select } from 'antd'`                                 |
| **`@react-querybuilder/chakra`**   |                          |                                                                 |
| `ChakraActionElement`              | `ActionProps`            | `import { Button } from '@chakra-ui/react'`                     |
| `ChakraDragHandle` (removed in v8) | `DragHandleProps`        | `import { IconButton } from '@chakra-ui/react'`                 |
| `ChakraNotToggle`                  | `NotToggleProps`         | `import { Switch } from '@chakra-ui/react'`                     |
| `ChakraValueSelector`              | `VersatileSelectorProps` | `import { Select } from '@chakra-ui/react'`                     |
| **`@react-querybuilder/fluent`**   |                          |                                                                 |
| `FluentActionElement`              | `ActionProps`            | `import { Button } from '@fluentui/react-components'`           |
| `FluentDragHandle`                 | `DragHandleProps`        | `import { Text } from '@fluentui/react-components'`             |
| `FluentNotToggle`                  | `NotToggleProps`         | `import { Switch } from '@fluentui/react-components'`           |
| `FluentValueSelector`              | `VersatileSelectorProps` | `import { Dropdown, Select } from '@fluentui/react-components'` |
| **`@react-querybuilder/mantine`**  |                          |                                                                 |
| `MantineActionElement`             | `ActionProps`            | `import { Button } from '@mantine/core'`                        |
| `MantineNotToggle`                 | `NotToggleProps`         | `import { Switch } from '@mantine/core'`                        |
| `MantineValueSelector`             | `VersatileSelectorProps` | `import { Select } from '@mantine/core'`                        |
| **`@react-querybuilder/material`** |                          |                                                                 |
| `MaterialActionElement`            | `ActionProps`            | `import { Button } from '@mui/material'`                        |
| `MaterialDragHandle`               | `DragHandleProps`        | `import { DragIndicator } from '@mui/icons-material'`           |
| `MaterialNotToggle`                | `NotToggleProps`         | `import { Switch } from '@mui/material'`                        |
| `MaterialValueSelector`            | `VersatileSelectorProps` | `import { Select } from '@mui/material'`                        |
| **`@react-querybuilder/tremor`**   |                          |                                                                 |
| `TremorActionElement`              | `ActionProps`            | `import { Button } from '@tremor/react'`                        |
| `TremorNotToggle`                  | `NotToggleProps`         | `import { Switch } from '@tremor/react'`                        |
| `TremorValueSelector`              | `VersatileSelectorProps` | `import { MultiSelect, Select } from '@tremor/react'`           |

## Preload MUI components

:::tip

As of v6.2.0, MUI components are loaded synchronously in traditional environments. However, preloading MUI components _may_ still be necessary when using React Server Components, even if the component file rendering the query builder includes the `"use client"` directive.

:::

Prior to v6.2.0, the `@react-querybuilder/material` compatibility package loaded components from `@mui/material` asynchronously to properly inherit the theme context ([issue](https://github.com/react-querybuilder/react-querybuilder/issues/321)/[PR](https://github.com/react-querybuilder/react-querybuilder/pull/324)). This meant the query builder was initially rendered with default components, then—very quickly, if all went well—the MUI components would replace them.

To avoid rendering default components and render MUI components immediately instead, import the MUI components in your application code and assign them as properties of the `muiComponents` prop on the `QueryBuilderMaterial` context provider. (Individual MUI compatibility components—`MaterialValueEditor`, `MaterialActionElement`, etc.—also accept an optional `muiComponents` prop.)

```tsx
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryBuilderMaterial } from '@react-querybuilder/material';
import { QueryBuilder } from 'react-querybuilder';
import { defaultQuery, fields } from './constants';
// highlight-start
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DragIndicator from '@mui/icons-material/DragIndicator';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextareaAutosize from '@mui/material/TextareaAutosize';
// (Use `Input` instead of `TextField` in versions lower than 7.7.1)
import TextField from '@mui/material/TextField';

const muiComponents = {
  Button,
  Checkbox,
  CloseIcon,
  ContentCopyIcon,
  DragIndicator,
  FormControl,
  FormControlLabel,
  KeyboardArrowDownIcon,
  KeyboardArrowUpIcon,
  ListSubheader,
  LockIcon,
  LockOpenIcon,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextareaAutosize,
  TextField, // (Use `Input` instead of `TextField` in versions lower than 7.7.1)
};
// highlight-end

const muiTheme = createTheme();

export function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      {/* highlight-start */}
      <QueryBuilderMaterial muiComponents={muiComponents}>
        {/* highlight-end */}
        <QueryBuilder fields={fields} defaultQuery={defaultQuery} />
      </QueryBuilderMaterial>
    </ThemeProvider>
  );
}
```
