## @react-querybuilder/chakra

Official [Chakra UI](https://chakra-ui.com/) components for [react-querybuilder](https://npmjs.com/package/react-querybuilder).

To see them in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/react-querybuilder/) and choose "Chakra UI" from the Style drop-down.

## Installation

```bash
npm i --save react-querybuilder @react-querybuilder/chakra @chakra-ui/icons @chakra-ui/react @chakra-ui/system @emotion/react @emotion/styled framer-motion
# OR
yarn add react-querybuilder @react-querybuilder/chakra @chakra-ui/icons @chakra-ui/react @chakra-ui/system @emotion/react @emotion/styled framer-motion
```

## Usage

```tsx
import QueryBuilder, { RuleGroupType } from 'react-querybuilder';
import {
  ChakraActionElement,
  ChakraDragHandle,
  ChakraNotToggle,
  ChakraValueEditor,
  ChakraValueSelector
} from '@react-querybuilder/chakra';

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
        addGroupAction: ChakraActionElement,
        addRuleAction: ChakraActionElement,
        cloneGroupAction: ChakraActionElement,
        cloneRuleAction: ChakraActionElement,
        combinatorSelector: ChakraValueSelector,
        fieldSelector: ChakraValueSelector,
        notToggle: ChakraNotToggle,
        operatorSelector: ChakraValueSelector,
        removeGroupAction: ChakraActionElement,
        removeRuleAction: ChakraActionElement,
        valueEditor: ChakraValueEditor,
        dragHandle: ChakraDragHandle
      }}
    />
  );
};
```

Some additional styling may be necessary, e.g.:

```scss
.chakra-select__wrapper {
  width: fit-content;
  width: -moz-fit-content; // vendor prefix required for Firefox
  display: inline-block;
}

.chakra-input {
  width: auto;
  display: inline-block;
}

.chakra-radio-group {
  display: inline-block;
}
```
