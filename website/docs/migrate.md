---
title: Migrating to v7
---

Version 7 shouldn't require many—if any—code changes when migrating from v6, although [some of the defaults have changed](#updated-default-labels). Also, taking advantage of the [performance improvements](#performance-improvements), [new features](#shift-actions), and [other](#option-lists-can-use-value-as-identifiers-instead-of-name) [conveniences](#query-selector-getter-and-dispatcher) may require some minor refactoring. A summary of the important changes is below.

## Breaking changes

### No default export

`react-querybuilder` no longer has a default export. Use `import { QueryBuilder } from "react-querybuilder"` instead:

```diff
-import QueryBuilder from "react-querybuilder";
+import { QueryBuilder } from "react-querybuilder";
```

Or, if you named the default export something other than `QueryBuilder`, like `ReactQueryBuilder`:

```diff
-import ReactQueryBuilder from "react-querybuilder";
+import { QueryBuilder as ReactQueryBuilder } from "react-querybuilder";
```

### `QueryBuilder` prop types

The props themselves for the main component haven't changed much from version 6, but the TypeScript interface has been overhauled. Also, the minimum TypeScript version is now 5.1.

Notable changes:

- The query type, extending either `RuleGroupType` or `RuleGroupTypeIC`, will be automatically inferred instead of relying on the now-deprecated (and ignored) `independentCombinators` prop. See [independent combinators](./components/querybuilder#independent-combinators).
- The `QueryBuilderProps` type now requires four generic arguments.
  - This shouldn't affect JSX which renders a `<QueryBuilder />` component since the generic types can almost always be inferred from the props.
  - While all props are technically still optional, TypeScript may have problems inferring the generics if `fields` and `query`/`defaultQuery` are not provided.
  - When manually creating an object of type `QueryBuilderProps`, all four generics must be provided. In order, they represent the query type (extending `RuleGroupType` or `RuleGroupTypeIC`), the field type (extending `Field`), the operator type (extending `Operator`), and the combinator type (extending `Combinator`).
  ```tsx
  // Valid in version 6:
  const qbp6: QueryBuilderProps = {};
  // Version 7 with the defaults (equivalent to the "version 6" line above):
  const qbp7: QueryBuilderProps<RuleGroupType, Field, Operator, Combinator> = {};
  // Also valid in version 7 (since Field, Operator, and Combinator all extend Option):
  const qbp7a: QueryBuilderProps<RuleGroupType, Option, Option, Option> = {};
  ```

### Parser functions removed from main bundle

Since the parser functions are used less frequently than other utility functions—and generally not used together—they have been removed from the main export. They have been available as separate exports for some time now (along with [`formatQuery`](./utils/export) and [`transformQuery`](./utils/misc#transformquery)), but before version 7 they could still be imported from `"react-querybuilder"`. They are now available _only_ as separate exports. (This reduces the main bundle size by roughly 50%.)

<table>
<thead>
<tr>
<th>Function</th>
<th>V7 <code>import</code> udpate</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>parseCEL</code></td>
<td>

```diff
-import { parseCEL } from "react-querybuilder"
+import { parseCEL } from "react-querybuilder/parseCEL"
```

</td>
</tr>
<tr>
<td><code>parseJsonLogic</code></td>
<td>

```diff
-import { parseJsonLogic } from "react-querybuilder"
+import { parseJsonLogic } from "react-querybuilder/parseJsonLogic"
```

</td>
</tr>
<tr>
<td><code>parseMongoDB</code></td>
<td>

```diff
-import { parseMongoDB } from "react-querybuilder"
+import { parseMongoDB } from "react-querybuilder/parseMongoDB"
```

</td>
</tr>
<tr>
<td><code>parseSQL</code></td>
<td>

```diff
-import { parseSQL } from "react-querybuilder"
+import { parseSQL } from "react-querybuilder/parseSQL"
```

</td>
</tr>

</tbody>
</table>

### JSON without identifiers

The `"json_without_ids"` export format now explicitly removes the `id` and `path` properties from the output, leaving all other properties unchanged. Previously this format would only _include_ specific properties which had the effect of removing any non-standard properties. The following command will replicate the previous behavior:

```ts
JSON.stringify(query, ['rules', 'field', 'value', 'operator', 'combinator', 'not', 'valueSource']);
```

### Miscellaneous

- `@react-querybuilder/mantine` now requires Mantine v7+.
- `parseMongoDB` now generates more concise queries when it encounters `$not` operators that specify a single, boolean condition. Whereas previously that would yield a group with `not: true`, now it generates a rule with a negated operator (`"="` becomes `"!="`, `"contains"` becomes `"doesNotContain"`, etc.). To prevent this behavior, set the `preventOperatorNegation` option to `true`.
- Paths are now declared with a new type alias `Path` instead of `number[]`. The actual type is the same: `type Path = number[]`.
- The `RuleGroupTypeIC` type now includes `combinator?: undefined` to ensure that query objects intended for use in query builders where `independentCombinators` is enabled do not contain `combinator` properties.
- The `useQueryBuilder` hook has been split into `useQueryBuilderSetup` and `useQueryBuilderSchema`. `useQueryBuilderSchema` must be called from a child component of one that calls `useQueryBuilderSetup` (`QueryBuilder` takes care of that internally). For example usage, see the [`QueryBuilder` source code](https://github.com/react-querybuilder/react-querybuilder/blob/main/packages/react-querybuilder/src/components/QueryBuilder.tsx).
- The `useStopEventPropagation` hook, called from the default `Rule` and `RuleGroup` components, now takes a single function as its parameter instead of an object map of functions. It must be run for each wrapped function individually.

## New features

### Performance improvements

In version 7, internal state is managed in a custom Redux context. Props, components, and derived values are aggressively memoized using `React.memo`, `useMemo`, and `useCallback`. These changes can noticeably improve rendering performance for large queries, especially when using certain style libraries. To take advantage of this change, _every_ prop except `query` must be memoized or have a stable reference.

The most common violation of that requirement is probably inline arrow functions in the `onQueryChange` prop (something like `<QueryBuilder onQueryChange={q => setQuery(q)} />`). This can usually be addressed by memoizing the change handler function with `useCallback`, or, if possible, by moving the change handler definition outside the component rendering function.

If you're using a state setter function generated by `useState` or `useReducer`, you don't need to memoize it. Relatedly, TypeScript no longer throws an error in version 7 if you pass the setter function directly like `onQueryChange={setQuery}`. Version 6 and earlier required a wrapper function like `onQueryChange={q => setQuery(q)}`.

### Option lists can use `value` as identifiers instead of `name`

Previously, props and properties that accepted an `OptionList` type or extension thereof (`fields`, `combinators`, etc.) required a `name` property as the unique identifier for each member within the list. In version 7, list members may specify a `value` property as their identifier instead of `name`. If both `name` and `value` properties are present for a given item, `value` will take precedence. All option list members will be augmented to contain equivalent `name` and `value` properties if only one is provided, so subcomponents can always assume both will be present. **NOTE**: The `Field`, `Combinator`, and `Operator` types, which extend `Option`, still require a `name` property when used directly. You can use the `FlexibleOption` type instead to avoid the `name` property requirement, but you will lose intellisense for the additional properties of the more specific types.

Relatedly, field identifier types (`name`/`value` properties) will now be inferred from the `fields` prop if they have been narrowed from `string`. These narrowed types will be applied to subcomponents and other props that take fields or field identifiers as arguments/props. For example, if the `fields` prop is type `Field<MyFields>[]`, then the `fieldSelector` property of the `controlElements` prop will be inferred as `ComponentType<FieldSelectorProps<MyFields>>` instead of the default `ComponentType<FieldSelectorProps<string>>`.

### Bulk override action and value selector components

Two "bulk override" properties have been added to the [`controlElements`](./components/querybuilder#controlelements) prop: [`actionElement`](./components/querybuilder#actionelement) and [`valueSelector`](./components/querybuilder#valueselector). When `actionElement` is defined, it will be used for each component that defaults to `ActionElement` (as long as that component is not explicitly overridden in the `controlElements` prop). The same is true for `valueSelector` and components that default to `ValueSelector` (including `ValueEditor` in cases where it renders a value selector). This makes it possible to define replacement components for all buttons and selectors at once instead of one-by-one.

### Query selector, getter, and dispatcher

Three new methods are available that should make it easier to manage arbitrary query updates from custom components. The first two methods are available from the `schema` prop which is passed to every component, and should only be used in event handlers. The third is a React Hook and should follow the [appropriate rules](https://react.dev/warnings/invalid-hook-call-warning).

- `getQuery()`: returns the current root query object.
- `dispatchQuery(query)`: updates the internal state and calls the `onQueryChange` callback with the provided query. Previously, updates that couldn't be performed with the `handleOnChange` or `handleOnClick` callbacks had to use external state management in conjunction with the [`add`](./utils/misc#add)/[`update`](./utils/misc#update)/[`remove`](./utils/misc#remove) utilities.
- `useQueryBuilderSelector(selector)`: generate the selector with `getQuerySelectorById(props.schema.qbId)`.

Notes:

- These functions use a custom [Redux](https://redux.js.org/) context behind the scenes.
- Previously we recommended including the query object as a property of the `context` prop. That workaround is no longer necessary.

### Field data passed to `get*` callbacks

Most of the `get*` callback props now receive an additional "meta" parameter with a `fieldData` property (more properties may be added to the "meta" object in the future). `fieldData` is the full `Field` object from the `fields` array for the given `field` name, including any custom properties (a common one is `datatype`). This eliminates the need to find the field object based solely on the field's `name` within the `get*` functions themselves. Instead of something like `fields.find(f => f.name === field)`, you can retrieve `fieldData` from the last parameter.

The following callback props provide the new "meta" parameter: `getDefaultOperator`, `getDefaultValue`, `getInputType`, `getOperators`, `getRuleClassname`, `getValueEditorSeparator`, `getValueEditorType`, `getValues`, and `getValueSources`.

### Field data passed to `formatQuery` rule processors

- Custom rule processors for `formatQuery` now receive the full `Field` object in the options parameter, as long as a `fields` array is provided alongside `ruleProcessor`. In TypeScript, the member type of the `fields` array now requires a `label: string` property (just like `QueryBuilder`'s `fields` prop). Previously, only `name` was required.

### Shift actions

A new `showShiftActions` prop provides first class support for rearranging rules within a query without enabling drag-and-drop. When `showShiftActions` is `true`, two buttons will appear at the front of each rule and group (except the root group), stacked vertically by default. The first/upper button will shift the rule or group one spot higher, while the second/lower button will shift it one spot lower. Pressing the modifier key (`Alt` on Windows/Linux, `Option`/`⌥` on Mac) while clicking will clone the rule/group instead of just moving it.

Related additions:

- `ShiftActions` component (with a corresponding component in each compatibility package) that renders "shift up" and "shift down" action buttons. The default styles remove the border and background from these buttons, leaving only the `shiftActionUp.label`/`shiftActionDown.label` translation properties visible.
- `useShiftActions` hook, called by the `ShiftActions` component, returns `shiftUp`/`shiftDown` methods and determines whether either button should be disabled. (Within the root group, "shift up" is disabled for the very first rule or group and "shift down" is disabled for the very last rule or group).
- New properties on the `translations` prop: `shiftActionUp` and `shiftActionDown`.

### Accessibility

Accessibility is improved with the addition of a `title` attribute to the outermost `<div>` of each rule group. The text of this attribute can be customized with the `accessibleDescriptionGenerator` function prop. The default implementation is exported as [generateAccessibleDescription](https://github.com/react-querybuilder/react-querybuilder/blob/main/packages/react-querybuilder/src/utils/generateAccessibleDescription.ts).

### Drag-and-drop `canDrop` callback

`<QueryBuilderDnD />` and `<QueryBuilderDndWithoutProvider />` from `@react-querybuilder/dnd` now accept a `canDrop` function prop. If provided, the function will be called when dragging a rule or group. The only parameter will be an object containing the dragged `item` (type `{ path: Path }`) and the `path` of the rule/group over which the dragged item is hovering. If `canDrop` returns `false`, dropping the item at its current position will have no effect on the query. If `canDrop` returns `true`, the normal rules will apply.

### Enhanced `parseNumber` behavior

The `parseNumber` function now delegates parsing to [`numeric-quantity`](https://www.npmjs.com/package/numeric-quantity) (essentially an enhanced version of `parseFloat`). The default behavior has not changed, but a new "enhanced" option will ignore trailing invalid characters (e.g., the "abc" in "123abc"). This matches the bahavior of the "native" option, which uses `parseFloat` directly, except it returns the original string when parsing fails instead of `NaN`.

## Updated default labels

### Main package

| Key                              | Old        | New         | Notes                               |
| -------------------------------- | ---------- | ----------- | ----------------------------------- |
| `translations.addRule.label`     | `"+Rule"`  | `"+ Rule"`  | Space added between "+" and "Rule"  |
| `translations.addGroup.label`    | `"+Group"` | `"+ Group"` | Space added between "+" and "Group" |
| `translations.removeRule.label`  | `"x"`      | `"⨯"`       | HTML entity `&cross;` / `&#x2A2F;`  |
| `translations.removeGroup.label` | `"x"`      | `"⨯"`       | HTML entity `&cross;` / `&#x2A2F;`  |

### Compatibility packages

Several compatibility packages take advantage of the new ability to use a `ReactNode` as a `label` (previously only `string`s were allowed). These packages override the default `label` for non-text components (`lock*`, `clone*`, `remove*`, and `dragHandle`) with SVG icons from their official icon packages. This brings them more in line with their respective design systems by default. To avoid using the icons, use `translations={defaultTranslations}`.

#### `@react-querybuilder/antd`

Icon package: [`@ant-design/icons`](https://npmjs.com/package/@ant-design/icons)

| Key                                    | Icon                 |
| -------------------------------------- | -------------------- |
| `translations.removeGroup.label`       | `<CloseOutlined />`  |
| `translations.removeRule.label`        | `<CloseOutlined />`  |
| `translations.cloneRule.label`         | `<CopyOutlined />`   |
| `translations.cloneRuleGroup.label`    | `<CopyOutlined />`   |
| `translations.lockGroup.label`         | `<UnlockOutlined />` |
| `translations.lockRule.label`          | `<UnlockOutlined />` |
| `translations.lockGroupDisabled.label` | `<LockOutlined />`   |
| `translations.lockRuleDisabled.label`  | `<LockOutlined />`   |
| `translations.shiftActionUp.label`     | `<UpOutlined />`     |
| `translations.shiftActionDown.label`   | `<DownOutlined />`   |

#### `@react-querybuilder/bootstrap`

Icon package: [`bootstrap-icons`](https://npmjs.com/package/bootstrap-icons)

> _Note: The `BootstrapDragHandle` component has been removed. It is unnecessary now that the default drag handle component can accept a `ReactNode` as its `label`._

| Key                                    | Icon                                           |
| -------------------------------------- | ---------------------------------------------- |
| `translations.removeGroup.label`       | `<i className="bi bi-x" />`                    |
| `translations.removeRule.label`        | `<i className="bi bi-x" />`                    |
| `translations.cloneRule.label`         | `<i className="bi bi-copy" />`                 |
| `translations.cloneRuleGroup.label`    | `<i className="bi bi-copy" />`                 |
| `translations.dragHandle.label`        | `<i className="bi bi-grip-vertical" />`        |
| `translations.lockGroup.label`         | `<i className="bi bi-unlock" />`               |
| `translations.lockRule.label`          | `<i className="bi bi-unlock" />`               |
| `translations.lockGroupDisabled.label` | `<i className="bi bi-lock" />`                 |
| `translations.lockRuleDisabled.label`  | `<i className="bi bi-lock" />`                 |
| `translations.shiftActionUp.label`     | `<i className="bi bi-chevron-compact-up" />`   |
| `translations.shiftActionDown.label`   | `<i className="bi bi-chevron-compact-down" />` |

#### `@react-querybuilder/chakra`

Icon package: [`@chakra-ui/icons`](https://npmjs.com/package/@chakra-ui/icons)

| Key                                    | Icon                  |
| -------------------------------------- | --------------------- |
| `translations.removeGroup.label`       | `<CloseIcon />`       |
| `translations.removeRule.label`        | `<CloseIcon />`       |
| `translations.cloneRuleGroup.label`    | `<CopyIcon />`        |
| `translations.cloneRule.label`         | `<CopyIcon />`        |
| `translations.lockGroup.label`         | `<UnlockIcon />`      |
| `translations.lockRule.label`          | `<UnlockIcon />`      |
| `translations.lockGroupDisabled.label` | `<LockIcon />`        |
| `translations.lockRuleDisabled.label`  | `<LockIcon />`        |
| `translations.shiftActionDown.label`   | `<ChevronDownIcon />` |
| `translations.shiftActionUp.label`     | `<ChevronUpIcon />`   |

#### `@react-querybuilder/fluent`

Icon package: [`@fluentui/react-icons-mdl2`](https://npmjs.com/package/@fluentui/react-icons-mdl2)

| Key                                    | Icon                          |
| -------------------------------------- | ----------------------------- |
| `translations.removeGroup.label`       | `<CancelIcon />`              |
| `translations.removeRule.label`        | `<CancelIcon />`              |
| `translations.cloneRule.label`         | `<DuplicateRowIcon />`        |
| `translations.cloneRuleGroup.label`    | `<DuplicateRowIcon />`        |
| `translations.dragHandle.label`        | `<GripperDotsVerticalIcon />` |
| `translations.lockGroup.label`         | `<UnlockIcon />`              |
| `translations.lockRule.label`          | `<UnlockIcon />`              |
| `translations.lockGroupDisabled.label` | `<LockIcon />`                |
| `translations.lockRuleDisabled.label`  | `<LockIcon />`                |
| `translations.shiftActionDown.label`   | `<ChevronDownIcon />`         |
| `translations.shiftActionUp.label`     | `<ChevronUpIcon />`           |

#### `@react-querybuilder/material`

Icon package: [`@mui/icons-material`](https://npmjs.com/package/@mui/icons-material)

| Key                                    | Icon              |
| -------------------------------------- | ----------------- |
| `translations.removeGroup.label`       | `<Close />`       |
| `translations.removeRule.label`        | `<Close />`       |
| `translations.cloneRule.label`         | `<ContentCopy />` |
| `translations.cloneRuleGroup.label`    | `<ContentCopy />` |
| `translations.lockGroup.label`         | `<LockOpen />`    |
| `translations.lockRule.label`          | `<LockOpen />`    |
| `translations.lockGroupDisabled.label` | `<Lock />`        |
| `translations.lockRuleDisabled.label`  | `<Lock />`        |
| `translations.shiftActionDown.label`   | `<ShiftDown />`   |
| `translations.shiftActionUp.label`     | `<ShiftUp />`     |

<!-- TODO: Use the commented line once v7 docs have been versioned -->

Instructions on migrating from v5 to v6 are [here](/docs/migrate).

<!-- Instructions on migrating from v5 to v6 are [here](/docs/6/migrate). -->
