# Setup

## Install

```sh
npm i react-querybuilder                  # React UI (re-exports all of @react-querybuilder/core)
npm i @react-querybuilder/core            # server-only / non-React (no React dependency)
npm i @react-querybuilder/<ui-package>    # optional, see ui-packages.md
```

All `react-querybuilder` and `@react-querybuilder/*` packages must have the **same version**. UI packages peer-depend on an exact `react-querybuilder` version.

## CSS

```ts
import 'react-querybuilder/dist/query-builder.css';
```

- Also available: `query-builder-layout.css` (layout only, no colors/borders), plus `.scss` versions in `dist/`.
- UI packages still need this import, plus their own library CSS/provider (see [ui-packages](ui-packages.md)).
- Theming: override CSS custom properties / SCSS variables, or use `controlClassnames` for per-element classes.

## Minimal component

```tsx
import { useState } from 'react';
import { QueryBuilder } from 'react-querybuilder';
import type { Field, RuleGroupType } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const initialQuery: RuleGroupType = {
  combinator: 'and',
  rules: [{ field: 'firstName', operator: 'beginsWith', value: 'Stev' }],
};

export const App = () => {
  const [query, setQuery] = useState(initialQuery);
  return <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />;
};
```

## Controlled vs uncontrolled

| Mode         | Props                              | Notes                                                                     |
| ------------ | ---------------------------------- | ------------------------------------------------------------------------- |
| Controlled   | `query` + `onQueryChange`          | Pass `query` on **every** render once you start. Preferred for most apps. |
| Uncontrolled | `defaultQuery` (+ `onQueryChange`) | `defaultQuery` read on mount only.                                        |

- Never pass both `query` and `defaultQuery`.
- `onQueryChange` also fires on mount (with ids added). Disable with `enableMountQueryChange={false}`.
- Queries without a root `id` get ids generated automatically (`prepareRuleGroup`). Store what `onQueryChange` gives you, not your original object.

## Common props

Verify exact names/types against `QueryBuilderProps` in the installed `.d.ts`.

- **Option lists**: `fields`, `operators`, `combinators` (see [fields-and-operators](fields-and-operators.md)).
- **Display flags** (default `false`): `showCombinatorsBetweenRules`, `showNotToggle`, `showCloneButtons`, `showLockButtons`, `showMuteButtons`, `showShiftActions`, `showUngroupButtons`, `enableDragAndDrop` (needs `@react-querybuilder/dnd`).
- **Behavior flags**: `resetOnFieldChange` (default `true`), `resetOnOperatorChange`, `autoSelectField` (default `true`), `autoSelectOperator` (default `true`), `autoSelectValue`, `addRuleToNewGroups`, `listsAsArrays`, `parseNumbers`.
- **Getters**: `getOperators`, `getValueEditorType`, `getInputType`, `getValues`, `getValueSources`, `getDefaultField`, `getDefaultOperator`, `getDefaultValue`, `getRuleClassname`, `getRuleGroupClassname`.
- **Before-change hooks** (return `true` to proceed, `false` to cancel, or a replacement): `onAddRule`, `onAddGroup`, `onMoveRule`, `onMoveGroup`, `onGroupRule`, `onGroupGroup`, `onUngroup`, `onRemove` (boolean only).
- **Other**: `validator`, `disabled` (`boolean` or `Path[]`), `maxLevels`, `controlElements`, `controlClassnames`, `translations`, `context` (passed to all subcomponents), `idGenerator`, `debugMode` + `onLog`.
- `independentCombinators` is **deprecated and ignored**. IC mode is detected from the query shape.

## Lists as arrays

By default, multi-value operators (`in`, `notIn`, `between`, `notBetween`) and `multiselect` editors store comma-separated strings (`'a,b'`). Set `listsAsArrays` to store arrays (`['a', 'b']`). `formatQuery` accepts either.

## Querying state outside the component

- `useQueryManager(query?, options?)` returns `[query, manager]` (wraps core `QueryManager`).
- `useQueryBuilderQuery()` inside a custom subcomponent returns the current query.
- Undo/redo: wrap with `QueryBuilderHistory` from `react-querybuilder/history`.
