---
title: Migrating to v7
---

Version 7 shouldn't require many—if any—code changes when migrating from v6, although [some of the defaults have changed](#updated-default-labels). Also, taking advantage of the [performance improvements](#performance-improvements), [new features](#shift-actions), and [other](#option-list-value-identifiers) [conveniences](#query-selector-getter-and-dispatcher) may require some minor refactoring. A summary of the important changes is below.

> _Previous migration instructions: [v5 to v6](/docs/6/migrate) / [v4 to v5](/docs/5/migrate) / [v3 to v4](/docs/4/migrate)._

## Breaking changes

### React 18

- The minimum React version is now 18. (This is due to the new `react-redux` v9 dependency, but we're investigating ways to support React 16.8 and 17.)

### TypeScript updates

- The minimum TypeScript version is now 5.1.
- The component props themselves haven't changed much from version 6, but their TypeScript interfaces have been overhauled.
- If you haven't specified generics on the prop interfaces for your custom subcomponents, you may not need to make any TypeScript-related changes.

#### `QueryBuilder` props

- The query type (extending `RuleGroupType` or `RuleGroupTypeIC`) will be automatically inferred from the `query` or `defaultQuery` prop instead of relying on the now-deprecated (and ignored) `independentCombinators` prop. See [independent combinators](./components/querybuilder#independent-combinators).
- `QueryBuilderProps` now requires four generic arguments.

  - This shouldn't affect JSX which renders a `<QueryBuilder />` component since the generic types can almost always be inferred from the props.
  - While all props are technically still optional, TypeScript may have problems inferring the generics if `fields` and `query`/`defaultQuery` are not provided.
  - The four generic arguments of `QueryBuilderProps` represent, respectively, the query type (extending `RuleGroupType` or `RuleGroupTypeIC`), the field type, the operator type, and the combinator type. The latter three must extend `FullOption` or the more specific and expressive `FullField`/`FullOperator`/`FullCombinator`.

  ```tsx
  // Valid in version 6:
  const qbp6: QueryBuilderProps = {};

  // Version 7 with the defaults (equivalent to the "version 6" line above):
  const qbp7: QueryBuilderProps<RuleGroupType, FullField, FullOperator, FullCombinator> = {};

  // Also valid in version 7 (since FullField, FullOperator, and FullCombinator all extend FullOption):
  const qbp7a: QueryBuilderProps<RuleGroupType, FullOption, FullOption, FullOption> = {};
  ```

#### `Option`-type props

- Custom subcomponents must now accept any option-type props (fields, operators, values, etc.) as an extension of `FullOption` instead of `Option`.
  - `Full*` types are identical to their version 6 counterparts except for the `value` property, which is required and must be the same type as the `name` property.
  - `*ByValue` types are identical to their `Full*` counterparts except that the `name` property is optional.
  - Relevant interfaces include the following:
    <!-- prettier-ignore -->
    | Interface    | "Full*" counterpart | "*ByValue" counterpart |
    | ------------ | ------------------- | ---------------------- |
    | `Field`      | `FullField`         | `FieldByValue`         |
    | `Operator`   | `FullOperator`      | `OperatorByValue`      |
    | `Combinator` | `FullCombinator`    | `CombinatorByValue`    |
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

Since the [parser functions](./utils/import) are used less frequently than other utility functions—and not generally alongside each other—they have been removed from the main export. Although these functions have been available as separate exports since version 6 (along with [`formatQuery`](./utils/export) and [`transformQuery`](./utils/misc#transformquery)), they could still be imported from `"react-querybuilder"`. They are now available _only_ as separate exports. (This change reduced the main bundle size by almost 50%.)

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
```

### Miscellaneous

- `@react-querybuilder/mantine` now requires Mantine 7 or greater.
- The `"json_without_ids"` export format now explicitly removes the `id` and `path` properties from the output wihtout removing other properties. Previously this format would only _include_ specific properties, removing any custom properties. The following command will replicate the previous behavior:
  <!-- prettier-ignore -->
  ```ts
  JSON.stringify(query, ['rules', 'field', 'value', 'operator', 'combinator', 'not', 'valueSource']);
  ```
- `parseMongoDB` now generates more concise queries when it encounters `$not` operators that specify a single, boolean condition. Whereas previously that would yield a rule group with `not: true`, it now generates a rule with a negated operator (`"="` becomes `"!="`, `"contains"` becomes `"doesNotContain"`, etc.). To prevent this behavior, set the `preventOperatorNegation` option to `true`. (This change does not apply to operators defined in the `additionalOperators` option.)
- Paths are now declared with a new type alias `Path` instead of `number[]`. The actual type is the same: `type Path = number[]`.
- The `RuleGroupTypeIC` interface now includes `combinator?: undefined` to ensure that query objects implementing [independent combinators](./components/querybuilder#independent-combinators) do not contain `combinator` properties.
- The `useQueryBuilder` hook has been split into `useQueryBuilderSetup` and `useQueryBuilderSchema`. `useQueryBuilderSchema` must be called from a child component of one that calls `useQueryBuilderSetup` (`QueryBuilder` takes care of that internally). For example usage, see the [`QueryBuilder` source code](https://github.com/react-querybuilder/react-querybuilder/blob/main/packages/react-querybuilder/src/components/QueryBuilder.tsx).
- The `useStopEventPropagation` hook, called from the default `Rule` and `RuleGroup` components, now takes a single function as its parameter instead of an object map of functions. It must be run for each wrapped function individually.

## New features

### Performance improvements

:::tip TL;DR

Each prop passed to `QueryBuilder` should have a stable reference or be memoized.

:::

Props, components, and derived values are aggressively memoized in version 7 with `React.memo`, `useMemo`, and `useCallback`. This can noticeably improve rendering performance for large queries, especially when using certain style libraries. To take advantage of this change, _every_ prop (except `query`, if used) must have a stable reference or at least be memoized. For related reasons, we encourage using `QueryBuilder` as an uncontrolled component by specifying `defaultQuery` instead of `query`.

You can avoid unstable references by moving unchanging props, including object, array, and function definitions, outside the component rendering function. This commonly includes the `fields` array and `onQueryChange` callback. For props that _must_ be defined inside the component, memoize them with `useMemo` or `useCallback`. Particularly avoid defining props inline in the JSX.

```tsx
/**
 * BAD:
 */
function App() {
  const { t } = useTranslation(); // (<-- third-party i18n library)
  const [query, setQuery] = useState();

  // This function gets recreated on each render
  const getOperators = (field: Field) => t(defaultOperators);

  return (
    <QueryBuilder
      // Avoid inline function definitions
      onQueryChange={q => setQuery(q)}
      // Avoid inline array definitions
      fields={[
        { name: 'firstName', label: 'First Name' },
        { name: 'lastName', label: 'Last Name' },
      ]}
      // See above
      getOperators={getOperators}
    />
  );
}

/**
 * GOOD:
 */
// Fields array never changes, so it can be defined outside the component
const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];
function App() {
  const { t } = useTranslation(); // (<-- third-party i18n library)
  const [query, setQuery] = useState();

  // Memoize functions with useCallback. Since `t` (probably) has a
  // stable reference, this function will rarely be recreated, if ever
  const getOperators = useCallback((field: Field) => t(defaultOperators), [t]);

  return (
    <QueryBuilder
      // React useState/useReducer setters always have stable references,
      // even when defined within the render method
      onQueryChange={setQuery}
      // See above
      fields={fields}
      // See above
      getOperators={getOperators}
    />
  );
}
```

:::note

If you're using a state setter function generated by `useState` or `useReducer`, you don't need to memoize it. Relatedly, TypeScript no longer throws an error in version 7 if you pass the setter function directly (`onQueryChange={setQuery}`), as long as you're not specifying generics on the query type. Version 6 and earlier required the `onQueryChange` prop to be explicitly typed as `(q: RuleGroupType) => void`.

:::

### Option list `value` identifiers

In all prior versions of React Query Builder, props and properties that accepted an `OptionList` array or extension thereof (such as `fields`, `combinators`, etc.) required a `name` property as the unique identifier for each member within the list. In version 7, list members may use a `value` property as their unique identifier instead of `name`. If both `name` and `value` are present for a given item, `value` will take precedence. This should make it easier to integrate libraries like [`react-select`](https://react-select.com/) that expect options to extend `{ value: string; label: string; }`.

`QueryBuilder` will ensure that all option list members have both `name` _and_ `value` properties, and will make them equivalent if only one is provided. Therefore, all subcomponents can assume both properties will be present in their option list props.

:::info

The `Field`, `Combinator`, and `Operator` interfaces, which extend `Option`, still require a `name` property when used directly. You can use the `FlexibleOption` type instead to avoid the `name` property requirement, but you will lose intellisense for the additional properties of the more specific types.

:::

Field identifier types (`name`/`value` properties) will now be inferred from the `fields` prop if they have been narrowed from `string`. These narrowed types will be applied to subcomponents and other props that take fields or field identifiers as arguments/props. For example, if the `fields` prop is type `Field<MyFields>[]`, then the `fieldSelector` property of the `controlElements` prop will be inferred as `ComponentType<FieldSelectorProps<FullField<MyFields>>>` instead of the default `ComponentType<FieldSelectorProps<FullField<string>>>`. This allows subcomponents themselves to be defined with narrowed identifier types without TypeScript complaining about `string` not being assignable to the narrowed type.

Below is an example of a custom value editor with a narrowed field identifier type:

```tsx
type MyFields = 'firstName' | 'lastName' | 'birthDate';
const fields: Field<MyFields>[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'birthDate', label: 'Birth Date' },
];
function MyValueEditor(props: ValueEditorProps<FullField<MyFields>>) {
  if (props.field === 'invalid') {
    // ^ TypeScript error: `MyFields` and `invalid` have no overlap
    return null;
  }
  return <ValueEditor {...props} />;
}
function App() {
  return (
    <QueryBuilder
      // Narrowed field identifier type inferred here:
      fields={fields}
      // No TypeScript error here, even though MyValueEditor
      // has a narrowed field identifier type.
      controlElements={{ valueEditor: MyValueEditor }}
    />
  );
}
```

### Bulk override action elements, value selectors

Two "bulk override" properties have been added to the [`controlElements`](./components/querybuilder#controlelements) prop: [`actionElement`](./components/querybuilder#actionelement) and [`valueSelector`](./components/querybuilder#valueselector). When `actionElement` is defined, it will be used for every component that defaults to [`ActionElement`](./components/actionelement). The same is true for `valueSelector` and components that default to [`ValueSelector`](./components/valueselector), including [`ValueEditor`](./components/valueeditor) in cases where it renders a value selector. This makes it possible to define custom components for all buttons and all selectors at once instead of one-by-one. Assignments to the more specific `controlElements` properties will take precedence over the bulk overrides.

| `controlElements` property | Sets default for                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `valueSelector`            | `combinatorSelector`, `fieldSelector`, `operatorSelector`, `valueSourceSelector`, `valueEditor` (when rendering a value selector)                      |
| `actionElement`            | `addGroupAction`, `addRuleAction`, `cloneGroupAction`, `cloneRuleAction`, `lockGroupAction`, `lockRuleAction`, `removeGroupAction`, `removeRuleAction` |

### Query selector, getter, and dispatcher

:::tip TL;DR

Passing the query object to subcomponents using the `context` prop is no longer necessary or recommended.

:::

Three new methods are available that should make it easier to manage arbitrary query updates from custom components. The first two methods are available on the `schema` prop which is passed to every component, and should only be used in event handlers. The third is a React Hook and should follow the [appropriate rules](https://react.dev/warnings/invalid-hook-call-warning).

| Method                              | Description                                                                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `props.schema.getQuery()`           | Returns the current root query object. Use only in event handlers.                                                           |
| `props.schema.dispatchQuery(query)` | Updates the internal query state and calls the `onQueryChange` callback. Use only in event handlers.                         |
| `useQueryBuilderSelector(selector)` | React Hook that returns the current root query object. Generate the selector with `getQuerySelectorById(props.schema.qbId)`. |

Notes:

- These functions all use a custom [Redux](https://redux.js.org/) context behind the scenes, hence the "selector" nomenclature.
- Previously, updates that couldn't be performed with `handleOnChange` or `handleOnClick` event handlers had to use external state management in conjunction with the [`add`](./utils/misc#add)/[`update`](./utils/misc#update)/[`remove`](./utils/misc#remove) utilities. To support this, we recommended including the query object as a property of the `context` prop. That workaround is no longer necessary or recommended.

### Standalone layout stylesheet

Default layout styles (flex direction, alignment, spacing, etc.) are now available as a standalone stylesheet `query-builder-layout.css`/`.scss`. The default stylesheet, `query-builder.css`/`.scss`, contains the layout styles along with the more decorative styles like colors and border styles. The effective styles—both layout and decorative—of the default stylesheet have not changed from version 6.

### Field data passed to `get*` callbacks

Most of the `get*` callback props now receive an additional "meta" parameter with a `fieldData` property (more properties may be added to the "meta" object in the future). `fieldData` is the full `Field` object from the `fields` array for the given `field` name, including any custom properties like `datatype`. This eliminates the need to search for the field object based solely on the field's `name`. Instead of something like `fields.find(f => f.name === field)`, you can retrieve `fieldData` from the last parameter.

The following callback props provide the new "meta" parameter: `getDefaultOperator`, `getDefaultValue`, `getInputType`, `getOperators`, `getRuleClassname`, `getValueEditorSeparator`, `getValueEditorType`, `getValues`, and `getValueSources`.

### Field data passed to `formatQuery` rule processors

Custom rule processors for `formatQuery` now receive the full `Field` object in the options parameter, as long as a `fields` array is provided alongside `ruleProcessor`. In TypeScript, the member type of the `fields` array now requires a `label: string` property (just like `QueryBuilder`'s `fields` prop). Previously, only `name` was required.

### Simpler PostgreSQL compatibility for `formatQuery`

`formatQuery` can natively generate [PostgreSQL](https://www.postgresql.org/)-compatible parameterized SQL using the new `numberedParams` option in conjunction with `paramPrefix: "$"`. Previously, PostgreSQL compatibility required manually post-processing the generated SQL to replace the "?" placeholders with a sequential series of numbers preceded by "$".

### Shift actions

A new [`showShiftActions`](./components/querybuilder#showshiftactions) prop provides first class support for rearranging rules within a query without enabling drag-and-drop. When `showShiftActions` is `true`, two buttons will appear at the front of each rule and group (except the root group), stacked vertically by default. The first/upper button will shift the rule or group one spot higher, while the second/lower button will shift it one spot lower. Pressing the modifier key (`Alt` on Windows/Linux, `Option`/`⌥` on Mac) while clicking will clone the rule/group instead of just moving it.

Related additions:

- [`ShiftActions`](./components/shiftactions) component (with a corresponding component in each compatibility package) that renders "shift up" and "shift down" action buttons. The default styles remove the border and background from these buttons, leaving only the `shiftActionUp.label`/`shiftActionDown.label` translation properties visible.
- [`useShiftActions`](./utils/hooks#useshiftactions) hook, called by the `ShiftActions` component, returns `shiftUp`/`shiftDown` methods and determines whether either button should be disabled. (Within the root group, "shift up" is disabled for the very first rule or group and "shift down" is disabled for the very last rule or group).
- New properties on the [`translations`](./components/querybuilder#translations) prop: `shiftActionUp` and `shiftActionDown`.

### Accessibility

Accessibility is improved with the addition of a `title` attribute to the outermost `<div>` of each rule group. The text of this attribute can be customized with the `accessibleDescriptionGenerator` function prop. The default implementation is exported as [generateAccessibleDescription](https://github.com/react-querybuilder/react-querybuilder/blob/main/packages/react-querybuilder/src/utils/generateAccessibleDescription.ts).

### Drag-and-drop `canDrop` callback

`<QueryBuilderDnD />` and `<QueryBuilderDndWithoutProvider />` from `@react-querybuilder/dnd` now accept a `canDrop` callback prop. If provided, the function will be called when dragging a rule or group. The only parameter will be an object containing `dragging` and `hovering` properties, representing the rule/group being dragged and the rule/group over which it is hovered, respectively. The objects will also contain the `path` of each item. If `canDrop` returns `false`, dropping the item at its current position will have no effect on the query. Otherwise the normal drag-and-drop rules will apply.

### Enhanced `parseNumber` behavior

The `parseNumber` function now delegates parsing to [`numeric-quantity`](https://www.npmjs.com/package/numeric-quantity), which is essentially an enhanced version of `parseFloat`. The default behavior has not changed, but a new "enhanced" option will ignore trailing invalid characters (e.g., the "abc" in "123abc"). This matches the behavior of the "native" option, which uses `parseFloat` directly, except it returns the original string when parsing fails instead of `NaN`.

### SpEL parser

The new `parseSpEL` function converts [SpEL](https://docs.spring.io/spring-framework/docs/3.0.x/reference/expressions.html) expressions to React Query Builder query objects.

## Updated default labels

### Main package

| Key                              | Old        | New         | Notes                               |
| -------------------------------- | ---------- | ----------- | ----------------------------------- |
| `translations.addRule.label`     | `"+Rule"`  | `"+ Rule"`  | Space added between "+" and "Rule"  |
| `translations.addGroup.label`    | `"+Group"` | `"+ Group"` | Space added between "+" and "Group" |
| `translations.removeRule.label`  | `"x"`      | `"⨯"`       | HTML entity `&cross;` / `&#x2A2F;`  |
| `translations.removeGroup.label` | `"x"`      | `"⨯"`       | HTML entity `&cross;` / `&#x2A2F;`  |

### Compatibility packages

Several compatibility packages take advantage of the new ability to use a `ReactNode` as a `label` (previously only `string`s were allowed). These packages override the default `label` for non-text components (`lock*`, `clone*`, `remove*`, and `dragHandle`) with SVG icons from their official icon packages. This brings them more in line with their respective design systems by default. Set `translations={defaultTranslations}` to avoid the SVG icons.

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
