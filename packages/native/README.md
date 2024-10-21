## @react-querybuilder/native

Official [react-querybuilder](https://npmjs.com/package/react-querybuilder) compatibility package for [React Native](https://reactnative.dev/).

- [Full documentation](https://react-querybuilder.js.org/)
- [CodeSandbox](https://react-querybuilder.js.org/sandbox?t=native) / [StackBlitz](https://react-querybuilder.js.org/sandbox?p=stackblitz&t=native) example projects

## Installation

```bash
npm i react-querybuilder @react-querybuilder/native
# OR yarn add / pnpm add / bun add
```

## Usage

To render a React Native-compatible query builder, use `QueryBuilderNative`.

```tsx
import { QueryBuilderNative } from '@react-querybuilder/native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { type Field, formatQuery, type RuleGroupType } from 'react-querybuilder';

const styles = StyleSheet.create({
  outer: { padding: 10, gap: 20 },
  code: { fontFamily: 'monospace' },
});

const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

export function App() {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <View style={styles.outer}>
      <QueryBuilderNative fields={fields} query={query} onQueryChange={setQuery} />
      <Text style={styles.code}>{formatQuery(query, 'sql')}</Text>
    </View>
  );
}
```

`QueryBuilderNative` accepts the same props `QueryBuilder` and assigns the following props by default.

| Export                         | `QueryBuilder` prop                |
| ------------------------------ | ---------------------------------- |
| `defaultNativeControlElements` | `controlElements`                  |
| `NativeActionElement`          | `controlElements.actionElement`    |
| `NativeInlineCombinator`       | `controlElements.inlineCombinator` |
| `NativeNotToggle`              | `controlElements.notToggle`        |
| `NativeShiftActions`           | `controlElements.shiftActions`     |
| `NativeValueEditor`            | `controlElements.valueEditor`      |
| `NativeValueSelector`          | `controlElements.valueSelector`    |
| `RuleGroupNative`              | `controlElements.ruleGroup`        |
| `RuleNative`                   | `controlElements.rule`             |

For `react-native-web`, assign `defaultNativeWebControlElements` to `controlElements` as in the example above.

| Export                            | `QueryBuilder` prop             |
| --------------------------------- | ------------------------------- |
| `defaultNativeWebControlElements` | `controlElements`               |
| `NativeValueEditorWeb`            | `controlElements.valueEditor`   |
| `NativeValueSelectorWeb`          | `controlElements.valueSelector` |
