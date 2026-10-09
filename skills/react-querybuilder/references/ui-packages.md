# UI packages

Each package provides a **context wrapper** that swaps in that library's control elements. Wrap `<QueryBuilder>` with it. Don't wire `controlElements` by hand.

```tsx
<QueryBuilderMantine>
  <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
</QueryBuilderMantine>
```

- The library's own provider/theme goes **outside** the RQB wrapper.
- Always import `react-querybuilder/dist/query-builder.css` too (unless it's Tremor/Tailwind-only and you've verified the styling).
- The UI package version must exactly match `react-querybuilder`.
- Props on `QueryBuilder` override the wrapper's (e.g. your own `controlElements.valueEditor`).
- Individual components (e.g. `MaterialValueEditor`, `AntDValueSelector`) and `<lib>ControlElements` objects are exported for selective use.

| Library        | Package                         | Wrapper                  | Library setup (outside the wrapper)                                                                                                 |
| -------------- | ------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Ant Design     | `@react-querybuilder/antd`      | `QueryBuilderAntD`       | Peers: `antd >=5.11`, `@ant-design/icons`, `dayjs`. Optional CSS: `.queryBuilder .ant-input { width: auto; }`                       |
| Bootstrap      | `@react-querybuilder/bootstrap` | `QueryBuilderBootstrap`  | `bootstrap/dist/css/bootstrap.css` + `bootstrap-icons/font/bootstrap-icons.css`                                                     |
| Bulma          | `@react-querybuilder/bulma`     | `QueryBuilderBulma`      | `bulma/css/bulma.css`. Optional CSS: `.queryBuilder .input { width: auto; }`                                                        |
| Chakra UI v3   | `@react-querybuilder/chakra`    | `QueryBuilderChakra`     | `<ChakraProvider value={createSystem(defaultConfig)}>` (+ `next-themes` `ThemeProvider`). Chakra v2 → `@react-querybuilder/chakra2` |
| Fluent UI v9   | `@react-querybuilder/fluent`    | `QueryBuilderFluent`     | `<FluentProvider theme={webLightTheme}>`                                                                                            |
| Mantine ≥7     | `@react-querybuilder/mantine`   | `QueryBuilderMantine`    | `<MantineProvider>` + `@mantine/core/styles.css`. Peers include `@mantine/dates`, `dayjs`                                           |
| MUI ≥5         | `@react-querybuilder/material`  | `QueryBuilderMaterial`   | `<ThemeProvider theme={createTheme()}>`. Optional `muiComponents` prop to preload MUI components                                    |
| PrimeReact ≥10 | `@react-querybuilder/prime`     | `QueryBuilderPrime`      | A PrimeReact theme CSS + `primereact/resources/primereact.min.css` + `primeicons/primeicons.css`                                    |
| Tremor v3      | `@react-querybuilder/tremor`    | `QueryBuilderTremor`     | Tailwind configured for Tremor                                                                                                      |
| shadcn/ui      | (registry, not npm)             | `QueryBuilderShadcn`     | `npx shadcn add https://react-querybuilder.js.org/r/query-builder.json`; import from `@/components/query-builder`                   |
| React Native   | `@react-querybuilder/native`    | **`QueryBuilderNative`** | **Not a wrapper.** It replaces `QueryBuilder` and takes the same props. No CSS import                                               |

## Examples

```tsx
// MUI
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryBuilderMaterial } from '@react-querybuilder/material';
import { QueryBuilder } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

const theme = createTheme();

<ThemeProvider theme={theme}>
  <QueryBuilderMaterial>
    <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
  </QueryBuilderMaterial>
</ThemeProvider>;
```

```tsx
// React Native
import { QueryBuilderNative } from '@react-querybuilder/native';

<QueryBuilderNative fields={fields} query={query} onQueryChange={setQuery} />;
```

## Composing with extensions

Nest wrappers. The UI wrapper goes outermost, then datetime, then dnd:

```tsx
<QueryBuilderMantine>
  <QueryBuilderDateTime>
    <QueryBuilderDnD dnd={dndAdapter}>
      <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
    </QueryBuilderDnD>
  </QueryBuilderDateTime>
</QueryBuilderMantine>
```
