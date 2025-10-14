---
title: Migrating to v7 or v8
---

:::info Regarding version 8

Version 8 has no breaking changes from version 7, **except** for `@react-querybuilder/chakra`. If you're not using the Chakra UI package, you can upgrade from v7 to v8 without any code changes.

<details>
<summary>More information</summary>

- `@react-querybuilder/chakra@7` supports Chakra UI v2
- `@react-querybuilder/chakra@8` supports Chakra UI v3
- [`@react-querybuilder/chakra2`](https://npmjs.com/package/@react-querybuilder/chakra2) continues supporting Chakra UI v2
- Version 8 would have been a patch release if not for Chakra UI's breaking changes
- We maintain consistent version numbers across all packages, requiring the major version bump

</details>

:::

Version 7 requires minimal code changes when upgrading from v6. While [some defaults have changed](#updated-default-labels), most applications will work without modifications. To take advantage of [performance improvements](#performance-improvements) and [new features](#built-in-shift-actions), you may need minor refactoring.

> _Previous migration instructions: [v5 to v6](/docs/6/migrate) / [v4 to v5](/docs/5/migrate) / [v3 to v4](/docs/4/migrate)._

## Breaking changes

### React 18 required

React 18 is now the minimum supported version due to the `react-redux` v9 dependency.

### TypeScript 5.1+ required

The minimum TypeScript version is now 5.1. Component props remain largely unchanged, but their TypeScript interfaces have been overhauled. If you don't use generics in custom subcomponents, you likely won't need any TypeScript changes.

#### `QueryBuilder` props

The query type is now automatically inferred from your `query` or `defaultQuery` prop instead of the deprecated `independentCombinators` prop.

`QueryBuilderProps` now requires four generic arguments:

1. Query type (extending `RuleGroupType` or `RuleGroupTypeIC`)
2. Field type
3. Operator type
4. Combinator type

The latter three must extend `FullOption` or the more specific `FullField`/`FullOperator`/`FullCombinator`.

**Good news:** JSX components can usually infer these types automatically from your props, so most users won't need changes.

```tsx
// Valid in version 6:
const qbp6: QueryBuilderProps = {};

// Version 7 with the defaults (equivalent to the "version 6" line above):
const qbp7: QueryBuilderProps<RuleGroupType, FullField, FullOperator, FullCombinator> = {};

// Also valid in version 7 (since FullField, FullOperator, and FullCombinator all extend FullOption):
const qbp7a: QueryBuilderProps<RuleGroupType, FullOption, FullOption, FullOption> = {};
```

#### Option-type props

Custom subcomponents must now use `FullOption` extensions instead of `Option` for props like fields, operators, and values.

**Key differences:**

- `Full*` types require a `value` property (same type as `name`)
- `*ByValue` types make the `name` property optional
    <!-- prettier-ignore -->
  | Interface    | "Full\*" counterpart | "\*ByValue" counterpart |
  | ------------ | -------------------- | ----------------------- |
  | `Field`      | `FullField`          | `FieldByValue`          |
  | `Operator`   | `FullOperator`       | `OperatorByValue`       |
  | `Combinator` | `FullCombinator`     | `CombinatorByValue`     |
- The first generic argument of `ValueEditorProps`, `ValueSelectorProps`, and `FieldSelectorProps` must extend `FullOption` instead of `Option` as in version 6.
  - In the case of `ValueEditorProps` and `FieldSelectorProps`, prefer `FullField` over `FullOption`.
  - Where editor/selector prop type generics have been used, upgrading to version 7 should only require a minor update similar to this:
    ```diff
     type MyFieldNames = "firstName" | "lastName" | "birthdate";
    -const MyValueEditor = (props: ValueEditorProps<Field<MyFieldNames>>) => {
    +const MyValueEditor = (props: ValueEditorProps<FullField<MyFieldNames>>) => {
       //                                           ^ Field -> FullField
       return <ValueEditor {...props} />
    }
    ```

### Parser functions removed from main bundle

Parser functions are now only available as separate imports to reduce bundle size by ~50%. This affects infrequently-used utilities that were previously importable from the main package.

```diff
 // Version 6 only
-import { parseCEL } from "react-querybuilder"
-import { parseJsonLogic } from "react-querybuilder"
-import { parseMongoDB } from "react-querybuilder"
-import { parseSQL } from "react-querybuilder"

 // Version 6 or 7
+import { parseCEL } from "react-querybuilder/parseCEL"
+import { parseJsonLogic } from "react-querybuilder/parseJsonLogic"
+import { parseMongoDB } from "react-querybuilder/parseMongoDB"
+import { parseSQL } from "react-querybuilder/parseSQL"
 // (New in version 7)
+import { parseSpEL } from "react-querybuilder/parseSpEL"
+import { parseJSONata } from "react-querybuilder/parseJSONata"
```

### Miscellaneous

- **MUI:** `@react-querybuilder/material` uses `TextField` instead of `Input` (v7.7.0+)
- **Mantine:** Now requires Mantine 7+
- **JSON export:** `"json_without_ids"` format now preserves custom properties
- **MongoDB parser:** Generates more concise queries for `$not` operators
- **Types:** New `Path` type alias (same as `number[]`)
- **Independent combinators:** `RuleGroupTypeIC` ensures no `combinator` property
- **Hooks:** `useQueryBuilder` requires `QueryBuilderStateProvider` ancestor
- **Event handling:** `useStopEventPropagation` now takes single function parameter

## New features

### Performance improvements

:::tip TL;DR

Ensure all `QueryBuilder` props have stable references or are memoized.

:::

Version 7 aggressively memoizes props and components for better performance, especially with large queries. To benefit from this optimization:

- **Move static props outside your component** (like `fields` arrays)
- **Use `useMemo` and `useCallback`** for dynamic props
- **Avoid inline definitions** in JSX
- **Consider using `defaultQuery`** instead of `query` for uncontrolled behavior

```tsx
// ❌ BAD: Unstable references cause unnecessary re-renders
function App() {
  const { t } = useTranslation();
  const [query, setQuery] = useState();

  // Recreated on every render
  const getOperators = (field: Field) => t(defaultOperators);

  return (
    <QueryBuilder
      onQueryChange={q => setQuery(q)} // Inline function
      fields={[
        // Inline array
        { name: 'firstName', label: 'First Name' },
        { name: 'lastName', label: 'Last Name' },
      ]}
      getOperators={getOperators}
    />
  );
}

// ✅ GOOD: Stable references enable performance optimizations
const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

function App() {
  const { t } = useTranslation();
  const [query, setQuery] = useState();

  // Memoized with stable dependencies
  const getOperators = useCallback((field: Field) => t(defaultOperators), [t]);

  return (
    <QueryBuilder
      onQueryChange={setQuery} // State setter has stable reference
      fields={fields} // Defined outside component
      getOperators={getOperators} // Memoized
    />
  );
}
```

:::note State setters don't need memoization

`useState` and `useReducer` setters have stable references and don't need memoization. You can now pass them directly: `onQueryChange={setQuery}`.

:::

### Option lists now support `value` identifiers

Previously, option lists (fields, combinators, etc.) required a `name` property as the unique identifier. Version 7 also accepts `value` as the identifier, making it easier to integrate with libraries like [`react-select`](https://react-select.com/).

- If both `name` and `value` exist, `value` takes precedence
- `QueryBuilder` ensures both properties are present, making them equivalent if only one is provided
- Subcomponents can assume both properties will always be available

:::info Direct interface usage

When using `Field`, `Combinator`, and `Operator` interfaces directly, `name` is still required. Use `FlexibleOption` to avoid this requirement, though you'll lose IntelliSense for specific type properties.

:::

Field identifier types are now inferred from your `fields` prop when using narrowed string types. This provides better TypeScript support for custom components.

For example, `Field<MyFields>[]` will automatically type your subcomponents with `MyFields` instead of generic `string`, preventing type errors:

```tsx
type MyFields = 'firstName' | 'lastName' | 'birthDate';

const fields: Field<MyFields>[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'birthDate', label: 'Birth Date' },
];

function MyValueEditor(props: ValueEditorProps<FullField<MyFields>>) {
  if (props.field === 'invalid') {
    // TypeScript error: 'invalid' is not assignable to MyFields
    return null;
  }
  return <ValueEditor {...props} />;
}

function App() {
  return (
    <QueryBuilder
      fields={fields} // Types are automatically inferred
      controlElements={{ valueEditor: MyValueEditor }}
    />
  );
}
```

### Bulk component overrides

Two new "bulk override" properties simplify customization:

- **`actionElement`** - Sets the default for all button components
- **`valueSelector`** - Sets the default for all selector components

This lets you customize all buttons or all selectors at once instead of individually. Specific `controlElements` assignments override these bulk settings.

| `controlElements` property | Sets default for                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `valueSelector`            | `combinatorSelector`, `fieldSelector`, `operatorSelector`, `valueSourceSelector`, `valueEditor` (when rendering a value selector)                      |
| `actionElement`            | `addGroupAction`, `addRuleAction`, `cloneGroupAction`, `cloneRuleAction`, `lockGroupAction`, `lockRuleAction`, `removeGroupAction`, `removeRuleAction` |

These same two properties have also been added to the `controlClassnames` prop, but they add to, not replace, classnames declared for specific components.

### New query management methods

:::tip Quick summary

You no longer need to pass the query object via the `context` prop.

:::

Three new methods simplify query management from custom components:

| Method                              | Description                                                                                          |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `props.schema.getQuery()`           | Returns the current root query object. Use only in event handlers.                                   |
| `props.schema.dispatchQuery(query)` | Updates the internal query state and calls the `onQueryChange` callback. Use only in event handlers. |
| `useQueryBuilderQuery()`            | React Hook that returns the current root query object.                                               |
| `useQueryBuilderSelector(selector)` | Redux selector Hook for the internal store.                                                          |

**Notes:**

- Prefer `useQueryBuilderQuery` over `useQueryBuilderSelector`
- These use a custom Redux context internally
- Enable Redux DevTools by importing from `"react-querybuilder/debug"`
- The old `context` prop workaround is no longer needed

### New `insert` utility

The new [`insert`](./utils/misc#insert) utility inserts rules or groups at any position in the query hierarchy, unlike [`add`](./utils/misc#add) which only appends. Use `replace: true` to replace existing items.

### Separate layout stylesheet

Layout styles are now available separately as `query-builder-layout.css`/`.scss`. The main stylesheet includes both layout and decorative styles. Overall styling remains unchanged from version 6.

### Enhanced callback metadata

Most `get*` callbacks now receive a "meta" parameter containing `fieldData` - the complete `Field` object with custom properties. This eliminates the need to search for fields manually.

**Affected callbacks:** `getDefaultOperator`, `getDefaultValue`, `getInputType`, `getOperators`, `getRuleClassname`, `getValueEditorSeparator`, `getValueEditorType`, `getValues`, `getValueSources`

### Enhanced `formatQuery` rule processors

Custom rule processors for `formatQuery` now receive the full `Field` object when a `fields` array is provided. TypeScript now requires `label: string` on field objects (previously only `name` was required).

### Native PostgreSQL support

`formatQuery` now natively supports PostgreSQL with `numberedParams` and `paramPrefix: "$"`. No more manual post-processing of "?" placeholders.

### Built-in shift actions

The new [`showShiftActions`](./components/querybuilder#showshiftactions) prop adds up/down buttons for reordering rules without drag-and-drop. Hold <kbd>Alt</kbd>/<kbd>⌥ Option</kbd> while clicking to clone instead of move.

**Related additions:**

- [`ShiftActions`](./components/shiftactions) component for rendering shift buttons
- [`useShiftActions`](./utils/hooks#useshiftactions) hook with `shiftUp`/`shiftDown` methods
- New translation properties: `shiftActionUp` and `shiftActionDown`

### Accessibility improvements

Accessibility is improved with `title` attributes on rule group containers. Customize the text using the `accessibleDescriptionGenerator` prop.

### Enhanced drag-and-drop control

Drag-and-drop components now accept a `canDrop` callback to control where items can be dropped. The callback receives `dragging` and `hovering` objects with `path` information.

### Improved number parsing

The `parseNumber` function now uses [`numeric-quantity`](https://www.npmjs.com/package/numeric-quantity) for enhanced parsing. The new "enhanced" option ignores trailing invalid characters like "abc" in "123abc".

### New SpEL parser

New `parseSpEL` function converts [SpEL expressions](https://docs.spring.io/spring-framework/docs/3.0.x/reference/expressions.html) to query objects.

## Updated default labels

### Main package

| Key                              | Old        | New         | Notes                               |
| -------------------------------- | ---------- | ----------- | ----------------------------------- |
| `translations.addRule.label`     | `"+Rule"`  | `"+ Rule"`  | Space added between "+" and "Rule"  |
| `translations.addGroup.label`    | `"+Group"` | `"+ Group"` | Space added between "+" and "Group" |
| `translations.removeRule.label`  | `"x"`      | `"⨯"`       | HTML entity `&cross;` / `&#x2A2F;`  |
| `translations.removeGroup.label` | `"x"`      | `"⨯"`       | HTML entity `&cross;` / `&#x2A2F;`  |

### Compatibility packages

Compatibility packages now use `ReactNode` labels instead of just strings, displaying SVG icons from their design systems by default. Use `translations={defaultTranslations}` to revert to text labels.

#### Ant Design (`@react-querybuilder/antd`)

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

#### Bootstrap (`@react-querybuilder/bootstrap`)

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

#### Chakra UI (`@react-querybuilder/chakra`)

Chakra UI published its own icon package for version 2 ([`@chakra-ui/icons`](https://npmjs.com/package/@chakra-ui/icons)), but recommends [`react-icons`](https://www.npmjs.com/package/react-icons) for version 3. `@react-querybuilder/chakra` version 8 has been updated accordingly, using icons from `react-icons/fa` by default.

| Key                                    | Chakra UI v2 Icon<br />_(`@react-querybuilder/chakra@7`,<br />`@react-querybuilder/chakra2@*`)_ | Chakra UI v3 Icon<br />_(`@react-querybuilder/chakra@8`)_ |
| -------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `translations.dragHandle.label`        | `<DragHandleIcon />`<br />_(via `ChakraDragHandle`, not `translations`)_                        | `<FaGripVertical />`                                      |
| `translations.removeGroup.label`       | `<CloseIcon />`                                                                                 | `<FaTimes />`                                             |
| `translations.removeRule.label`        | `<CloseIcon />`                                                                                 | `<FaTimes />`                                             |
| `translations.cloneRuleGroup.label`    | `<CopyIcon />`                                                                                  | `<FaCopy />`                                              |
| `translations.cloneRule.label`         | `<CopyIcon />`                                                                                  | `<FaCopy />`                                              |
| `translations.lockGroup.label`         | `<UnlockIcon />`                                                                                | `<FaLockOpen />`                                          |
| `translations.lockRule.label`          | `<UnlockIcon />`                                                                                | `<FaLockOpen />`                                          |
| `translations.lockGroupDisabled.label` | `<LockIcon />`                                                                                  | `<FaLock />`                                              |
| `translations.lockRuleDisabled.label`  | `<LockIcon />`                                                                                  | `<FaLock />`                                              |
| `translations.shiftActionDown.label`   | `<ChevronDownIcon />`                                                                           | `<FaChevronDown />`                                       |
| `translations.shiftActionUp.label`     | `<ChevronUpIcon />`                                                                             | `<FaChevronUp />`                                         |

#### Fluent UI (`@react-querybuilder/fluent`)

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

#### MUI/Material (`@react-querybuilder/material`)

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
