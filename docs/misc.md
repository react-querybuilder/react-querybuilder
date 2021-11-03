---
title: Miscellaneous
sidebar_position: 8
---

import TypeScriptAdmonition from './_ts_admonition.md'

<TypeScriptAdmonition />

## Utilities

### `defaultValidator`

```ts
function defaultValidator(query: RuleGroupType): {
  [id: string]: { valid: boolean; reasons?: string[] };
};
```

Pass `validator={defaultValidator}` to automatically validate groups (rules will be ignored). A group will be marked invalid if either 1) it has no child rules or groups (`query.rules.length === 0`), or 2) it has a missing/invalid `combinator` and more than one child rule or group (`rules.length >= 2`). You can see an example of the default validator in action in the [demo](https://react-querybuilder.github.io/react-querybuilder/) -- empty groups will have bold text on the "+Rule" button and a description of the situation where the rules normally appear.

### `findPath`

```ts
function findPath(path: number[], query: RuleGroupType): RuleType | RuleGroupType;
```

`findPath` is a utility function for finding the rule or group within the query hierarchy that has a given `path`. Useful in custom [`onAddRule`](#onAddRule) and [`onAddGroup`](#onAddGroup) functions.

### Defaults

The following default configuration objects are exported for convenience.

- `defaultCombinators`
- `defaultOperators`
- `defaultTranslations`
- `defaultValueProcessor`

The following components are also exported:

- `ActionElement` - used for action buttons (to add rules, remove groups, etc.)
- `NotToggle` - used for the "Invert this group" toggle switch
- `ValueEditor` - the default `valueEditor` component
- `ValueSelector` - used for drop-down lists (combinator, field, and operator selectors)
