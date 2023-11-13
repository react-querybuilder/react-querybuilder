## @react-querybuilder/chakra

Official [react-querybuilder](https://npmjs.com/package/react-querybuilder) components for [Chakra UI](https://chakra-ui.com/).

To see them in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/demo/chakra) or [load the example in CodeSandbox](https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/chakra).

**[Full documentation](https://react-querybuilder.js.org/)**

## Installation

```bash
npm i react-querybuilder @react-querybuilder/chakra @chakra-ui/icons @chakra-ui/react @chakra-ui/system @emotion/react @emotion/styled framer-motion
# OR yarn add / pnpm add / bun add
```

## Usage

To render Chakra-compatible components in the query builder, wrap the `<QueryBuilder />` element in `<QueryBuilderChakra />`.

```tsx
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { QueryBuilderChakra } from '@react-querybuilder/chakra';
import { QueryBuilder, RuleGroupType } from 'react-querybuilder';

const chakraTheme = extendTheme();

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <ChakraProvider theme={chakraTheme}>
      <QueryBuilderChakra>
        <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
      </QueryBuilderChakra>
    </ChakraProvider>
  );
};
```

## Notes

- Some additional styling may be necessary, e.g.:

  ```css
  .queryBuilder .chakra-select__wrapper {
    width: fit-content;
    display: inline-block;
  }

  .queryBuilder .chakra-input {
    width: auto;
    display: inline-block;
  }

  .queryBuilder .chakra-radio-group {
    display: inline-block;
  }
  ```

- This package exports `chakraControlElements` which can be assigned directly to the `controlElements` prop on `<QueryBuilder />` (and also exports each component individually), but this method does not support customized Chakra themes like `<QueryBuilderChakra />`.
