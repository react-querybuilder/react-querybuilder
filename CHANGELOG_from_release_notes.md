# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking changes

<!--
### ESM only

All packages published from this repository are now built as [ES modules only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). You may continue to use `react-querybuilder` and any of the compatibility packages in a CommonJS or UMD environment by using the latest v4 release.

-->

### Drag-and-drop functionality migrated (#343)

In order to make the `react-dnd` dependency completely optional when the `enableDragAndDrop` prop was not set to `true`, drag-and-drop functionality was extracted from `react-querybuilder` into a new package called [`@react-querybuilder/dnd`](https://www.npmjs.com/package/@react-querybuilder/dnd).

The new package has `peerDependencies` of `react-dnd` and `react-dnd-html5-backend` (each of which can be any version >= 14, as long as they match), but no hard `dependencies`. The only dependency in the main package now is `immer`.

#### Upgrade path

To enable drag-and-drop functionality in v5, nest `<QueryBuilder />` within a `<QueryBuilderDnD />` element. The `enableDragAndDrop` prop is implicitly `true` when using `QueryBuilderDnD`, so you no longer need to set it explicitly unless it should be `false`.

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

If your application already uses `react-dnd` and renders `DndProvider` higher up in the component tree, replace `QueryBuilderDnD` with `QueryBuilderWithoutDndProvider`.

### Bug fixes

- #324 The `@react-querybuilder/material` package now properly inherits the theme configuration from ancestor `ThemeProvider`s. Note: the `@mui/material` components are now loaded asynchronously by default, so the query builder will initially be rendered with the default components. See the [documentation](https://react-querybuilder.js.org/docs/compat#preload-mui-components) or the [README](https://github.com/react-querybuilder/react-querybuilder/blob/main/packages/material/README.md) to find out how to render the MUI components immediately.

### Features

- Each [compatibility package](https://react-querybuilder.js.org/docs/compat) now exports its own context provider that injects the appropriate `controlElements` and `controlClassnames` properties into any descendant `QueryBuilder` components (composition FTW!). This is now the recommended usage for all compatibility packages.
- The [`onAddRule`](https://react-querybuilder.js.org/docs/api/querybuilder#onaddrule) and [`onAddGroup`](https://react-querybuilder.js.org/docs/api/querybuilder#onaddgroup) callback props now receive an optional "context" parameter as the fourth argument. This parameter can be provided by a custom `addRuleAction`/`addGroupAction` component to its `handleOnClick` prop. This allows users to alter or replace the default rule based on arbitrary data. For example, the `addRuleAction` component could render two "add rule" buttons which add different rules depending on which one was clicked, as long as they provided a different `context` parameter.

<details>

<summary>Miscellaneous</summary>

- The [documentation site](https://react-querybuilder.js.org/) now has documentation for past versions.
- The `controlElements` prop has a new option: `inlineCombinator`. By default, this is a small wrapper around the `combinatorSelector` component that is used when either `showCombinatorsBetweenRules` or `independentCombinators` is `true`. The `inlineCombinator` option was only added to support `@react-querybuilder/dnd`, so there is almost certainly no reason to use it directly.

</details>

## [v5.0.0-alpha.0] - 2022-08-28

[Documentation](https://react-querybuilder.js.org/docs/next/intro) (see [`enableDragAndDrop`](https://react-querybuilder.js.org/docs/next/api/querybuilder#enabledraganddrop) and [compatibility packages](https://react-querybuilder.js.org/docs/next/compat))

**Full Changelog**: https://github.com/react-querybuilder/react-querybuilder/compare/v4.5.2...v5.0.0-alpha.0

## [v4.5.2] - 2022-08-19

### Bug fixes

- Backslashes are now properly escaped when `formatQuery` generates `JSON.parse`-able strings ("mongodb" and "json_without_ids" formats).
- The `parse*` import methods properly handle backslashes.
- #353 The `moment` package is no longer included in the build for `@react-querybuilder/antd`.

### Features

- #333 When a rule has an `operator` of "between"/"notBetween" and either `valueSource: "field"` or `valueEditorType: "select"`, the default `ValueEditor` will display two drop-down lists. The values of the drop-down lists will be joined with a comma when the rule's `value` property is updated.
- #337 In conjunction with the "between"-related enhancements above, a new Boolean prop has been added to `<QueryBuilder />` called `listsAsArrays`. This prop works in a similar manner to the [`parse*` option of the same name](https://react-querybuilder.js.org/docs/api/import#lists-as-arrays). When the prop is `true`, `ValueEditor` (and `ValueSelector` for `multiple: true`) will store lists of values, including "between" value pairs, as proper arrays instead of comma-separated strings.
  - Existing, default format:
    - `{ field: "f1", operator: "between", value: "f2,f3", valueSource: "field" }`
  - `listsAsArrays` format:
    - `{ field: "f1", operator: "between", value: ["f2", "f3"], valueSource: "field" }`

**Full Changelog**: https://github.com/react-querybuilder/react-querybuilder/compare/v4.5.1...v4.5.2

## [v4.5.1] - 2022-06-21

## Bug fixes

- The type `ValueProcessor` was incorrectly including the new `ValueProcessorByRule` type. `ValueProcessor` is now simply an alias for `ValueProcessorLegacy`, which should undo a breaking change from [v4.5.0](https://github.com/react-querybuilder/react-querybuilder/releases/tag/v4.5.0).

**Full Changelog**: https://github.com/react-querybuilder/react-querybuilder/compare/v4.5.0...v4.5.1

## [v4.5.0] - 2022-06-19

## Breaking changes...?

_TL;DR: probably not._

<details>
<summary>While a breaking change in a minor release technically violates <a href="https://semver.org/">semver</a>, the change in question is only "breaking" in a very rare--possibly non-existent--case. The <em>only</em> case where this change will break anything is if you use <code>formatQuery</code> with a custom <code>valueProcessor</code> that accepts fewer than three (3) arguments. Click for details...</summary>

- #319: `formatQuery` will now invoke custom `valueProcessor` functions with different arguments based on the function's `.length` property, which is the number of arguments a function accepts excluding those with default values:
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

## Features

- #319: Invoking `valueProcessor` with the full `RuleType` object provides access to much more information about specific rules. Standard properties that were previously unavailable include `path`, `id`, and `disabled`, but any custom properties will also be accessible.
  - The default value processors for "sql", "parameterized", "parameterized_named", "mongodb", "cel", and "spel" formats have not changed, but alternate functions using the new `fn(rule, options)` signature are now available:
    - `defaultValueProcessorByRule`
    - `defaultValueProcessorCELByRule`
    - `defaultValueProcessorMongoDBByRule`
    - `defaultValueProcessorSpELByRule`
- #320/#323: New parser functions (also available as standalone builds in the `dist` folder). Click the respective "Import from [format]" button in [the demo](https://react-querybuilder.js.org/react-querybuilder) to try them out.
  - `parseJsonLogic` takes a [JsonLogic](https://jsonlogic.com/) object and converts it to `RuleGroupType`.
  - `parseCEL` takes a [CEL](https://github.com/google/cel-spec) string and converts it to `RuleGroupType`. Click the "Import from CEL" button in [the demo](https://react-querybuilder.js.org/react-querybuilder).
- #328 New utility function `transformQuery` recursively processes rule groups and rules with the provided `ruleProcessor`, `ruleGroupProcessor`, and other options ([documentation](https://react-querybuilder.js.org/docs/api/misc#transformquery)).

## Bug fixes

- #323: `formatQuery` outputs will now escape quotation marks when appropriate:
  - For SQL ("sql", "parameterized", "parameterized_named"), single quotes will be doubled up, e.g. `(firstName = 'Ra''s')`
  - For other formats, double or single quotes will be escaped with a backslash if necessary (`firstName == 'Ra\'s'` or `firstName == "Ra\"s"`).
- #323: The standalone builds of `formatQuery` and `parseSQL` no longer include React and are not minified.

**Full Changelog**: https://github.com/react-querybuilder/react-querybuilder/compare/v4.4.1...v4.5.0

## [v4.4.1] - 2022-06-03

- New export format options:
  - **JsonLogic** ([`formatQuery` docs](https://react-querybuilder.js.org/docs/api/export#jsonlogic), [JsonLogic.com](https://jsonlogic.com/))
  - **Spring Expression Language (SpEL)** ([`formatQuery` docs](https://react-querybuilder.js.org/docs/api/export#spel), [docs.spring.io](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#expressions-language-ref))
- MongoDB export format now supports `RuleGroupTypeIC` (independent combinators).

**Full Changelog**: https://github.com/react-querybuilder/react-querybuilder/compare/v4.4.0...v4.4.1

## [v4.4.0] - 2022-05-30

## Breaking changes

_(This list may look long, but the breaking changes should only affect a small minority of users.)_

- Several utility functions that were trivial or only really useful internal to this package are no longer exported from `react-querybuilder`. To see which ones, check [the `internal` folder](https://github.com/react-querybuilder/react-querybuilder/tree/main/packages/react-querybuilder/src/internal). All exports from that folder were previously exported from [the `utils` folder](https://github.com/react-querybuilder/react-querybuilder/tree/main/packages/react-querybuilder/src/utils), which is re-exported in its entirety from the [main entry point](https://github.com/react-querybuilder/react-querybuilder/blob/main/packages/react-querybuilder/src/index.ts#L8).
- The `RuleProps` and `RuleGroupProps` interfaces have deprecated the props that were individual properties of rules/groups, and have added a prop containing the full rule or group object. This should only affect users that implement a custom `<RuleGroup />` component but use the default `<Rule />` component, since `<Rule />` now expects a `rule` prop.
  - In `RuleProps`: `field`, `operator`, `value`, and `valueSource` are deprecated and replaced by `rule: RuleType`.
  - In `RuleGroupProps`: `combinator`, `rules`, and `not` are deprecated and replaced by `ruleGroup: RuleGroupTypeAny`.
- Internal methods for immutably updating queries have been moved from the `schema` prop to the new `actions` prop on both `RuleProps` and `RuleGroupProps`. Custom `<Rule />` and `<RuleGroup />` components will need to adjust their prop declarations.

## Bug fixes

- `vite-tsconfig-paths` was mistakenly added to the `dependencies` list instead of `devDependencies` for the main package in [v4.1.3](https://github.com/react-querybuilder/react-querybuilder/releases/tag/v4.1.3) (8ef25422).

## Features

- `debugMode` now triggers logging when the query or options are updated and when a query update fails for some reason (e.g. the path is disabled).
- New `onLog` callback prop is used instead of `console.log` when `debugMode` is `true`.
- As a consequence of the new properties on `RuleProps` and `RuleGroupProps` (`rule` and `ruleGroup`, respectively), custom `<Rule />` and `<RuleGroup />` components now have access to their full rule/group objects, including any non-standard properties. This can greatly simplify the use of customized query objects.
- `<QueryBuilder />` will detect potential problems with using the component in a controlled vs uncontrolled manner and will log errors to the console (in "development" mode only). This includes the following situations:
  - Both `query` and `defaultQuery` props are defined (TypeScript will complain about this at compile time, errors will be logged at run time)
  - `query` prop is undefined in one render and then defined in the next render
  - `query` prop is defined in one render and then undefined in the next render

**Full Changelog**: https://github.com/react-querybuilder/react-querybuilder/compare/v4.3.1...v4.4.0

## [v4.3.1] - 2022-05-21

## Breaking changes

- If using TypeScript, custom `operatorSelector` components will now need to accommodate `OptionGroup<NameLabelPair>[]` in addition to the normal `NameLabelPair[]`.

## Features

- Many compatibility components now accept the props of the rendered library component in addition to the standard props ([see documentation](https://react-querybuilder.js.org/docs/compat#customization)), allowing customization specific to the style library. (#304)
- New prop `autoSelectOperator` ([documentation](https://react-querybuilder.js.org/docs/api/querybuilder#autoselectoperator)) behaves like [`autoSelectField`](https://react-querybuilder.js.org/docs/api/querybuilder#autoselectfield) but for the operator selector. (#306)
  - The `fields` and `operators` properties of the `translations` prop object now accept `placeholderName`, `placeholderLabel`, and `placeholderGroupLabel` properties ([documentation](https://react-querybuilder.js.org/docs/api/querybuilder#translations)). These translatable strings set the default field and operator values and labels when `autoSelectField` and/or `autoSelectOperator` are set to `false`. (#306)
  - Corresponding options were also added to [`formatQuery`](https://react-querybuilder.js.org/docs/api/export#placeholder-values), which will now ignore rules where the `field` or `operator` match the placeholder values for most export formats. (#306)
- Added support for wildcards concatenated to field names in `parseSQL`. (#303) Examples:

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

## Miscellaneous

- `react-querybuilder` and the compatibility packages are all built with React v18 now (the `peerDependencies` version is still `">=16.8.0"`). Previous 4.x versions were usable within React 18 applications, but now the build and tests explicitly use it. (#301)
- The CodeSandbox CI template is now located [within the repository](https://github.com/react-querybuilder/react-querybuilder/tree/main/examples/ci), and several other CodeSandbox-compatible examples have been added as well (see [examples folder](https://github.com/react-querybuilder/react-querybuilder/tree/main/examples)) (#308).

**Full Changelog**: https://github.com/react-querybuilder/react-querybuilder/compare/v4.2.5...v4.3.1

## [v4.2.5] - 2022-05-12

- Added two options to the `translations` prop: `fields.placeholderLabel` and `fields.placeholderGroupLabel`. These will be used in place of the default `"------"` when the [`autoSelectField` prop](https://react-querybuilder.js.org/docs/api/querybuilder#autoselectfield) is set to `false`.
- All translation properties are now optional.

**Full Changelog**: https://github.com/react-querybuilder/react-querybuilder/compare/v4.2.4...v4.2.5

## [v4.2.4] - 2022-05-12

- Added a `parseNumbers` option for `formatQuery`.
- Added a `debugMode` prop on `<QueryBuilder />`.

**Full Changelog**: https://github.com/react-querybuilder/react-querybuilder/compare/v4.2.3...v4.2.4

## [v4.2.3] - 2022-04-05

This release adds a new [Common Expression Language (CEL)](https://github.com/google/cel-spec) export format for `formatQuery`. (Thanks, @dzmitry-lahoda!)

## [v4.2.2] - 2022-03-12

This release fixes the "IC" aka "independent combinator" type exports (`RuleGroupTypeIC`, etc.).

## [v4.2.1] - 2022-03-03

This release adds an `operator` parameter to the `comparator` function property of the `Field` interface.

## [v4.2.0] - 2022-02-02

## Breaking changes

- When calling `formatQuery` with the "mongodb" format and a custom `valueProcessor`, the `valueProcessor` function will now need to return the full expression object and not just the operator/value portion. For example, `defaultMongoDBValueProcessor('firstName', '=', 'Steve')` previously returned `{"$eq":"Steve"}`, but now returns `{"firstName":{"$eq":"Steve"}}`.

## Bug fixes

- #276: When using `react-querybuilder` v4 within an application that already implemented `react-dnd`, an error would appear: "Cannot have two HTML5 backends at the same time." This can now be resolved by using the `<QueryBuilderWithoutDndProvider />` component instead of `<QueryBuilder />`. They are functionally the same, but the former allows (in fact, _relies on_) a `react-dnd` backend (e.g. `react-dnd-html5-backend`) to be implemented higher up in the component tree.
- Previously, the `parseSQL` method would accept boolean comparison clauses with an identifier (field name) on the left or right of the operator, but not on both sides (at least one side had to be a primitive string, numeric, or boolean). If the identifier was on the right, `parseSQL` would flip the clause so that the field name was on the left and the value on the right, but it wouldn't flip the operator (`<` should become `>`, etc.). The operator will now be flipped when appropriate.

## New features

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

## Bug fixes

- The path to the CommonJS build was wrong in package.json for the main package. This has been fixed.
- The `RuleGroupArray` type (used for the `rules` property of `RuleGroupType`) has been simplified to `(RuleType | RuleGroupType)[]`. This should make it easier to extend and/or narrow `RuleGroupType`.

## [v4.1.2] - 2022-01-12

## Bug fixes

- `parseSQL` was returning conventional rule groups (combinators at the group level) in some situations even when the `independentCombinators` option was set to `true`. The option will now guarantee a return type of `RuleGroupTypeIC`.

## Features

- Added `convertQuery` method to toggle a query between the conventional structure with combinators at the group level (`RuleGroupType`) and the "independent combinator" structure (`RuleGroupTypeIC`, used with the `independentCombinators` prop). For unidirectional conversions, `convertToIC` and `convertFromIC` are also available.
- The specific return type of the `parseSQL` method (`RuleGroupType` or `RuleGroupTypeIC`) is now inferred from the parameters.

## [v4.1.1] - 2022-01-10

- Improve recursive types `RuleGroupType` and `RuleGroupTypeIC` to pass down the `R` (rule) and `C` (combinator) generics to the `rules` array.

## [v4.1.0] - 2022-01-09

- Minimum TypeScript version has been lowered to 4.1.2, down from 4.5 in `react-querybuilder` v4.0.0.
- All `ValueSelector`-based components, including field selectors, operator selectors, combinator selectors, and value editors where the `type` is "select" now support option groups. Pass `{ label: string; options: NameLabelPair[] }[]` instead of `NameLabelPair[]`.
- TypeScript types for rules and groups now use generics which can be used to narrow certain member types more easily.

## [v4.0.0] - 2021-12-28

## Documentation

- Shiny new documentation site! https://react-querybuilder.js.org

## Official compatibility components

- We now provide official compatibility components for several popular style frameworks (as seen in the [demo](https://react-querybuilder.js.org/react-querybuilder)), with more to come! Check out the [`@react-querybuilder` org on npm](https://www.npmjs.com/org/react-querybuilder).

## Breaking changes

- Minimum TypeScript version is now 4.5.0.
- The default styles (`query-builder.css` and `query-builder.scss`) now use flexbox. This should allow greater flexibility and more consistent styling, but you'll need to use a different stylesheet for IE due to poor flexbox support. The [new IE-compatible demo page](https://react-querybuilder.github.io/react-querybuilder/ie11.html) uses styles more suitable for IE.
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

## Bug fixes

- The default `ValueEditor` component was calling the `useEffect` hook conditionally, which is _way_ against the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html). It is now called unconditionally.
- When the `formatQuery` export format is "mongodb", the resulting string can be parsed by `JSON.parse`.

## Features

- All props on the `<QueryBuilder />` component are now optional
- `<QueryBuilder />` is now a properly controlled or uncontrolled component depending on which props are passed in. If you pass a `query` prop, the query will not change until a new `query` is passed in. You should use the parameter of the `onQueryChange` callback to update the `query` prop. Typically this involves using React's `useState` hook. To render an _uncontrolled_ component, don't pass a `query` prop. You can set the initial query by using the new `defaultQuery` prop, and you can still listen for changes with `onQueryChange`.
- The `query-builder.scss` file now uses variables instead of hard-coded colors and spacing. Feel free to import it and override the default values with your own theme's colors/styles/etc.
- Drag-and-drop! [Pass the `enableDragAndDrop` prop](https://react-querybuilder.github.io/react-querybuilder/#enableDragAndDrop=true) to display a drag handle on each rule and group header. Users will be able to reorder and relocate rules and groups.
- Independent combinators! Wait...what does that even mean? [When the `independentCombinators` prop is `true`](https://react-querybuilder.github.io/react-querybuilder/#independentCombinators=true), `<QueryBuilder />` will insert an independent "and/or" selector between each pair of sibling rules/groups. This new feature shouldn't introduce any breaking changes since it's opt-in, i.e. if `independentCombinators` is undefined or `false`, then the `<QueryBuilder />` should behave basically the same as it did in v3.x.
- New `disabled` prop to prevent changes to the query. All sub-components and form elements get the `disabled` prop as well. Pass `true` to disable the entire query, or pass an array of paths to disable specific rules/groups.
- `parseSQL` method to import queries from SQL ([documentation](https://react-querybuilder.js.org/docs/api/import) / [demo](https://react-querybuilder.github.io/react-querybuilder/) -- click the "Load from SQL" button).
- `formatQuery` accepts a new `format` type: "parameterized_named" ([documentation](https://react-querybuilder.js.org/docs/api/export#named-parameters)). This new format is similar to "parameterized", but instead of anonymous `?`-style bind variables, each parameter is given a unique name based on the field name and the order in the query. A corresponding `paramPrefix` option is available in order to use a different character than the default ":" within the `sql` string.

https://github.com/react-querybuilder/react-querybuilder/compare/v3.12.1...v4.0.0

## [v4.0.0-beta.8] - 2021-12-24

- Fix a couple of issues with the "mongodb" `formatQuery` export type.
- Add a `disabled` prop
- Export the default `RuleGroup` component

**Full Changelog**: https://github.com/react-querybuilder/react-querybuilder/compare/v3.12.1...v4.0.0-beta.8

## [v4.0.0-beta.7] - 2021-12-13

This release (hopefully) fixes an issue with drag-and-drop when using `independentCombinators`.

**Full Changelog**: https://github.com/react-querybuilder/react-querybuilder/compare/v3.12.1...v4.0.0-beta.7

## [v4.0.0-beta.6] - 2021-11-27

This was primarily a maintenance release focused on converting to a monorepo with Vite driving the build process.

## Features

- If using `react-querybuilder` with NodeJS, and you only want to use the `formatQuery` function, you no longer have to install React on the server as well. Just `import formatQuery from 'react-querybuilder/dist/formatQuery'`. Note: TypeScript types are not available for this export.

**Full Changelog**: https://github.com/react-querybuilder/react-querybuilder/compare/v3.12.1...v4.0.0-beta.6

## [v4.0.0-beta.5] - 2021-11-12

## Breaking changes

- Earlier 4.0 beta releases had an `inlineCombinators` prop. This has been renamed to `independentCombinators`.

### Styles

- The default styles now use flexbox. This should allow greater flexibility and more consistent styling.
- The `query-builder.scss` file now uses variables instead of hard-coded colors and spacing. Feel free to import it and override the default values with your own theme's colors/styles/etc.

### Structure

- A new drag handle element sits at the front of every rule and rule group header element. If you are not using the drag-and-drop feature (see Features section below), you should hide the drag handle by using the default stylesheet which hides it automatically when `enableDragAndDrop` is `false`, or hide it with a rule like `.queryBuilder-dragHandle { display: none; }`.

### Behavior

- `<QueryBuilder />` is now a properly controlled or uncontrolled component depending on which props are passed in. If you pass a `query` prop, the query will not change until a new `query` is passed in. You should use the parameter of the `onQueryChange` callback to update the `query` prop. Typically this involves using React's `useState` hook. To render an _uncontrolled_ component, don't pass a `query` prop. You can set the initial query by using the new `defaultQuery` prop, and you can still listen for changes with `onQueryChange`.

## Features

- Drag-and-drop! Pass the `enableDragAndDrop` prop to display a drag handle on each rule and group header. Users will be able to reorder rules and groups with the click (and drag) of a mouse.

## Miscellaneous

- Dropped `lodash` dependency. Added `immer` and `react-dnd`.
- New IE11-compatible demo page.

https://github.com/react-querybuilder/react-querybuilder/compare/v4.0.0-beta.4...v4.0.0-beta.5

## [v4.0.0-beta.4] - 2021-11-03

## Bug fixes

- v4.0.0-beta.3 had an outdated build

## Features

- All props on the `<QueryBuilder />` component are now optional

## Commits

- Make all props optional 67dea9c

https://github.com/react-querybuilder/react-querybuilder/compare/v4.0.0-beta.3...v4.0.0-beta.4

## [v4.0.0-beta.3] - 2021-11-03

See [v4.0.0-beta.1](https://github.com/react-querybuilder/react-querybuilder/releases/tag/v4.0.0-beta.1) and [v4.0.0-beta.2](https://github.com/react-querybuilder/react-querybuilder/releases/tag/v4.0.0-beta.2) for other release notes.

## Features

This release includes a massive new feature: inline combinators! What does that mean? When the `inlineCombinators` prop is `true`, `<QueryBuilder />` will insert an independent combinator (and/or) selector between each pair of sibling rules/groups.

This new feature shouldn't introduce any breaking changes, i.e. if `inlineCombinators` is left out or `false`, then the `<QueryBuilder />` should behave the same as it did in v4.0.0-beta.2. However, the TypeScript types are significantly more complex in this release so we're going to leave this beta out for a while before releasing v4.0.0 properly.

## Commits

- Add support for inline combinators (#231) 8b9fba0

https://github.com/react-querybuilder/react-querybuilder/compare/v4.0.0-beta.2...v4.0.0-beta.3

## [v4.0.0-beta.2] - 2021-10-29

See [v4.0.0-beta.1](https://github.com/react-querybuilder/react-querybuilder/releases/tag/v4.0.0-beta.1) for other release notes.

## Features

- `parseSQL` method to import queries from SQL (see [README](https://github.com/react-querybuilder/react-querybuilder/blob/master/README.md#parsesql) for documentation or try the [demo](https://react-querybuilder.github.io/react-querybuilder/)).

## Commits

- Add parseSQL method (#230) 6f910c9

https://github.com/react-querybuilder/react-querybuilder/compare/v4.0.0-beta.1...v4.0.0-beta.2

## [v4.0.0-beta.1] - 2021-10-23

## Breaking changes

This release introduces several small API changes, both internal and external, that warrant a major version bump.

### Internal

These changes shouldn't affect most users.

- `Rule` and `RuleGroup` props now include `path: number[]`, and `id` may be undefined.
- `getLevel` has been removed from the `schema` prop.
- The following functions that are part of the `schema` prop have been refactored to use `path` or `parentPath` instead of `id` or `parentId`: `onGroupAdd`, `onGroupRemove`, `onPropChange`, `onRuleAdd`, `onRuleRemove`.

### External

These changes could potentially affect users that depend on certain features.

- `onAddRule` and `onAddGroup` callbacks now pass a `number[]` (`parentPath`) as the second argument instead of a `string` (`parentId`).
- The exported method `findRule` has been replaced by `findPath`, which is useful in conjunction with the previously mentioned, refactored `onAddRule` and `onAddGroup` callbacks.
- The `onQueryChange` callback's argument, the current query object, will include a `path` for each rule and group. The `formatQuery` default output format, "json", will also include `path`s.
- Rule and group `div`s now include a `data-path` attribute.

## Features

Only one new feature in this release.

- `formatQuery` accepts a new `format` type: "parameterized_named". This new format is similar to "parameterized", but instead of anonymous `?`-style bind variables, each parameter is given a unique name based on the field name and the order in the query. A corresponding option `paramPrefix` is available in order to use a different character than the default ":" within the `sql` string.

## Commits

- Simplify code by removing _.clone and replacing _.uniqWith with \_.uniqBy e018c5e
- Merge pull request #229 from react-querybuilder/path-based-ids 9812556
- Default to &quot;json_without_ids&quot; output format in demo d1ecdff
- Prettified code f1dcd98
- Add parameterized_named output format 7938867
- Fixed bug with key prop in RuleGroup 5e4508f
- Updated some variable names in formatQuery.test.ts 6a49d29
- Changed build command from dist to build b5fbbcd
- Converted to path-based query management from ID-based 88913e7
- Remove unnecessary dependencies 64765b0
- Merge pull request #228 from react-querybuilder/add-codesandbox-ci 62c5d99
- Specify buildCommand in CodeSandbox CI 39239d5
- Specify node version in CodeSandbox CI 2ea1840
- Add CodeSandbox CI c99f0e0
- Merge pull request #227 from react-querybuilder/syntax-highlight-demo f3bc058
- Fix demo webpack config after adding react-syntax-highlighter 20fd951
- Add syntax highlighting to the demo 6a77f54
- Fix pre line wrapping in demo f105da3
- Allow line wrapping in demo pre tag a5931f6
- Add fallbackExpression option for formatQuery d65c05e
- Update README.md with link to wiki fe76990
- Formalize the ParameterizedSQL interface f985f53

https://github.com/react-querybuilder/react-querybuilder/compare/v3.12.1...v4.0.0-beta.1

## [v3.12.1] - 2021-10-06

## Breaking changes

- The default `ValueEditor` will force the `<input />` control to have `type="text"` if the field's `inputType` is "number" and the `operator` is "between" or "notBetween". When the `operator` changes to something else, the control will revert to `type="number"` and reset the `value` if the `value` included a comma (",").
- The "parameterized" output of the `formatQuery` function will now include native numbers and boolean values in the `params` array if a rule's `value` property is a number or boolean. Previously the array included `"TRUE"` or `"FALSE"` for boolean values, and numbers were converted to strings, e.g. old way -> `params:["string","12","14","TRUE"]`, new way -> `params:["string",12,14,true]`.

## Bug fixes

- Several bugs were squashed in the `formatQuery` function when dealing with the "in"/"notIn" and "between"/"notBetween" operators.
- A couple of bugs were fixed in the [demo](https://react-querybuilder.github.io/react-querybuilder/).

## Commits

- Allow arrays where length &gt; 2 for &quot;between&quot; operator in formatQuery 6ec6831
- Changed demo to use @ant-design/icons 37944ed
- Push native numbers and booleans to params in formatQuery ec340d9
- Update custom ValueEditors in demo with between operator handling 19604cb
- Consolidated all demo examples into one query configuration b77546b
- Fix some problems with between/notBetween operators eeffea4

https://github.com/react-querybuilder/react-querybuilder/compare/v3.12.0...v3.12.1

## [v3.12.0] - 2021-10-04

This is our biggest release in a long time. Enjoy the new hotness!

## Breaking changes

- The only potentially breaking change in the main `<QueryBuilder />` component is the addition of a `<div>` in the JSX output that wraps the child rules/groups of each group. It would only affect custom CSS rules like `.ruleGroup > .rule`, since `.rule` is no longer an immediate child of `.ruleGroup`. Now use something like `.ruleGroup > .ruleGroup-body > .rule`.
- The `formatQuery` function will now ignore invalid rules for "sql", "parameterized", and "mongodb" output types. This includes rules that match one or more of the following criteria:
  - The rule fails validation (see validation feature below) based on the validation map from the query validator or the result of the field validator.
  - The rule's `operator` is "in" or "notIn" and the value is neither a non-empty string nor an array with at least one element.
  - The rule's `operator` is "between" or "notBetween" and the value is neither an array of length two (`rule.value.length === 2`) nor a string with exactly one comma that isn't the first or last character (`rule.value.split(',').length === 2` and neither element is an empty string).

## Features

- [Validation](https://github.com/react-querybuilder/react-querybuilder#validator-optional): pass a `validator` prop to validate the entire query, or include a `validator` attribute on each field in the `fields` array to validate each rule based on the selected field.
  - CSS classes will be added (`"queryBuilder-valid"` or `"queryBuilder-invalid"`) to validated rules and groups, and all sub-components will receive the validation result as a prop.
  - The `formatQuery` function has two new validation-related options: 1) `validator` (same signature as the prop mentioned earlier) and 2) `fields` (same shape as the `fields` prop). Rules and groups deemed invalid will be ignored if the output format is "sql", "parameterized", or "mongodb".
- [Rule/group cloning](https://github.com/react-querybuilder/react-querybuilder#showclonebuttons-optional): pass the `showCloneButtons` prop to enable duplication of rules and groups. Associated `controlElements` properties are also available for custom clone button components.
- [Add rule to new groups](https://github.com/react-querybuilder/react-querybuilder#addruletonewgroups-optional): pass the `addRuleToNewGroups` prop to add the default rule to all new groups automatically.
- [Default operator](https://github.com/react-querybuilder/react-querybuilder#getdefaultoperator-optional): pass a `getDefaultOperator` function prop to determine which operator is set for new rules (or include a `defaultOperator` attribute on objects in the `fields` array to set the default operator for specific fields).
- [Cancel or modify a new rule](https://github.com/react-querybuilder/react-querybuilder#onaddrule-optional)/[group](https://github.com/react-querybuilder/react-querybuilder#onaddgroup-optional): use the `onAddRule` and `onAddGroup` callbacks to return a new rule/group that will be added instead of the default, or return `false` to cancel the addition of the new rule/group. _(Note: to completely prevent the addition of new groups, you can also pass `controlElements={{ addGroupAction: () => null }}` which will hide the "+Group" button.)_
- [New "between" and "not between" default operators](https://github.com/react-querybuilder/react-querybuilder#operators-optional): the [`formatQuantity`](https://github.com/react-querybuilder/react-querybuilder#formatquantity) function has also been updated to handle the new operators properly.

## Miscellaneous

- The [demo](https://react-querybuilder.github.io/react-querybuilder/) has been updated with all the new features, and now includes tooltips on options and links to relevant documentation.
- We also cleaned up some internal stuff and dropped three dependencies! [Lodash](https://lodash.com) is now the only external dependency.

## Commits

<details>
<summary>Click to expand</summary>

- Merge pull request #225 from react-querybuilder/issue-166 9a58718
- Add note about &quot;in&quot; and &quot;between&quot; operators in formatQuery to README.md bafe7c7
- Add message to user about empty groups when validating the demo 87e29c3
- Clean up README.md c4be2fd
- Add validation options to formatQuery bff7fe3
- Add between, notBetween to default operators; handle in formatQuery f8c0d4d
- Update README.md with tips about hiding the +Rule/+Group buttons d7cf426
- Updated demo with tooltips and links to documentation 0dff5f0
- Add rule group body div 6d8569f
- Add validation options 4c1a086
- Fix clone button styling in demo a250414
- Extract standard classNames to object as const 204b511
- Merge pull request #224 from react-querybuilder/issue-221 5140f47
- Implement onAddRule and onAddGroup props; expose findRule f43fa22
- Add test for group onPropChange da98533
- Drop unnecessary dependencies eb30704
- Implement getDefaultOperator prop 4b0511e
- Implement addRuleToNewGroups prop fcbc4b9
- Merge pull request #223 from react-querybuilder/issue-222 be38794
- Lock prettier to v2.4.1 2e32240
- Prettified code eddaa1a
- Implement clone rule/group buttons ffd335d

</details>

https://github.com/react-querybuilder/react-querybuilder/compare/v3.11.1...v3.12.0

## [v3.11.1] - 2021-09-18

- Prettified code 6ff279e
- Updated prettier version in workflow ca8c774
- Prettified code a3440ef
- Updated dependencies da0bbc0
- Relaxed and corrected types related to NameLabelPair 7dce010
- Simplified formatQuery for MongoDB, added test for invalid operator ce133d9

https://github.com/react-querybuilder/react-querybuilder/compare/v3.11.0...v3.11.1

## [v3.11.0] - 2021-08-24

## Features

- Added `autoSelectField` prop, which when set to `false` will prevent automatic selection of the first field in new rules by adding an empty choice as the first option. When the empty option is selected, the operator and value components for that rule will not display.

## Commits

- Merge pull request #218 from react-querybuilder/auto-select-field 57d64c9
- Added autoSelectField prop 54895ad

https://github.com/react-querybuilder/react-querybuilder/compare/v3.10.1...v3.11.0

## [v3.10.1] - 2021-08-19

## Features

- Added the `mongodb` query export format (#214). Thanks, @CodMonk!

## Commits

- Merge pull request #216 from react-querybuilder/all-contributors/add-CodMonk cae1db7
- docs: update .all-contributorsrc [skip ci] 625f22c
- docs: update README.md [skip ci] 1707b16
- Tweaks to #214 21a4e1b
- Merge pull request #214 from CodMonk/master 9bc6d2a
- removed trailing comma b95141c
- updating readme 8425b0a
- Prettified code a5551ee
- correcting the test cases b673c7d
- removed unnecessary console statements 170828e
- correcting test case issues 287fd64
- Formatting to mongo query cabcea1
- Formatting to mongo query 0820911
- Upgrade demo to Bootstrap 5 9ca513c

https://github.com/react-querybuilder/react-querybuilder/compare/v3.10.0...v3.10.1

## [v3.10.0] - 2021-07-27

## Changes

- Added a new item in the `translations` prop object: `notToggle.label`

## Commits

- Updated dependencies 28b699c
- Merge pull request #210 from react-querybuilder/not-label 21ad7d4
- Add customizable label for &quot;not&quot; toggle component 8b94435
- Merge pull request #209 from react-querybuilder/chakra-ui 39b1afb
- Add Chakra UI demo 9421730

https://github.com/react-querybuilder/react-querybuilder/compare/v3.9.9...v3.10.0

## [v3.9.9] - 2021-03-05

- Made field, fieldData, and operator required in ValueEditorProps 948b3e3

https://github.com/react-querybuilder/react-querybuilder/compare/v3.9.8...v3.9.9

## [v3.9.8] - 2021-02-22

## Changes

- This release exposes the default components `ActionElement`, `NotToggle`, `ValueEditor`, and `ValueSelector`.

## Commits

- Merge pull request #190 from react-querybuilder/expose-default-components e255139
- Expose default components d24f989
- Add linting 555d2c1
- Prettified code 2a85297
- Better typing for test files 48c1e7d
- Merge branch &#39;master&#39; of github.com:react-querybuilder/react-querybuilder 928829e
- Update link to demo source from README.md 1b161c0
- Updated CHANGELOG.md for v3.9.7 d8347a0
- Delete types before building them 7cdb5f0

https://github.com/react-querybuilder/react-querybuilder/compare/v3.9.7...v3.9.8

## [v3.9.7] - 2021-02-18

## Fixes

- Any extra attributes in the `query` prop will be persisted (#187)

## Commits

- Removed more build artifacts (types) from source control 3a8f333
- Merge pull request #189 from react-querybuilder/jest de0f405
- Convert tests to Jest e47016d
- Merge pull request #188 from react-querybuilder/fix-187 176adf5
- Include extra attributes in valid query 39d840f
- Prettified code e5be71f
- Don&#39;t error out when values aren&#39;t passed in for select and radio types 5aa40dd
- Allow any type for ValueEditor value prop 2c35ba9

https://github.com/react-querybuilder/react-querybuilder/compare/v3.9.6...v3.9.7

## [v3.9.6] - 2021-02-15

## Changes

- This release adds the base CSS to the package

## Commits

- Add CSS file to npm package 986e0a0
- Compile SCSS as CSS for dist f846627
- Properly removed build artifacts 5ffcc8a
- Removed unnecessary import in gh-pages.publish.js 3057485
- Added config folder to pretty-print 9891536
- Added .np-config.json a229e26
- Removed build artifacts from source control 7622788
- Updated CI badge to GHA 197eb57
- Removed codecov.io from dependencies b3d5880
- Deleted .travis.yml - no longer necessary 183ae5b
- Merge pull request #183 from react-querybuilder/gha-codecov 39982df
- Add codecov upload to workflow 1bbdc28
- Merge pull request #182 from react-querybuilder/gha-build-test 670af86
- Update main.yml 431f954
- Updated README.md to instruct use of yarn instead of npm 96ed6d8

https://github.com/react-querybuilder/react-querybuilder/compare/v3.9.5...v3.9.6

## [v3.9.5] - 2021-02-08

This release was simply to update the README.md file on npm

## Commits

- Prettified Code! f5de8b2
- Updated repo URL 368de27
- Merge pull request #181 from sapientglobalmarkets/github-actions-1 e9ed972
- Prettified Code! e88c455
- Created main.yml 1565b86
- Prettified code 0e25b7e

https://github.com/react-querybuilder/react-querybuilder/compare/v3.9.4...v3.9.5

## [v3.9.4] - 2021-02-06

## Fixes

- This release fixes a critical bug with v3.9.3 where React wasn't in scope

## Commits

- Minor corrections to README.md 2a30675
- Updated CHANGELOG.md for version 3.9.3 b9277f9
- Merge pull request #180 from sapientglobalmarkets/webpack5 2ba981e
- Removed unnecessary code from demo d03489e
- Finished upgrading to webpack 5 b61ecd4
- Upgraded to webpack 5.20.2 f25126c

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.9.3...v3.9.4

## [v3.9.3] - 2021-02-05

## Commits

- Updated dist, demo, and types ee2b2af
- Converted to yarn as package manager 172ac87
- Merge pull request #179 from saurabhnemade/master d605960
- making enableMountQueryChange optional f31ed36
- added ability to disable inital queryChange 99aa54d
- Upgraded to new JSX transform 4f33442
- Updated CHANGELOG.md for v3.9.2 9081319

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.9.2...v3.9.3

## [v3.9.2] - 2021-01-24

## Features

This release exposes some default configuration options, namely:

- `defaultCombinators`
- `defaultOperators`
- `defaultTranslations`
- `defaultValueProcessor`

## Commits

- Merge pull request #178 from sapientglobalmarkets/export-default-configs 6fad5c6
- Updated README.md to include exported default configs c2f81df
- Exported default configuration objects 4f59245
- Merge pull request #176 from vitorhsb/patch-1 bd82b33
- re-add exclude regex comment 4ffb98c
- Remove unnecessary exclude pattern 826597c
- Added missing semicolons 49f7aa1
- Updated most dependencies 8286a96

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.9.1...v3.9.2

## [v3.9.1] - 2021-01-17

This release removes the requirement to re-map the `window.msCrypto` object to `window.crypto` for IE11. Woohoo!

## Commits

- Removed unnecessary exclude pattern from webpack config a74ad63
- Merge pull request #175 from sapientglobalmarkets/math-random-ids 3cd88c8
- Replaced nanoid with Math.random() 2831e66

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.9.0...v3.9.1

## [v3.9.0] - 2020-12-07

## Features

- Added `context` prop to pass arbitrary props to custom components

## Commits

- Merge pull request #171 from sapientglobalmarkets/custom-props-170 54f3b11
- Added context prop 70cad0f
- Fixed enzyme support for React 17 9ce7813
- Updated more dependencies 7db4a23
- Updated most dependencies f7e26e5
- Add @eddie-xavi as a contributor 82d2d0b

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.8.4...v3.9.0

## [v3.8.4] - 2020-11-16

- Updated dist, demo, and types 96d165d
- Merge pull request #167 from eddie-xavi/support-placeholder-text f89887e
- Added placeholder support for text fields 0260a56
- Installed prettier for consistent formatting 621da88
- Removed prop-types as a dependency 97a0d1c

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.8.3...v3.8.4

## [v3.8.3] - 2020-11-04

- Fixed bug with using false as defaultValue 071331e

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.8.2...v3.8.3

## [v3.8.2] - 2020-11-03

- Merge pull request #164 from sapientglobalmarkets/fix-163 ac80e06
- Updated dist and demo 5b4781e
- Fixed setting of default values b97bb96
- Updated some dependencies 2ae1196

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.8.1...v3.8.2

## [v3.8.1] - 2020-10-23

- Gets correct default operator when using field-level config 5ad9da5
- Added &quot;sql&quot; keyword 9eb2a45
- Minified demo bundle 14bb99a
- Added Roboto font for Material Design elements a8a7119
- Fixed &quot;Fork me&quot; banner color 5c228cb
- Reorganized demo files 1678a2d
- Added Material Design to demo style options 504f589
- Only load necessary Bootstrap styles in demo 3ef78fa
- Merge pull request #161 from sapientglobalmarkets/demo-styles d377c9d
- Updated demo 2b0a663
- Demo overhaul with Ant Design 1da3ccf
- Better Ant Design experience (drop downs still don&#39;t work) 08be23b
- Stricter typing in demo code 1ba1d52
- Fixed Bootstrap &quot;not&quot; toggle fc533cb
- Added Ant Design option to demo (CSS doesn&#39;t load properly) 7cbafd7
- Added Bootstrap styling option to demo 1679c89

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.8.0...v3.8.1

## [v3.8.0] - 2020-10-09

## Breaking Changes

- The default operators list has been rearranged so that `"="` is first in the list and therefore the default for new rules. Previously it was `"null"`.

## Features

- Several options that required the use of functions at the query level can now be configured at the field level:
  - Operators: use the `operators` property on a field instead of the `getOperators` prop
  - Value editor type: use the `valueEditorType` property on a field instead of the `getValueEditorType` prop
  - Input type: use the `inputType` property on a field instead of the `getInputType` prop
  - Values: if the value editor type is `select` or `radio`, use the `values` property on a field instead of the `getValues` prop
  - Default value: use the `defaultValue` property on a field instead of the `getDefaultValue` prop

## Commits

- Converted demo to TypeScript c619a01
- Modified demo to use field-level configuration 17e3d7d
- Merge pull request #160 from sapientglobalmarkets/field-level-configs 7ad1a60
- Used TypeScript interfaces instead of PropTypes in documentation 474049e
- Updated all-contributors badge template to match other badges b4aa4cc
- Updated dist, demo, and types 68038af
- Added field-level configuration options d65541c
- Add @saurabhnemade as a contributor 12e254f

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.7.1...v3.8.0

## [v3.7.1] - 2020-10-07

- Updated dist and demo f9fde1f
- Added Contributors link to TOC 462b887
- Merge pull request #158 from saurabhnemade/master 1efe2fb
- test case added for verification of createRule function when fields are passed empty 1ef72f5
- check added if fields are empty 0d93136

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.7.0...v3.7.1

## [v3.7.0] - 2020-10-04

- Merge pull request #157 from sapientglobalmarkets/default-field-default-value 87618b7
- Changed names to getDefaultField and getDefaultValue 9de4f26
- Allow nulls to be returned from getOperators and getValueEditorType a78c973
- Implemented defaultField and defaultValue props 4b71022

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.6.0...v3.7.0

## [v3.6.0] - 2020-10-01

## Breaking changes

- `valueProcessor` is no longer the third argument of `formatQuery`. To use a custom `valueProcessor`, pass an options object as the second parameter and include `valueProcessor` as a key in that object.
- When the `formatQuery` format is set to `sql` (either by `formatQuery(query, 'sql')` or `formatQuery(query, { format: 'sql' })`), the values will be quoted with single quotes instead of double quotes, e.g. `(name = 'Peter Parker')`.

## Commits

- Updated demo and dist 0122dfa
- Merge pull request #155 from sapientglobalmarkets/formatquery-options-refactor 9369f52
- formatQuery wraps values in single quotes 9d2e155
- Used JSON.stringify second parameter for formatQuery json_without_ids 40ce711
- Updated dist, demo, and types 7c01da0
- formatQuery second parameter optional; increased test coverage to 100% 0f52b48
- Refactored formatQuery options 6821954
- Updated dependencies 8e57112
- Added json_without_ids format option to demo c299c6f

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.5.1...v3.6.0

## [v3.5.1] - 2020-06-22

- Prevent lodash from assigning global `_` variable 74ee1ca

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.5.0...v3.5.1

## [v3.5.0] - 2020-06-20

## Overview

- Converted code base to TypeScript
- Added option to reset rule on operator change
- Supports IE11

## Commits

- Merge pull request #145 from sapientglobalmarkets/ts-conversion 92b2518
- Additional typing and reconfiguration 985e886
- Exported all types 73bedd6
- Moved test files to `__tests__` folders 8b1014a
- Converted test files to TypeScript d6b322e
- Converted main files to TypeScript 45879a5
- Implemented IE11 support (#144) c5f022e
- Merge pull request #135 from artenator/issue-132 f7e1c43
- add basic tests for resetOnOperatorChange prop e4bf3ae
- rebuild dist 602afcb
- Updated CHANGELOG.md for v3.4.0 4b3ff6a
- add documentation for `resetOnOperatorChange` c2dc04e
- Add option to reset rule on operator change in demo app 787445f
- add option to reset value on operator change 08d8f2d

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.4.0...v3.5.0

## [v3.4.0] - 2020-06-15

- Merge pull request #142 from sapientglobalmarkets/custom-rule f825497
- Implemented customizable Rule component 634b94d

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.3.0...v3.4.0

## [v3.3.0] - 2020-06-12

## Features

- `RuleGroup` can now be replaced with a custom component.

## Breaking changes

- Some TypeScript type names have changed, e.g. `Rule` is now `RuleType` since `Rule` is now the exported React component.

## Commits

- Refactored TypeScript typings 56bcf94
- Merge pull request #141 from rbalaine/master b4e1b7e
- Improve types definition &amp; simplify Rule export f41b608
- add custom control option for RuleGroup component 5be4dae
- Updated dependencies 53d596e

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.2.0...v3.3.0

## [v3.2.0] - 2020-05-28

- Fixed version number in package.json cb1e3cf
- Added files field to package.json a874685
- Merge pull request #139 from sapientglobalmarkets/parameterized-queries b47a472
- Updated dist and demo for parameterized formatQuery feature 759f7d2
- Added tests for parameterized formatQuery output ae163f0
- Added &quot;parameterized&quot; option to formatQuery f76ad2b
- Updated dependencies afa014d
- Merge pull request #131 from geekayush/readme f4a7b47
- Fix content links in readme b12d86b

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.1.2...v3.2.0

## [v3.1.2] - 2020-03-19

- Updated dist and demo files be8734c
- Small changes to README.md regarding json_without_ids formatQuery option 2af07a9
- Create &#39;json_without_ids&#39; format option in formatQuery 70ddf9c
- Fixed demo heading alignment 69270ef
- Changed default background color to blue and updated screenshot 67f66d6

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.1.1...v3.1.2

## [v3.1.1] - 2020-02-18

- Updated dist and demo for v3.1.0 b7e1cc9
- Updated CHANGELOG.md for v3.1.0 23aca84

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.1.0...v3.1.1

## [v3.1.0] - 2020-02-18

- Updated dependencies cc22b05
- Added tests for resetOnFieldChange prop c6cfea7
- Added resetOnFieldChange prop to demo and type definitions a78087e
- Merge pull request #122 from lakk1/control-field-change-reset 4ac23f8
- Add resetOnFieldChange property 3168e8c
- Updated dependencies 612020b
- Updated dependencies, dist, demo 2f076f3
- Added table of contents to README.md 9d2ac92
- changed date format in CHANGELOG.md 9ab0922

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.0.2...v3.1.0

## [v3.0.2] - 2019-12-09

- Updated demo and dist c144b03

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.0.1...v3.0.2

## [v3.0.1] - 2019-12-06

- Fixed a rule default value on add/change 349c06f

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v3.0.0...v3.0.1

## [v3.0.0] - 2019-11-29

## Breaking change

- Added ruleGroup-header div 9f1446c
  A `div` was added wrapping around the rule group header elements to assist with styling those elements as a group. This may affect some custom CSS rules that depend on the particular HTML arrangement in versions <3.0.0.

## Other commits

- Added operator to fieldSelector props 32c7f46
- Added links to subsections 963be7e
- Fixed link to demo source 3a85d85
- Updated README.md to mention query prop 16da8e1

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v2.5.1...v3.0.0

## [v2.5.1] - 2019-11-11

- Merge pull request #113 from romanlamsal/bugfix/NotProperty 87b5e94
- 'not' as optional in RuleGroup's type definition ffd1072
- bugfix: passing NOT property to ruleGroups below root 21ec672

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v2.5.0...v2.5.1

## [v2.5.0] - 2019-11-10

- Modifying operators labels in Readme file 2454440
- Merge pull request #111 from oumar-sh/formatQuery-handle-more-operators b2004a0
- Using lowercase for labels 134d206
- Processing values for the added operators 02501d9
- Adding operators in ReadMe file 818daa9
- Adding more operators for formatting query in sql 23bf05f

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v2.4.0...v2.5.0

## [v2.4.0] - 2019-09-23

- Add new fieldData prop for custom OperatorSelector and ValueEditor components 3c32e48

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v2.3.0...v2.4.0

## [v2.3.0] - 2019-09-16

- Add "not" toggle switch for rule groups bfb33a6
- Add level, rule id to dom elements ec829e8
- Replace uuid with nanoid 97981a1

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v2.2.1...v2.3.0

## [v2.2.1] - 2019-08-29

- Fixed TS definitions 2952fd2

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v2.2.0...v2.2.1

## [v2.2.0] - 2019-08-29

- Merge pull request #95 from sapientglobalmarkets/format-query 72f8a4c
- Merge pull request #96 from sapientglobalmarkets/show-combinators d2ebc77
- Added missing props to new ValueEditor types 95f9451
- Added title prop and completed ValueEditor props 0424827

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v2.1.0...v2.2.0

## v2.1.0 - 2019-08-27

- Enhanced default ValueEditor to handle multiple input types (#94) 09fa625

https://github.com/sapientglobalmarkets/react-querybuilder/compare/v2.0.1...v2.1.0

[unreleased]: https://github.com/react-querybuilder/react-querybuilder/compare/v5.0.0-alpha.0...HEAD
[v5.0.0-alpha.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v4.5.2...v5.0.0-alpha.0
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
