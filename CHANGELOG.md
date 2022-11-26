# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

- N/A

## [v5.2.0] - 2022-11-26

### Added

- [#403](https://github.com/react-querybuilder/react-querybuilder/issues/403) Add `onRemove` prop and pass rule/group to all `ActionElement`s (buttons).

## [v5.1.3] - 2022-11-23

### Fixed

- [#387](https://github.com/react-querybuilder/react-querybuilder/issues/387) Support `antd` version 5.

## [v5.1.2] - 2022-11-21

### Fixed

- [#399](https://github.com/react-querybuilder/react-querybuilder/issues/399)/[#401](https://github.com/react-querybuilder/react-querybuilder/issues/401) When dragging a rule or group over a group header, the `dndOver` class is no longer applied to child group headers.

## [v5.1.1] - 2022-10-27

### Fixed

- `parseMongoDB` and `parseJsonLogic` now respect `independentCombinators` option.
- Narrowed rule group types, like `DefaultRuleGroupType` and `DefaultRuleGroupTypeIC`, are respected by `convertFromIC` and `convertToIC`.

<details>

<summary>Miscellaneous</summary>

- v3 documentation was migrated from dedicated README to website versioned docs

</details>

## [v5.1.0] - 2022-10-26

### Fixed

- [#394](https://github.com/react-querybuilder/react-querybuilder/issues/394) `parseJsonLogic` now handles `null` values correctly.

### Added

- [#392](https://github.com/react-querybuilder/react-querybuilder/issues/392) `parseMongoDB` utility for importing queries from [MongoDB](https://www.mongodb.com/).

## [v5.0.0] - 2022-10-22

### Changed

- Internet Explorer is no longer supported.
- The minimum TypeScript version is now 4.5.
- When `defaultQuery` is defined, an `id` property will be added to each rule and group in the query hierarchy. This will be reflected in the `onQueryChange` callback parameter. In previous versions `defaultQuery` was not modified by the component itself, but `id` is now added because it is a required attribute internally.
- Related to the previous bullet, the `prepareRuleGroup` utility function will no longer coerce the `not` property of groups to be a `boolean` type (or even defined at all).
- [#385](https://github.com/react-querybuilder/react-querybuilder/issues/385) MongoDB output has been simplified: The `$eq` and `$and` operators are only used when necessary.
- [#343](https://github.com/react-querybuilder/react-querybuilder/pull/343) Drag-and-drop functionality migrated
  - In order to make the `react-dnd` dependency completely optional when the `enableDragAndDrop` prop was not set to `true`, drag-and-drop functionality was extracted from `react-querybuilder` into a new package called [`@react-querybuilder/dnd`](https://www.npmjs.com/package/@react-querybuilder/dnd).
  - The new package has `peerDependencies` of `react-dnd` and `react-dnd-html5-backend` (each of which can be any version >= 14, as long as they match), but no hard `dependencies`. The only external dependencies in the main package now are `immer` and `clsx`.
  - **Upgrade path:** To enable drag-and-drop functionality in v5, nest `<QueryBuilder />` within a `<QueryBuilderDnD />` element. The `enableDragAndDrop` prop is implicitly `true` when using `QueryBuilderDnD`, so you no longer need to set it explicitly unless it should be `false` (which can be set on `QueryBuilderDnD` _or_ `QueryBuilder`).
    ```diff
     export function App() {
       return (
    -    <QueryBuilder enableDragAndDrop />
    +    <QueryBuilderDnD>
    +      <QueryBuilder />
    +    </QueryBuilderDnD>
       );
     }
    ```
  - If your application already uses `react-dnd` and renders `DndProvider` higher in the component tree, replace `QueryBuilderDnD` with `QueryBuilderDndWithoutProvider`.

### Fixed

- [#324](https://github.com/react-querybuilder/react-querybuilder/pull/324) The `@react-querybuilder/material` package now properly inherits the theme configuration from ancestor `ThemeProvider`s. Note: the `@mui/material` components are now loaded asynchronously by default, so the query builder will initially be rendered with the default components. See the [documentation](https://react-querybuilder.js.org/docs/compat#preload-mui-components) or the [README](https://github.com/react-querybuilder/react-querybuilder/blob/main/packages/material/README.md) to find out how to render the MUI components immediately.
- `parseCEL` now handles strings correctly (including multi-line strings).
- [#389](https://github.com/react-querybuilder/react-querybuilder/pull/389) `AntDValueSelector` properly handles empty string values in multiselect mode.

### Added

- Each [compatibility package](https://react-querybuilder.js.org/docs/compat) now exports its own context provider that injects the appropriate `controlElements` and `controlClassnames` properties into any descendant `QueryBuilder` components (composition FTW!). This is now the recommended usage for all compatibility packages.
- The [`onAddRule`](https://react-querybuilder.js.org/docs/api/querybuilder#onaddrule) and [`onAddGroup`](https://react-querybuilder.js.org/docs/api/querybuilder#onaddgroup) callback props now receive an optional "context" parameter as the fourth argument. This parameter can be provided by a custom `addRuleAction`/`addGroupAction` component to its `handleOnClick` prop. This allows users to alter or replace the default rule based on arbitrary data. For example, the `addRuleAction` component could render two "add rule" buttons which add different rules depending on which one was clicked, as long as they provided a different `context` parameter.
- When drag-and-drop is enabled, rules will be copied instead of moved if the user has a modifier key (`Alt` on Windows/Linux, `Option ⌥` on Mac) pressed when the drop occurs.
- `formatQuery` has a new `ruleProcessor` configuration option applicable to non-SQL query language formats. When provided, the entire rule output will be determined by the function. For the relevant formats, `valueProcessor` already behaved this way; the default "value" processors have been renamed to `defaultRuleProcessor[Format]` to clarify the behavior. The default processors' original "value" names are deprecated but still available (with no immediate plans to remove them).
- `parseSQL` will now ignore a leading `WHERE` keyword, e.g. `parseSQL("WHERE firstName = 'Steve'")` will not fail to produce a query rule like in v4.

<details>

<summary>Miscellaneous</summary>

- The [documentation site](https://react-querybuilder.js.org/) now has separate documentation for past versions.
- The `controlElements` prop has a new option: `inlineCombinator`. By default, this is a small wrapper around the `combinatorSelector` component that is used when either `showCombinatorsBetweenRules` or `independentCombinators` is `true`. The `inlineCombinator` option was only added to support `@react-querybuilder/dnd`, so there is almost certainly no reason to use it directly.

</details>

## [v4.5.3] - 2022-09-28

### Fixed

- [#364](https://github.com/react-querybuilder/react-querybuilder/issues/364) The array passed to the `fields` prop was being mutated if it contained duplicates, whether they were duplicate field `name`s or option group `label`s. The `fields` prop is now treated as immutable.
- [#374](https://github.com/react-querybuilder/react-querybuilder/issues/374) `RuleGroup` was using unstable keys to render elements in the `rules` array. Keys are now stable based on `id` properties, which are auto-generated if not provided in the `query`/`defaultQuery` prop.

## [v4.5.2] - 2022-08-19

### Fixed

- Backslashes are now properly escaped when `formatQuery` generates `JSON.parse`-able strings ("mongodb" and "json_without_ids" formats).
- The `parse*` import methods properly handle backslashes.
- [#353](https://github.com/react-querybuilder/react-querybuilder/pull/353) The `moment` package is no longer included in the build for `@react-querybuilder/antd`.

### Added

- [#333](https://github.com/react-querybuilder/react-querybuilder/pull/333) When a rule has an `operator` of "between"/"notBetween" and either `valueSource: "field"` or `valueEditorType: "select"`, the default `ValueEditor` will display two drop-down lists. The values of the drop-down lists will be joined with a comma when the rule's `value` property is updated.
- [#337](https://github.com/react-querybuilder/react-querybuilder/pull/337) In conjunction with the "between"-related enhancements above, a new Boolean prop has been added to `<QueryBuilder />` called `listsAsArrays`. This prop works in a similar manner to the [`parse*` option of the same name](https://react-querybuilder.js.org/docs/api/import#lists-as-arrays). When the prop is `true`, `ValueEditor` (and `ValueSelector` for `multiple: true`) will store lists of values, including "between" value pairs, as proper arrays instead of comma-separated strings.
  - Existing, default format:
    - `{ field: "f1", operator: "between", value: "f2,f3", valueSource: "field" }`
  - `listsAsArrays` format:
    - `{ field: "f1", operator: "between", value: ["f2", "f3"], valueSource: "field" }`

## [v4.5.1] - 2022-06-21

### Fixed

- The type `ValueProcessor` was incorrectly including the new `ValueProcessorByRule` type. `ValueProcessor` is now simply an alias for `ValueProcessorLegacy`, which should undo a breaking change from [v4.5.0].

## [v4.5.0] - 2022-06-19

### Changed

_TL;DR: These are probably not breaking changes._

<details>
<summary>While a breaking change in a minor release technically violates <a href="https://semver.org/">semver</a>, the change in question is only "breaking" in a very rare--possibly non-existent--case. The <em>only</em> case where this change will break anything is if you use <code>formatQuery</code> with a custom <code>valueProcessor</code> that accepts fewer than three (3) arguments. Click for details...</summary>

- [#319](https://github.com/react-querybuilder/react-querybuilder/pull/319): `formatQuery` will now invoke custom `valueProcessor` functions with different arguments based on the function's `.length` property, which is the number of arguments a function accepts excluding those with default values:
  - If the `valueProcessor` function accepts fewer than three (3) arguments, it will be called like this:
  ```ts
  valueProcessor(rule, { parseNumbers });
  ```
  The first argument is the `RuleType` object directly from the query. The second argument is of type `ValueProcessorOptions`, which is a subset of `FormatQueryOptions` (currently `{ parseNumbers?: boolean; }`).
  - To maintain the current behavior (`valueProcessor(field, operator, value, valueSource)`), make sure the `valueProcessor` function accepts at least three arguments _with no default values_ (do not use `=` for the first three arguments). For example, the following code will log `length: 1`:
  ```ts
  const valueProcessor = (field: string, operator = '=', value = '') => '...';
  console.log(`length: ${valueProcessor.length}`);
  ```
  - If you use TypeScript, these conditions will be enforced automatically.

</details>

### Added

- [#319](https://github.com/react-querybuilder/react-querybuilder/pull/319): Invoking `valueProcessor` with the full `RuleType` object provides access to much more information about specific rules. Standard properties that were previously unavailable include `path`, `id`, and `disabled`, but any custom properties will also be accessible.
  - The default value processors for "sql", "parameterized", "parameterized_named", "mongodb", "cel", and "spel" formats have not changed, but alternate functions using the new `fn(rule, options)` signature are now available:
    - `defaultValueProcessorByRule`
    - `defaultValueProcessorCELByRule`
    - `defaultValueProcessorMongoDBByRule`
    - `defaultValueProcessorSpELByRule`
- [#320](https://github.com/react-querybuilder/react-querybuilder/pull/320), [#323](https://github.com/react-querybuilder/react-querybuilder/pull/323): New parser functions (also available as standalone builds in the `dist` folder). Click the respective "Import from [format]" button in [the demo](https://react-querybuilder.js.org/react-querybuilder) to try them out.
  - `parseJsonLogic` takes a [JsonLogic](https://jsonlogic.com/) object and converts it to `RuleGroupType`.
  - `parseCEL` takes a [CEL](https://github.com/google/cel-spec) string and converts it to `RuleGroupType`. Click the "Import from CEL" button in [the demo](https://react-querybuilder.js.org/react-querybuilder).
- [#328](https://github.com/react-querybuilder/react-querybuilder/pull/328) New utility function `transformQuery` recursively processes rule groups and rules with the provided `ruleProcessor`, `ruleGroupProcessor`, and other options ([documentation](https://react-querybuilder.js.org/docs/api/misc#transformquery)).

### Fixed

- [#323](https://github.com/react-querybuilder/react-querybuilder/pull/323): `formatQuery` outputs will now escape quotation marks when appropriate:
  - For SQL ("sql", "parameterized", "parameterized_named"), single quotes will be doubled up, e.g. `(firstName = 'Ra''s')`
  - For other formats, double or single quotes will be escaped with a backslash if necessary (`firstName == 'Ra\'s'` or `firstName == "Ra\"s"`).
- [#323](https://github.com/react-querybuilder/react-querybuilder/pull/323): The standalone builds of `formatQuery` and `parseSQL` no longer include React and are not minified.

## [v4.4.1] - 2022-06-03

### Added

- New export format options:
  - **JsonLogic** ([`formatQuery` docs](https://react-querybuilder.js.org/docs/api/export#jsonlogic), [JsonLogic.com](https://jsonlogic.com/))
  - **Spring Expression Language (SpEL)** ([`formatQuery` docs](https://react-querybuilder.js.org/docs/api/export#spel), [docs.spring.io](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#expressions-language-ref))
- MongoDB export format now supports `RuleGroupTypeIC` (independent combinators).

## [v4.4.0] - 2022-05-30

### Changed

_(This list may look long, but the breaking changes should only affect a small minority of users.)_

- Several utility functions that were trivial or only really useful internal to this package are no longer exported from `react-querybuilder`. To see which ones, check [the `internal` folder](https://github.com/react-querybuilder/react-querybuilder/tree/v4.4.0/packages/react-querybuilder/src/internal). All exports from that folder were previously exported from [the `utils` folder](https://github.com/react-querybuilder/react-querybuilder/tree/v4.4.0/packages/react-querybuilder/src/utils), which is re-exported in its entirety from the [main entry point](https://github.com/react-querybuilder/react-querybuilder/blob/v4.4.0/packages/react-querybuilder/src/index.ts#L8).
- The `RuleProps` and `RuleGroupProps` interfaces have deprecated the props that were individual properties of rules/groups, and have added a prop containing the full rule or group object. This should only affect users that implement a custom `<RuleGroup />` component but use the default `<Rule />` component, since `<Rule />` now expects a `rule` prop.
  - In `RuleProps`: `field`, `operator`, `value`, and `valueSource` are deprecated and replaced by `rule: RuleType`.
  - In `RuleGroupProps`: `combinator`, `rules`, and `not` are deprecated and replaced by `ruleGroup: RuleGroupTypeAny`.
- Internal methods for immutably updating queries have been moved from the `schema` prop to the new `actions` prop on both `RuleProps` and `RuleGroupProps`. Custom `<Rule />` and `<RuleGroup />` components will need to adjust their prop declarations.

### Fixed

- `vite-tsconfig-paths` was mistakenly added to the `dependencies` list instead of `devDependencies` for the main package in [v4.1.3].

### Added

- `debugMode` now triggers logging when the query or options are updated and when a query update fails for some reason (e.g. the path is disabled).
- New `onLog` callback prop is used instead of `console.log` when `debugMode` is `true`.
- As a consequence of the new properties on `RuleProps` and `RuleGroupProps` (`rule` and `ruleGroup`, respectively), custom `<Rule />` and `<RuleGroup />` components now have access to their full rule/group objects, including any non-standard properties. This can greatly simplify the use of customized query objects.
- `<QueryBuilder />` will detect potential problems with using the component in a controlled vs uncontrolled manner and will log errors to the console (in "development" mode only). This includes the following situations:
  - Both `query` and `defaultQuery` props are defined (TypeScript will complain about this at compile time, errors will be logged at run time)
  - `query` prop is undefined in one render and then defined in the next render
  - `query` prop is defined in one render and then undefined in the next render

## [v4.3.1] - 2022-05-21

### Changed

- If using TypeScript, custom `operatorSelector` components will now need to accommodate `OptionGroup<NameLabelPair>[]` in addition to the normal `NameLabelPair[]`.

### Added

- [#304](https://github.com/react-querybuilder/react-querybuilder/pull/304) Many compatibility components now accept the props of the rendered library component in addition to the standard props ([see documentation](https://react-querybuilder.js.org/docs/compat#customization)), allowing customization specific to the style library.
- [#306](https://github.com/react-querybuilder/react-querybuilder/pull/306) New prop `autoSelectOperator` ([documentation](https://react-querybuilder.js.org/docs/api/querybuilder#autoselectoperator)) behaves like [`autoSelectField`](https://react-querybuilder.js.org/docs/api/querybuilder#autoselectfield) but for the operator selector.
  - The `fields` and `operators` properties of the `translations` prop object now accept `placeholderName`, `placeholderLabel`, and `placeholderGroupLabel` properties ([documentation](https://react-querybuilder.js.org/docs/api/querybuilder#translations)). These translatable strings set the default field and operator values and labels when `autoSelectField` and/or `autoSelectOperator` are set to `false`.
  - Corresponding options were also added to [`formatQuery`](https://react-querybuilder.js.org/docs/api/export#placeholder-values), which will now ignore rules where the `field` or `operator` match the placeholder values for most export formats.
- [#303](https://github.com/react-querybuilder/react-querybuilder/pull/303) Added support for wildcards concatenated to field names in `parseSQL`. Examples:

<table>
<tr>
<th>

SQL

</th>
<th>

Generated `RuleType` object

</th>
</tr>
<tr>
<td>

`"lastName LIKE firstName || '%'"`

</td>
<td>

```json
{
  "field": "lastName",
  "operator": "beginsWith",
  "value": "firstName",
  "valueSource": "field"
}
```

</td>
</tr>
<tr>
<td>

`"lastName NOT LIKE '%' || firstName || '%'"`

</td>
<td>

```json
{
  "field": "lastName",
  "operator": "doesNotContain",
  "value": "firstName",
  "valueSource": "field"
}
```

</td>
</tr>
</table>

### Fixed

- [#301](https://github.com/react-querybuilder/react-querybuilder/pull/301) `react-querybuilder` and the compatibility packages are all built with React v18 now (the `peerDependencies` version is still `">=16.8.0"`). Previous 4.x versions were usable within React 18 applications, but now the build and tests explicitly use it.
- [#308](https://github.com/react-querybuilder/react-querybuilder/pull/308) The CodeSandbox CI template is now located [within the repository](https://github.com/react-querybuilder/react-querybuilder/tree/main/examples/ci), and several other CodeSandbox-compatible examples have been added as well (see [examples folder](https://github.com/react-querybuilder/react-querybuilder/tree/main/examples)).

## [v4.2.5] - 2022-05-12

### Added

- Added two options to the `translations` prop: `fields.placeholderLabel` and `fields.placeholderGroupLabel`. These will be used in place of the default `"------"` when the [`autoSelectField` prop](https://react-querybuilder.js.org/docs/api/querybuilder#autoselectfield) is set to `false`.
- All translation properties are now optional.

## [v4.2.4] - 2022-05-12

### Added

- Added a `parseNumbers` option for `formatQuery`.
- Added a `debugMode` prop on `<QueryBuilder />`.

## [v4.2.3] - 2022-04-05

### Added

- [Common Expression Language (CEL)](https://github.com/google/cel-spec) export format for `formatQuery`.

## [v4.2.2] - 2022-03-12

### Fixed

- This release fixes the "IC" aka "independent combinator" type exports (`RuleGroupTypeIC`, etc.).

## [v4.2.1] - 2022-03-03

### Added

- This release adds an `operator` parameter to the `comparator` function property of the `Field` interface.

## [v4.2.0] - 2022-02-02

### Changed

- When calling `formatQuery` with the "mongodb" format and a custom `valueProcessor`, the `valueProcessor` function will now need to return the full expression object and not just the operator/value portion. For example, `defaultMongoDBValueProcessor('firstName', '=', 'Steve')` previously returned `{"$eq":"Steve"}`, but now returns `{"firstName":{"$eq":"Steve"}}`.

### Fixed

- [#276](https://github.com/react-querybuilder/react-querybuilder/pull/276): When using `react-querybuilder` v4 within an application that already implemented `react-dnd`, an error would appear: "Cannot have two HTML5 backends at the same time." This can now be resolved by using the `<QueryBuilderWithoutDndProvider />` component instead of `<QueryBuilder />`. They are functionally the same, but the former allows (in fact, _relies on_) a `react-dnd` backend (e.g. `react-dnd-html5-backend`) to be implemented higher up in the component tree.
- Previously, the `parseSQL` method would accept boolean comparison clauses with an identifier (field name) on the left or right of the operator, but not on both sides (at least one side had to be a primitive string, numeric, or boolean). If the identifier was on the right, `parseSQL` would flip the clause so that the field name was on the left and the value on the right, but it wouldn't flip the operator (`<` should become `>`, etc.). The operator will now be flipped when appropriate.

### Added

- [Compare fields to other fields](https://react-querybuilder.js.org/docs/api/valueeditor#value-sources). The default `<ValueEditor />` component can now display a [filterable](https://react-querybuilder.js.org/docs/api/valueeditor#filtering-the-field-list) list of fields from the `fields` prop given the right configuration. [`formatQuery`](https://react-querybuilder.js.org/docs/api/export#value-sources) and [`parseSQL`](https://react-querybuilder.js.org/docs/api/import#fields-as-value-source) have also been updated to support this feature.
- [Query tools](https://react-querybuilder.js.org/docs/api/misc#query-tools): Several methods are now available to assist with manipulation of query objects outside the context of a `<QueryBuilder />` element:
  - `add` - appends a new rule or group (and a preceding independent combinator if appropriate) to the end of a rule group's `rules` array
  - `remove` - removes a rule or group (and the preceding independent combinator if one exists)
  - `update` - updates a property of a rule or group, or updates an independent combinator
  - `move` - moves (or clones, with new `id` and `path`) a rule or group to a new location in the query tree
- [Lock buttons](https://react-querybuilder.js.org/docs/api/querybuilder#showlockbuttons): Use the `showLockButtons` prop to enable locking/unlocking (i.e. disabling/enabling) individual rules and groups ([demo](https://react-querybuilder.js.org/react-querybuilder/#autoSelectField=true&resetOnFieldChange=true&showLockButtons=true)).
- New [`valueEditorType` and `inputType` options](https://react-querybuilder.js.org/docs/api/valueeditor): In addition to the previously available options ("text", "select", "checkbox", "radio"), the following new options are now officially implemented in the default `<ValueEditor />` and all [compatibility packages](https://react-querybuilder.js.org/docs/compat):
  - `valueEditorType`
    - "textarea"
    - "multiselect"
  - `inputType`
    - "date"
    - "datetime-local"
    - "time"
- A [UMD build](https://react-querybuilder.js.org/docs/umd) is now available ([demo](https://react-querybuilder.js.org/react-querybuilder/umd.html)).
- The [`fields` prop](https://react-querybuilder.js.org/docs/api/querybuilder#fields) can now accept an object of type `Record<string, Field>`. (`Field[]` and `OptionGroup<Field>[]` are still supported.)
- Each [compatibility package](https://react-querybuilder.js.org/docs/compat) now exports an object ready-made for the `controlElements` prop (as well as `controlClassnames` in the case of [Bootstrap](https://www.npmjs.com/package/@react-querybuilder/bootstrap)). No need to assign each component individually anymore.

## [v4.1.3] - 2022-01-18

### Fixed

- The path to the CommonJS build was wrong in package.json for the main package. This has been fixed.
- The `RuleGroupArray` type (used for the `rules` property of `RuleGroupType`) has been simplified to `(RuleType | RuleGroupType)[]`. This should make it easier to extend and/or narrow `RuleGroupType`.

## [v4.1.2] - 2022-01-12

### Fixed

- `parseSQL` was returning conventional rule groups (combinators at the group level) in some situations even when the `independentCombinators` option was set to `true`. The option will now guarantee a return type of `RuleGroupTypeIC`.

### Added

- Added `convertQuery` method to toggle a query between the conventional structure with combinators at the group level (`RuleGroupType`) and the "independent combinator" structure (`RuleGroupTypeIC`, used with the `independentCombinators` prop). For unidirectional conversions, `convertToIC` and `convertFromIC` are also available.
- The specific return type of the `parseSQL` method (`RuleGroupType` or `RuleGroupTypeIC`) is now inferred from the parameters.

## [v4.1.1] - 2022-01-10

### Fixed

- Improved recursive types `RuleGroupType` and `RuleGroupTypeIC` to pass down the `R` (rule) and `C` (combinator) generics to the `rules` array.

## [v4.1.0] - 2022-01-09

### Fixed

- Minimum TypeScript version has been lowered to 4.1.2, down from 4.5 in `react-querybuilder` v4.0.0.

### Added

- All `ValueSelector`-based components, including field selectors, operator selectors, combinator selectors, and value editors where the `type` is "select" now support option groups. Pass `{ label: string; options: NameLabelPair[] }[]` instead of `NameLabelPair[]`.
- TypeScript types for rules and groups now use generics which can be used to narrow certain member types more easily.

## [v4.0.0] - 2021-12-28

### Changed

- Minimum TypeScript version is now 4.5.0.
- The default styles (`query-builder.css` and `query-builder.scss`) now use flexbox. This should allow greater flexibility and more consistent styling, but you'll need to use a different stylesheet for IE due to poor flexbox support. The [new IE-compatible demo page](https://react-querybuilder.js.org/react-querybuilder/ie11.html) uses styles more suitable for IE.
- `onAddRule` and `onAddGroup` callbacks now pass a `number[]` (`parentPath`) as the second argument instead of a `string` (`parentId`).
- The exported method `findRule` has been replaced by `findPath`, which is useful in conjunction with the previously mentioned `onAddRule` and `onAddGroup` callbacks.
- A new drag handle element will always be rendered at the front of every rule and rule group header element, regardless of whether you enable the drag-and-drop feature (see Features section below). If drag-and-drop is disabled (the default setting), you should hide the drag handle by either 1) using the default stylesheet which hides it automatically when drag-and-drop is disabled, or 2) hiding it with a style rule like `.queryBuilder-dragHandle { display: none; }`.
- Cloning a rule or group will insert the clone immediately after the original item instead of as the last item of the parent group.

<details>
  <summary>Click to show internal changes (shouldn't affect most users)</summary>

- Dropped `lodash` dependency. Added `immer` and `react-dnd`.
- `Rule` and `RuleGroup` props now include `path: number[]`, and `id` may be undefined.
- `getLevel` has been removed from the `schema` prop (internally we just use `path.length` now).
- The following functions that are part of the `schema` prop have been refactored to use `path` or `parentPath` instead of `id` or `parentId`: `onGroupAdd`, `onGroupRemove`, `onPropChange`, `onRuleAdd`, `onRuleRemove`.

</details>

### Fixed

- The default `ValueEditor` component was calling the `useEffect` hook conditionally, which is _way_ against the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html). It is now called unconditionally.
- [#258](https://github.com/react-querybuilder/react-querybuilder/pull/258) When the `formatQuery` export format is "mongodb", the resulting string can be parsed by `JSON.parse` ([@mylawacad](https://github.com/mylawacad))

### Added

- Shiny new documentation site! https://react-querybuilder.js.org
- We now provide official compatibility components for several popular style frameworks (as seen in the [demo](https://react-querybuilder.js.org/react-querybuilder)), with more to come! Check out the [`@react-querybuilder` org on npm](https://www.npmjs.com/org/react-querybuilder).
- All props on the `<QueryBuilder />` component are now optional
- `<QueryBuilder />` is now a properly controlled or uncontrolled component depending on which props are passed in. If you pass a `query` prop, the query will not change until a new `query` is passed in. You should use the parameter of the `onQueryChange` callback to update the `query` prop. Typically this involves using React's `useState` hook. To render an _uncontrolled_ component, don't pass a `query` prop. You can set the initial query by using the new `defaultQuery` prop, and you can still listen for changes with `onQueryChange`.
- The `query-builder.scss` file now uses variables instead of hard-coded colors and spacing. Feel free to import it and override the default values with your own theme's colors/styles/etc.
- Drag-and-drop! [Pass the `enableDragAndDrop` prop](https://react-querybuilder.js.org/react-querybuilder/#enableDragAndDrop=true) to display a drag handle on each rule and group header. Users will be able to reorder and relocate rules and groups.
- Independent combinators! Wait...what does that even mean? [When the `independentCombinators` prop is `true`](https://react-querybuilder.js.org/react-querybuilder/#independentCombinators=true), `<QueryBuilder />` will insert an independent "and/or" selector between each pair of sibling rules/groups. This new feature shouldn't introduce any breaking changes since it's opt-in, i.e. if `independentCombinators` is undefined or `false`, then the `<QueryBuilder />` should behave basically the same as it did in v3.x.
- New `disabled` prop to prevent changes to the query. All sub-components and form elements get the `disabled` prop as well. Pass `true` to disable the entire query, or pass an array of paths to disable specific rules/groups.
- `parseSQL` method to import queries from SQL ([documentation](https://react-querybuilder.js.org/docs/api/import) / [demo](https://react-querybuilder.js.org/react-querybuilder/) -- click the "Load from SQL" button).
- `formatQuery` accepts a new `format` type: "parameterized_named" ([documentation](https://react-querybuilder.js.org/docs/api/export#named-parameters)). This new format is similar to "parameterized", but instead of anonymous `?`-style bind variables, each parameter is given a unique name based on the field name and the order in the query. A corresponding `paramPrefix` option is available in order to use a different character than the default ":" within the `sql` string.

## [v4.0.0-beta.8] - 2021-12-24

### Fixed

- [#255](https://github.com/react-querybuilder/react-querybuilder/pull/255) Fix a couple of issues with the "mongodb" `formatQuery` export type ([@mylawacad](https://github.com/mylawacad))

### Added

- [#261](https://github.com/react-querybuilder/react-querybuilder/pull/261) `valueProcessor` for "mongodb" export format
- [#252](https://github.com/react-querybuilder/react-querybuilder/pull/252) Export `RuleGroup` component ([@ZigZagT](https://github.com/ZigZagT))
- [#250](https://github.com/react-querybuilder/react-querybuilder/pull/250) Bulma compatibility package and demo
- [#248](https://github.com/react-querybuilder/react-querybuilder/pull/248) `disabled` prop

## [v4.0.0-beta.7] - 2021-12-13

### Fixed

- [#247](https://github.com/react-querybuilder/react-querybuilder/pull/247) Fix drag-and-drop for `independentCombinators`

## [v4.0.0-beta.6] - 2021-11-27

Maintenance release focused on converting to a monorepo with Vite driving the build process.

### Added

- If using `react-querybuilder` with NodeJS, and you only want to use the `formatQuery` function, you no longer have to install React on the server as well. Just `import formatQuery from 'react-querybuilder/dist/formatQuery'`. Note: TypeScript types are not available for this export.

## [v4.0.0-beta.5] - 2021-11-12

### Changed

- Earlier 4.0 beta releases had an `inlineCombinators` prop. This has been renamed to `independentCombinators`.
- Dropped `lodash` dependency. Added `immer` and `react-dnd`.

#### Styles

- The default styles now use flexbox. This should allow greater flexibility and more consistent styling.
- The `query-builder.scss` file now uses variables instead of hard-coded colors and spacing. Feel free to import it and override the default values with your own theme's colors/styles/etc.

#### Structure

- A new drag handle element sits at the front of every rule and rule group header element. If you are not using the drag-and-drop feature (see Features section below), you should hide the drag handle by using the default stylesheet which hides it automatically when `enableDragAndDrop` is `false`, or hide it with a rule like `.queryBuilder-dragHandle { display: none; }`.

#### Behavior

- `<QueryBuilder />` is now a properly controlled or uncontrolled component depending on which props are passed in. If you pass a `query` prop, the query will not change until a new `query` is passed in. You should use the parameter of the `onQueryChange` callback to update the `query` prop. Typically this involves using React's `useState` hook. To render an _uncontrolled_ component, don't pass a `query` prop. You can set the initial query by using the new `defaultQuery` prop, and you can still listen for changes with `onQueryChange`.

### Added

- [#235](https://github.com/react-querybuilder/react-querybuilder/pull/235) Drag-and-drop! Pass the `enableDragAndDrop` prop to display a drag handle on each rule and group header. Users will be able to reorder rules and groups with the click (and drag) of a mouse.
- New IE11-compatible demo page.

## [v4.0.0-beta.4] - 2021-11-03

### Fixed

- [v4.0.0-beta.3] had an outdated build

### Added

- All props on the `<QueryBuilder />` component are now optional

## [v4.0.0-beta.3] - 2021-11-03

### Added

- [#231](https://github.com/react-querybuilder/react-querybuilder/pull/231) `inlineCombinators` prop. When `true`, `<QueryBuilder />` will insert an independent combinator (and/or) selector between each pair of sibling rules/groups. This new feature shouldn't introduce any breaking changes, i.e. if `inlineCombinators` is undefined or `false`, then the `<QueryBuilder />` should behave the same as it did in v4.0.0-beta.2. However, the TypeScript types are _significantly_ more complex in this release so we're going to leave this beta out for a while before releasing v4.0.0 properly.

## [v4.0.0-beta.2] - 2021-10-29

### Added

- [#230](https://github.com/react-querybuilder/react-querybuilder/pull/230) `parseSQL` method to import queries from SQL (try the [demo](https://react-querybuilder.js.org/react-querybuilder/)).

## [v4.0.0-beta.1] - 2021-10-23

### Changed

- [#229](https://github.com/react-querybuilder/react-querybuilder/pull/229) Path-based query management
  - `Rule` and `RuleGroup` props now include `path: number[]`, and `id` may be undefined.
  - `getLevel` has been removed from the `schema` prop.
  - The following functions that are part of the `schema` prop have been refactored to use `path` or `parentPath` instead of `id` or `parentId`: `onGroupAdd`, `onGroupRemove`, `onPropChange`, `onRuleAdd`, `onRuleRemove`.
  - `onAddRule` and `onAddGroup` callbacks now pass a `number[]` (`parentPath`) as the second argument instead of a `string` (`parentId`).
  - The exported method `findRule` has been replaced by `findPath`, which is useful in conjunction with the previously mentioned, refactored `onAddRule` and `onAddGroup` callbacks.
  - The `onQueryChange` callback's argument, the current query object, will include a `path` for each rule and group. The `formatQuery` default output format, "json", will also include `path`s.
  - Rule and group `div`s now include a `data-path` attribute.

### Added

- `formatQuery` accepts a new `format` type: `"parameterized_named"`. This new format is similar to `"parameterized"`, but instead of anonymous `?`-style bind variables, each parameter is given a unique name based on the field name and the order in the query. A corresponding option `paramPrefix` is available in order to use a different character than the default ":" within the `sql` string.
- [#228](https://github.com/react-querybuilder/react-querybuilder/pull/228) CodeSandbox CI

## [v3.12.1] - 2021-10-06

### Changed

- The default `ValueEditor` will force the `<input />` control to have `type="text"` if the field's `inputType` is "number" and the `operator` is "between" or "notBetween". When the `operator` changes to something else, the control will revert to `type="number"` and reset the `value` if the `value` included a comma (",").
- The "parameterized" output of the `formatQuery` function will now include native numbers and boolean values in the `params` array if a rule's `value` property is a number or boolean. Previously the array included `"TRUE"` or `"FALSE"` for boolean values, and numbers were converted to strings, e.g. old way -> `params:["string","12","14","TRUE"]`, new way -> `params:["string",12,14,true]`.

### Fixed

- Several bugs were squashed in the `formatQuery` function when dealing with the "in", "notIn", "between", and "notBetween" operators.
- A couple of bugs were fixed in the [demo](https://react-querybuilder.js.org/react-querybuilder/).

## [v3.12.0] - 2021-10-04

### Changed

- The only potentially breaking change in the main `<QueryBuilder />` component is the addition of a `<div>` in the JSX output that wraps the child rules/groups of each group. It would only affect custom CSS rules like `.ruleGroup > .rule`, since `.rule` is no longer an immediate child of `.ruleGroup`. Now use something like `.ruleGroup > .ruleGroup-body > .rule`.
- The `formatQuery` function will now ignore invalid rules for "sql", "parameterized", and "mongodb" output types. This includes rules that match one or more of the following criteria:
  - The rule fails validation (see validation feature below) based on the validation map from the query validator or the result of the field validator.
  - The rule's `operator` is "in" or "notIn" and the value is neither a non-empty string nor an array with at least one element.
  - The rule's `operator` is "between" or "notBetween" and the value is neither an array of length two (`rule.value.length === 2`) nor a string with exactly one comma that isn't the first or last character (`rule.value.split(',').length === 2` and neither element is an empty string).
- Cleaned up some internal stuff and dropped three dependencies! [Lodash](https://lodash.com) is now the only external dependency.

### Added

- [#225](https://github.com/react-querybuilder/react-querybuilder/pull/225) [Validation](https://github.com/react-querybuilder/react-querybuilder/README.v3.12.1.md#validator-optional): pass a `validator` prop to validate the entire query, or include a `validator` attribute on each field in the `fields` array to validate each rule based on the selected field.
  - CSS classes will be added (`"queryBuilder-valid"` or `"queryBuilder-invalid"`) to validated rules and groups, and all sub-components will receive the validation result as a prop.
  - The `formatQuery` function has two new validation-related options: 1) `validator` (same signature as the prop mentioned earlier) and 2) `fields` (same shape as the `fields` prop). Rules and groups deemed invalid will be ignored if the output format is "sql", "parameterized", or "mongodb".
- [#223](https://github.com/react-querybuilder/react-querybuilder/pull/223) [Rule/group cloning](https://github.com/react-querybuilder/react-querybuilder/README.v3.12.1.md#showclonebuttons-optional): pass the `showCloneButtons` prop to enable duplication of rules and groups. Associated `controlElements` properties are also available for custom clone button components.
- [#224](https://github.com/react-querybuilder/react-querybuilder/pull/224) [Add rule to new groups](https://github.com/react-querybuilder/react-querybuilder/README.v3.12.1.md#addruletonewgroups-optional): pass the `addRuleToNewGroups` prop to add the default rule to all new groups automatically.
- [#224](https://github.com/react-querybuilder/react-querybuilder/pull/224) [Default operator](https://github.com/react-querybuilder/react-querybuilder/README.v3.12.1.md#getdefaultoperator-optional): pass a `getDefaultOperator` function prop to determine which operator is set for new rules (or include a `defaultOperator` attribute on objects in the `fields` array to set the default operator for specific fields).
- [#224](https://github.com/react-querybuilder/react-querybuilder/pull/224) [Cancel or modify a new rule](https://github.com/react-querybuilder/react-querybuilder/README.v3.12.1.md#onaddrule-optional)/[group](https://github.com/react-querybuilder/react-querybuilder/README.v3.12.1.md#onaddgroup-optional): use the `onAddRule` and `onAddGroup` callbacks to return a new rule/group that will be added instead of the default, or return `false` to cancel the addition of the new rule/group. _(Note: to completely prevent the addition of new groups, you can also pass `controlElements={{ addGroupAction: () => null }}` which will hide the "+Group" button.)_
- [New "between" and "not between" default operators](https://github.com/react-querybuilder/react-querybuilder/README.v3.12.1.md#operators-optional): the [`formatQuantity`](https://github.com/react-querybuilder/react-querybuilder/README.v3.12.1.md#formatquantity) function has also been updated to handle the new operators properly.
- The [demo](https://react-querybuilder.js.org/react-querybuilder/) has been updated with all the new features, and now includes tooltips on options and links to relevant documentation.

## [v3.11.1] - 2021-09-18

### Changed

- Relaxed and corrected types related to `NameLabelPair`
- Simplified `formatQuery` for MongoDB

## [v3.11.0] - 2021-08-24

### Added

- [#218](https://github.com/react-querybuilder/react-querybuilder/pull/218) `autoSelectField` prop. When set to `false`, prevents automatic selection of the first field in new rules by adding an "empty" choice as the first option. When the "empty" option is selected, the operator and value components for that rule will not be displayed.

## [v3.10.1] - 2021-08-19

### Added

- [#214](https://github.com/react-querybuilder/react-querybuilder/pull/214) `"mongodb"` query export format ([@CodMonk](https://github.com/CodMonk))

## [v3.10.0] - 2021-07-27

### Added

- New item in the `translations` prop object: `notToggle.label`
- [#210](https://github.com/react-querybuilder/react-querybuilder/pull/210) Customizable label for "not" toggle component ([@jakeboone02](https://github.com/jakeboone02))

## [v3.9.9] - 2021-03-05

### Changed

- `field`, `fieldData`, and `operator` are now required in `ValueEditorProps`

## [v3.9.8] - 2021-02-22

### Added

- [#190](https://github.com/react-querybuilder/react-querybuilder/pull/190) Export default components `ActionElement`, `NotToggle`, `ValueEditor`, and `ValueSelector` ([@jakeboone02](https://github.com/jakeboone02))

## [v3.9.7] - 2021-02-18

### Fixed

- [#188](https://github.com/react-querybuilder/react-querybuilder/pull/188) Any extra attributes in the `query` prop will be persisted ([@jakeboone02](https://github.com/jakeboone02))

## [v3.9.6] - 2021-02-15

### Fixed

- Add base CSS to the package

## [v3.9.5] - 2021-02-08

### Fixed

- Updated README.md for npm

## [v3.9.4] - 2021-02-06

### Fixed

- Critical bug with [v3.9.3] where React wasn't in scope

## [v3.9.3] - 2021-02-05

### Added

- [#179](https://github.com/react-querybuilder/react-querybuilder/pull/179) Added `enableMountQueryChange` prop to allow disabling initial `onQueryChange` call ([@saurabhnemade](https://github.com/saurabhnemade))

## [v3.9.2] - 2021-01-24

### Added

- [#178](https://github.com/react-querybuilder/react-querybuilder/pull/178) Export several default configuration options ([@jakeboone02](https://github.com/jakeboone02))
  - `defaultCombinators`
  - `defaultOperators`
  - `defaultTranslations`
  - `defaultValueProcessor`

## [v3.9.1] - 2021-01-17

### Changed

- [#175](https://github.com/react-querybuilder/react-querybuilder/pull/175) Replaced `nanoid` with `Math.random()` ([@jakeboone02](https://github.com/jakeboone02))

### Fixed

- This release removes the requirement to re-map the `window.msCrypto` object to `window.crypto` for IE11. Woohoo!

## [v3.9.0] - 2020-12-07

### Added

- [#171](https://github.com/react-querybuilder/react-querybuilder/pull/171) Add `context` prop to pass arbitrary data to custom components ([@jakeboone02](https://github.com/jakeboone02))

## [v3.8.4] - 2020-11-16

### Added

- [#167](https://github.com/react-querybuilder/react-querybuilder/pull/167) `placeholder` support for text fields ([@eddie-xavi](https://github.com/eddie-xavi))

## [v3.8.3] - 2020-11-04

### Fixed

- Bug with using false as `defaultValue`

## [v3.8.2] - 2020-11-03

### Fixed

- [#164](https://github.com/react-querybuilder/react-querybuilder/pull/164) Fixed setting of default values ([@jakeboone02](https://github.com/jakeboone02))

## [v3.8.1] - 2020-10-23

### Fixed

- Gets correct default operator when using field-level config

## [v3.8.0] - 2020-10-09

### Changed

- The default operators list has been rearranged so that `"="` is first in the list and therefore the default for new rules. Previously it was `"null"`.

### Added

- Several options that required the use of functions at the query level can now be configured at the field level:
  - Operators: use the `operators` property on a field instead of the `getOperators` prop
  - Value editor type: use the `valueEditorType` property on a field instead of the `getValueEditorType` prop
  - Input type: use the `inputType` property on a field instead of the `getInputType` prop
  - Values: if the value editor type is `select` or `radio`, use the `values` property on a field instead of the `getValues` prop
  - Default value: use the `defaultValue` property on a field instead of the `getDefaultValue` prop
- [#160](https://github.com/react-querybuilder/react-querybuilder/pull/160) Added field-level configuration options ([@jakeboone02](https://github.com/jakeboone02))

## [v3.7.1] - 2020-10-07

### Fixed

- [#158](https://github.com/react-querybuilder/react-querybuilder/pull/158) `createRule` was setting `name` to `undefined` when fields are empty ([@saurabhnemade](https://github.com/saurabhnemade))

## [v3.7.0] - 2020-10-04

### Added

- [#157](https://github.com/react-querybuilder/react-querybuilder/pull/157) `getDefaultField` and `getDefaultValue` props ([@jakeboone02](https://github.com/jakeboone02))

### Fixed

- Allow nulls to be returned from getOperators and getValueEditorType

## [v3.6.0] - 2020-10-01

### Changed

- [#155](https://github.com/react-querybuilder/react-querybuilder/pull/155) Refactored `formatQuery` options ([@jakeboone02](https://github.com/jakeboone02))
  - `valueProcessor` is no longer the third argument of `formatQuery`. To use a custom `valueProcessor`, pass an options object as the second parameter and include `valueProcessor` as a key in that object.
  - When the `formatQuery` format is set to `sql` (either by `formatQuery(query, 'sql')` or `formatQuery(query, { format: 'sql' })`), the values will be quoted with single quotes instead of double quotes, e.g. `(name = 'Peter Parker')`.

## [v3.5.1] - 2020-06-22

### Fixed

- Prevent lodash from assigning global `_` variable 74ee1ca

## [v3.5.0] - 2020-06-20

### Changed

- [#145](https://github.com/react-querybuilder/react-querybuilder/pull/145) Convert source to TypeScript ([@jakeboone02](https://github.com/jakeboone02))
- [#135](https://github.com/react-querybuilder/react-querybuilder/pull/135) Reset `value` on `operator` change ([@artenator](https://github.com/artenator))

### Added

- Option to reset rule on operator change
- [#144](https://github.com/react-querybuilder/react-querybuilder/pull/144) IE11 support ([@jakeboone02](https://github.com/jakeboone02))

## [v3.4.0] - 2020-06-15

### Added

- [#142](https://github.com/react-querybuilder/react-querybuilder/pull/142) Customizable `Rule` component ([@jakeboone02](https://github.com/jakeboone02))

## [v3.3.0] - 2020-06-12

### Added

- [#141](https://github.com/react-querybuilder/react-querybuilder/pull/141) `RuleGroup` can now be replaced with a custom component ([@rbalaine](https://github.com/rbalaine))

### Changed

- Some TypeScript type names have changed, e.g. `Rule` is now `RuleType` since `Rule` is an exported React component.

## [v3.2.0] - 2020-05-28

### Added

- [#139](https://github.com/react-querybuilder/react-querybuilder/pull/139) `"parameterized"` option for `formatQuery` ([@jakeboone02](https://github.com/jakeboone02))

## [v3.1.2] - 2020-03-19

### Added

- `"json_without_ids"` option for `formatQuery`

## [v3.1.1] - 2020-02-18

### Fixed

- v3.1.0 published files were outdated

## [v3.1.0] - 2020-02-18

### Added

- [#122](https://github.com/react-querybuilder/react-querybuilder/pull/122) `resetOnFieldChange` prop to control `value` and `operator` reset functionality on `field` change ([@lakk1](https://github.com/lakk1))

## [v3.0.2] - 2019-12-09

### Fixed

- [v3.0.1] published files were outdated

## [v3.0.1] - 2019-12-06

### Fixed

- [#117](https://github.com/react-querybuilder/react-querybuilder/pull/117) Rule default value on add/change ([@xxsnakerxx](https://github.com/xxsnakerxx))

## [v3.0.0] - 2019-11-29

### Added

- [#115](https://github.com/react-querybuilder/react-querybuilder/pull/115) Add `div.ruleGroup-header` ([@jakeboone02](https://github.com/jakeboone02))
  - A `div` with class `ruleGroup-header` now wraps around the rule group header elements to assist with styling those elements as a group. This may affect some custom CSS rules that depend on the particular HTML arrangement in versions earlier than 3.0.0.

## [v2.5.1] - 2019-11-11

### Fixed

- [#113](https://github.com/react-querybuilder/react-querybuilder/pull/113) Passing `not` property to rule groups below root ([@RomanLamsal1337](https://github.com/RomanLamsal1337))

## [v2.5.0] - 2019-11-10

### Changed

- Lowercase operator labels

### Fixed

- [#111](https://github.com/react-querybuilder/react-querybuilder/pull/111), [#112](https://github.com/react-querybuilder/react-querybuilder/pull/112) `formatQuery` handle more operators ([@oumar-sh](https://github.com/oumar-sh))

## [v2.4.0] - 2019-09-23

### Added

- [#107](https://github.com/react-querybuilder/react-querybuilder/pull/107) `fieldData` prop for custom `OperatorSelector` and `ValueEditor` components ([@jakeboone02](https://github.com/jakeboone02))

## [v2.3.0] - 2019-09-16

### Added

- [#104](https://github.com/react-querybuilder/react-querybuilder/pull/104) Inversion (`"not"`) toggle switch for rule groups ([@jakeboone02](https://github.com/jakeboone02))
- [#103](https://github.com/react-querybuilder/react-querybuilder/pull/103) Added `level` and rule `id` to DOM elements ([@srinivasdamam](https://github.com/srinivasdamam))

### Changed

- [#102](https://github.com/react-querybuilder/react-querybuilder/pull/102) Replace `uuid` with `nanoid` ([@srinivasdamam](https://github.com/srinivasdamam))

## [v2.2.1] - 2019-08-29

### Fixed

- TypeScript definitions

## [v2.2.0] - 2019-08-29

### Added

- [#96](https://github.com/react-querybuilder/react-querybuilder/pull/96) `showCombinatorsBetweenRules` prop
- [#95](https://github.com/react-querybuilder/react-querybuilder/pull/95) `formatQuery` function

### Fixed

- Added missing props to new `ValueEditor` types
- Added `title` prop and completed `ValueEditor` props

## [v2.1.0] - 2019-08-27

### Added

- Enhanced default `ValueEditor` to handle multiple input types ([#94](https://github.com/react-querybuilder/react-querybuilder/pull/94))

## [v2.0.1] - 2019-08-27

### Added

- [#93](https://github.com/react-querybuilder/react-querybuilder/pull/93) Pass in new root to `_notifyQueryChange` ([@pumbor](https://github.com/pumbor))
- [#84](https://github.com/react-querybuilder/react-querybuilder/pull/84) Add `className` prop to `ValueEditor`, pass it on to `input` element ([@kkkrist](https://github.com/kkkrist))

## [v2.0.0] - 2019-08-18

### Changed

- [#87](https://github.com/react-querybuilder/react-querybuilder/pull/87) Hooks rewrite and increased test coverage ([@jakeboone02](https://github.com/jakeboone02))

### Fixed

- [#82](https://github.com/react-querybuilder/react-querybuilder/pull/82) Removed type restrictions on rule `value`s ([@jakeboone02](https://github.com/jakeboone02))

## [v1.4.3] - 2018-04-08

### Fixed

- [#60](https://github.com/react-querybuilder/react-querybuilder/pull/60) Fixed TypeScript function parameter definitions ([@jakeboone02](https://github.com/jakeboone02))

## [v1.4.2] - 2018-03-02

### Added

- [#55](https://github.com/react-querybuilder/react-querybuilder/pull/55) Add optional `id` information in README ([@CharlyJazz](https://github.com/CharlyJazz))

## [v1.4.1] - 2018-03-02

### Added

- [#53](https://github.com/react-querybuilder/react-querybuilder/pull/53) Add optional `id` property to `fields` ([@CharlyJazz](https://github.com/CharlyJazz))

## [v1.4.0] - 2017-12-11

### Fixed

- [#46](https://github.com/react-querybuilder/react-querybuilder/pull/46) Types: Added `id` attribute to `RuleGroup` ([@jakeboone02](https://github.com/jakeboone02))

### Added

- [#47](https://github.com/react-querybuilder/react-querybuilder/pull/47) Add `translations` prop to be able to set translatable texts ([@bubenkoff](https://github.com/bubenkoff))
- [#44](https://github.com/react-querybuilder/react-querybuilder/pull/44) Add TypeScript typings ([@jakeboone02](https://github.com/jakeboone02))
- [#42](https://github.com/react-querybuilder/react-querybuilder/pull/42) Converted `Rule` subcomponents to SFCs ([@jakeboone02](https://github.com/jakeboone02))

## [v1.3.8] - 2017-07-14

### Fixed

- [#37](https://github.com/react-querybuilder/react-querybuilder/pull/37) package updates and making it compatible with codesandbox.io ([@pavanpodila](https://github.com/pavanpodila))

## [v1.3.6] - 2017-03-13

### Added

- [#28](https://github.com/react-querybuilder/react-querybuilder/pull/28) Add `field` to operator selector control element ([@SamLoy](https://github.com/SamLoy))
- [#27](https://github.com/react-querybuilder/react-querybuilder/pull/27) Added more context information to `controlElements` ([@SamLoy](https://github.com/SamLoy))

## [v1.3.5] - 2017-02-06

### Fixed

- [#24](https://github.com/react-querybuilder/react-querybuilder/pull/24) README: Update live demo link to use v1.3.4 and React 15 ([@mreishus](https://github.com/mreishus))
- [#23](https://github.com/react-querybuilder/react-querybuilder/pull/23) README.md Usage - destructuring removed from import ([@mreishus](https://github.com/mreishus))

## [v1.3.4] - 2017-01-23

### Added

- [#18](https://github.com/react-querybuilder/react-querybuilder/pull/18) Add code coverage & TravisCI ([@maniax89](https://github.com/maniax89))
- [#17](https://github.com/react-querybuilder/react-querybuilder/pull/17) Add npm-based changelog generator ([@maniax89](https://github.com/maniax89))

## [v1.3.0] - 2016-10-12

### Fixed

- [#15](https://github.com/react-querybuilder/react-querybuilder/pull/15) Fix test setup ([@maniax89](https://github.com/maniax89))
- [#11](https://github.com/react-querybuilder/react-querybuilder/pull/11) Move 'this' binding to `componentWillMount` ([@maniax89](https://github.com/maniax89))
- [#9](https://github.com/react-querybuilder/react-querybuilder/pull/9) Remove unnecessary imports ([@maniax89](https://github.com/maniax89))

### Added

- [#13](https://github.com/react-querybuilder/react-querybuilder/pull/13) Rule group tests ([@maniax89](https://github.com/maniax89))
- [#12](https://github.com/react-querybuilder/react-querybuilder/pull/12) Add `ActionElement` tests to `<Rule />` ([@maniax89](https://github.com/maniax89))
- [#10](https://github.com/react-querybuilder/react-querybuilder/pull/10) WIP: Add `<Rule />` Tests ([@maniax89](https://github.com/maniax89))
- [#8](https://github.com/react-querybuilder/react-querybuilder/pull/8) WIP: Added CHANGELOG.md ([@maniax89](https://github.com/maniax89))
- [#7](https://github.com/react-querybuilder/react-querybuilder/pull/7) Add in `ActionElement` for custom `<button />` elements ([@maniax89](https://github.com/maniax89))
- [#6](https://github.com/react-querybuilder/react-querybuilder/pull/6) Custom rule controls ([@maniax89](https://github.com/maniax89))

## [v1.2.0] - 2016-07-11

### Fixed

- [#1](https://github.com/react-querybuilder/react-querybuilder/pull/1) fix missing field ([@vitorhsb](https://github.com/vitorhsb))

## [v1.1.0] - 2016-06-27

### Added

- `controlClassnames` prop
- Documentation update

## [v1.0.10] - 2016-06-26

### Fixed

- Stop event propagation for buttons
- Proper `dist` path

## [v1.0.9] - 2016-06-20

### Added

- Documentation update

## [v1.0.8] - 2016-06-19

### Added

- Documentation update

## [v1.0.7] - 2016-06-19

### Added

- Live demo URL to README

## [v1.0.6] - 2016-06-19

### Added

- `react` and `react-dom` to `devDependencies`

## [v1.0.5] - 2016-06-19

### Fixed

- Documentation update

## [v1.0.4] - 2016-06-19

### Added

- Documentation and demo

## [v1.0.3] - 2016-06-19

### Added

- Include query-builder.scss in `dist`

## [v1.0.2] - 2016-06-19

### Added

- "Pending" documentation note

## [v1.0.1] - 2016-06-19

### Changed

- Build artifacts moved from `lib` to `dist`

## [v1.0.0] - 2016-06-19

### Added

- Initial publish

[unreleased]: https://github.com/react-querybuilder/react-querybuilder/compare/v5.2.0...HEAD
[v5.2.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v5.1.3...v5.2.0
[v5.1.3]: https://github.com/react-querybuilder/react-querybuilder/compare/v5.1.2...v5.1.3
[v5.1.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v5.1.1...v5.1.2
[v5.1.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v5.1.0...v5.1.1
[v5.1.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v5.0.0...v5.1.0
[v5.0.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.5.3...v5.0.0
[v4.5.3]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.5.2...v4.5.3
[v4.5.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.5.1...v4.5.2
[v4.5.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.5.0...v4.5.1
[v4.5.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.4.1...v4.5.0
[v4.4.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.4.0...v4.4.1
[v4.4.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.3.1...v4.4.0
[v4.3.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.2.5...v4.3.1
[v4.2.5]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.2.4...v4.2.5
[v4.2.4]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.2.3...v4.2.4
[v4.2.3]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.2.2...v4.2.3
[v4.2.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.2.1...v4.2.2
[v4.2.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.2.0...v4.2.1
[v4.2.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.1.3...v4.2.0
[v4.1.3]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.1.2...v4.1.3
[v4.1.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.1.1...v4.1.2
[v4.1.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.1.0...v4.1.1
[v4.1.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.0.0...v4.1.0
[v4.0.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.0.0-beta.8...v4.0.0
[v4.0.0-beta.8]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.0.0-beta.7...v4.0.0-beta.8
[v4.0.0-beta.7]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.0.0-beta.6...v4.0.0-beta.7
[v4.0.0-beta.6]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.0.0-beta.5...v4.0.0-beta.6
[v4.0.0-beta.5]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.0.0-beta.4...v4.0.0-beta.5
[v4.0.0-beta.4]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.0.0-beta.3...v4.0.0-beta.4
[v4.0.0-beta.3]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.0.0-beta.2...v4.0.0-beta.3
[v4.0.0-beta.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.0.0-beta.1...v4.0.0-beta.2
[v4.0.0-beta.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.12.1...v4.0.0-beta.1
[v3.12.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.12.0...v3.12.1
[v3.12.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.11.1...v3.12.0
[v3.11.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.11.0...v3.11.1
[v3.11.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.10.1...v3.11.0
[v3.10.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.10.0...v3.10.1
[v3.10.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.9.9...v3.10.0
[v3.9.9]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.9.8...v3.9.9
[v3.9.8]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.9.7...v3.9.8
[v3.9.7]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.9.6...v3.9.7
[v3.9.6]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.9.5...v3.9.6
[v3.9.5]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.9.4...v3.9.5
[v3.9.4]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.9.3...v3.9.4
[v3.9.3]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.9.2...v3.9.3
[v3.9.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.9.1...v3.9.2
[v3.9.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.9.0...v3.9.1
[v3.9.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.8.4...v3.9.0
[v3.8.4]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.8.3...v3.8.4
[v3.8.3]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.8.2...v3.8.3
[v3.8.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.8.1...v3.8.2
[v3.8.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.8.0...v3.8.1
[v3.8.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.7.1...v3.8.0
[v3.7.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.7.0...v3.7.1
[v3.7.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.6.0...v3.7.0
[v3.6.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.5.1...v3.6.0
[v3.5.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.5.0...v3.5.1
[v3.5.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.4.0...v3.5.0
[v3.4.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.3.0...v3.4.0
[v3.3.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.2.0...v3.3.0
[v3.2.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.1.2...v3.2.0
[v3.1.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.1.1...v3.1.2
[v3.1.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.1.0...v3.1.1
[v3.1.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.0.2...v3.1.0
[v3.0.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.0.1...v3.0.2
[v3.0.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v3.0.0...v3.0.1
[v3.0.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v2.5.1...v3.0.0
[v2.5.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v2.5.0...v2.5.1
[v2.5.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v2.4.0...v2.5.0
[v2.4.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v2.3.0...v2.4.0
[v2.3.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v2.2.1...v2.3.0
[v2.2.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v2.2.0...v2.2.1
[v2.2.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v2.1.0...v2.2.0
[v2.1.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v2.0.1...v2.1.0
[v2.0.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v2.0.0...v2.0.1
[v2.0.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.4.3...v2.0.0
[v1.4.3]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.4.2...v1.4.3
[v1.4.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.4.1...v1.4.2
[v1.4.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.4.0...v1.4.1
[v1.4.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.3.8...v1.4.0
[v1.3.8]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.3.6...v1.3.8
[v1.3.6]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.3.5...v1.3.6
[v1.3.5]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.3.4...v1.3.5
[v1.3.4]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.3.0...v1.3.4
[v1.3.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.2.0...v1.3.0
[v1.2.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.1.0...v1.2.0
[v1.1.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.0.10...v1.1.0
[v1.0.10]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.0.9...v1.0.10
[v1.0.9]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.0.8...v1.0.9
[v1.0.8]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.0.7...v1.0.8
[v1.0.7]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.0.6...v1.0.7
[v1.0.6]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.0.5...v1.0.6
[v1.0.5]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.0.4...v1.0.5
[v1.0.4]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.0.3...v1.0.4
[v1.0.3]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.0.2...v1.0.3
[v1.0.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.0.1...v1.0.2
[v1.0.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v1.0.0...v1.0.1
[v1.0.0]: https://github.com/react-querybuilder/react-querybuilder/releases/tag/v1.0.0
