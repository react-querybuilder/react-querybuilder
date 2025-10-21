# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- [#957] New `hideDefaultDragPreview` prop for `QueryBuilderDnD` hides the browser's default drag preview, enabling custom drag layers and components.
- All pure `boolean` props are now assignable on `QueryBuilderContext`.

### Fixed

- [#954] Default styles now apply `{ cursor: not-allowed; opacity: 0.5; }` to drag handles of locked/disabled rules and groups, visually clarifying the inability to drag the elements.

## [v8.10.0] - 2025-10-09

### Added

- [#947] `showInputLabels` prop for `QueryBuilderMaterial` displays the `title` as a label above/within each input component rendered by `MaterialValueEditor` and `MaterialValueSelector`.
- [#950] `customExpressionHandler` option for `parseCEL`.
- [#950] `parseCEL` types, type guard functions, and other utilities are exported.
- [#948] Support for "muting" rules and groups. `showMuteButtons` prop will display a button with 🔊 or 🔇 depending on the boolean `muted` property of the rule/group. As with rules/groups deemed invalid, `formatQuery` will skip over rules/groups with `muted: true`.

### Fixed

- [#947] Default titles for field, operator, and combinator selectors are now singular ("Fields"→"Field", "Operators"→"Operator", "Combinators"→"Combinator").
- `useMergedContext` handles `matchMode` and `matchThreshold` translations.
- Default styles for `queryBuilder-justified` and `queryBuilder-branches` work properly for RTL languages (`dir="rtl"`).
- [#951] `formatQuery` properly handles invalid rules and groups in queries with independent combinators.

## [v8.9.2] - 2025-09-22

### Fixed

- Build configuration for core and main packages

## [v8.9.1] - 2025-09-20

### Fixed

- Publish configuration for core package

## [v8.9.0] - 2025-09-20

### Added

- [#942] Core features moved to new package `@react-querybuilder/core`. All exports are re-exported by `react-querybuilder`, so no breaking changes.
- [#935] New class `dndDropNotAllowed` added to elements that cannot accept a drop from the hovering element. Default style is `cursor: not-allowed`.

## [v8.8.4] - 2025-08-27

### Added

- [#932] New `useOptionListProp` hook to standardize option list prop normalization.

### Fixed

- [#937] The `match` property is now removed when a rule's `field` is updated to a field that does not support match modes.

## [v8.8.3] - 2025-08-13

### Fixed

- [#931] In multi-select mode, `FluentValueSelector` now displays a comma-separated list of option labels instead of values.

## [v8.8.2] - 2025-08-07

### Fixed

- [#926] The `ruleGroup` prop is now destructured and ignored on all `*ValueSelector` components, preventing it from being passed to DOM elements.
- Deprecated unnecessary interfaces `ActionWithRulesProps` and `ActionWithRulesAndAddersProps`.

## [v8.8.1] - 2025-07-09

### Fixed

- [#916] Corrected "sources" paths in CSS source maps.

## [v8.8.0] - 2025-07-09

### Added

- [#900] Support for matching elements of a nested array.
  - New optional `RuleType` property `match?: { mode: MatchMode, threshold?: number }`
    - `type MatchMode = 'all' | 'some' | 'none' | 'atLeast' | 'atMost' | 'exactly'`
    - In most contexts, a rule's `operator` will be ignored when `match` is present and valid.
  - New component `MatchModeEditor`, which renders when a field is determined to have one or more match modes. The mode selector is the configured `valueSelector` and&mdash;when a threshold is appropriate&mdash;the threshold editor is the configured `valueEditor` with `inputType: "number"`.
  - New props `getMatchModes` and `getSubQueryBuilderProps` to manage these configurations at the top level.
  - New `Field` properties `matchModes` and `subproperties` to manage these configurations at the field level.
  - `parseJsonLogic` support for "all", "none", and "some" operations.
  - `formatQuery` (partial) support for the `match` rule property.
    - Supported formats include "sql", "parameterized", "drizzle", "natural_language", "mongodb_query", "jsonlogic", "jsonata", "spel", and "cel".
    - To avoid invalid syntax, the SQL-based formats only work with `preset: "postgresql"`, and only with nested arrays of primitives like strings or numbers.
- [#903] New parser option `bigIntOnOverflow`. When true, a `bigint` will be generated for parsed tokens that represent valid integers outside the safe boundaries of the `number` type. (This currently only applies to `parseSQL`.)
- [#911] Support for `inputType: "bigint"` in all value editors, which will render an input with `type="text"` but will store the value as a `bigint` if a valid integer is entered.
- [#900] Extracted `fields` prop processing logic to new `useFields` hook.
- [#900] "Justified layout" styles from the demo (to push the "+ Rule", "+ Group", clone, lock, and remove buttons to the right edge) are now included in the default stylesheet. To apply the styles, add the `queryBuilder-justified` class to the query builder using the `controlClassnames` prop, or to any ancestor element.
- [#900] All components that render `<label>` elements now have `htmlFor` attributes linking their corresponding `<input>` elements using an `id` generated with `useId()`.
- [#900] The `getValueSources` prop and the `Field#valueSources` property can now evaluate to a full option list instead of a simple array of value source strings. This enables translations of the value sources through the `label` property.
- [#914] Option list props (including `fields`, `operators`, `combinators`, `getOperators`, and `getValues`) can now include strings in addition to&mdash;or instead of&mdash;`Option` objects (e.g. `["=", "between"]`). The string itself will be used as both the identifier and label, except in the case of operators and combinators where the default labels will be used if the string matches a value from the default set.

### Fixed

- [#903] `parseSQL` maintains precision for large integers by generating a `bigint` instead of a `number` when necessary.
- [#900] Preact compatibility improved by using `React.Fragment` explicitly instead of the shorthand `<>...</>`.
- [#900] If the `preset` option for `formatQuery` is one from `sqlDialectPresets`, it will only apply if the `format` is undefined or one of the SQL-based formats.

## [v8.7.1] - 2025-06-09

### Added

- CSS/SCSS variable `rqb-base-color`. `rqb-background-color` is `rqb-base-color` with 20% opacity (effectively the same color as before, just calculated differently).
- `maxLevels` prop to limit the addition of new rule groups beyond the specified nesting level. Default is `Infinity` (allows unlimited levels), and values other than 1 or greater will be ignored.

## [v8.7.0] - 2025-05-13

### Added

- [#891] Support for several ORM query formats:
  - New "prisma" format for [Prisma ORM](https://www.prisma.io/).
  - New "sequelize" format for [Sequelize](https://sequelize.org/).
  - New "drizzle" format for Drizzle [relational queries API](https://orm.drizzle.team/docs/rqb).
    - Can also be used for the Drizzle [query builder API](https://orm.drizzle.team/docs/select), which eliminates the need for the `@react-querybuilder/drizzle` package.

## [v8.6.2] - 2025-05-12

### Fixed

- [#893] ESM import errors with certain build tools when using `@react-querybuilder/material`.

## [v8.6.1] - 2025-05-06

### Fixed

- [#890] Escape forward slash in JSONata export format.
- [#890] Correct information in Drizzle package README.

## [v8.6.0] - 2025-05-05

### Added

- [#885] New package `@react-querybuilder/drizzle` for integration with the [Drizzle ORM](https://orm.drizzle.team/docs/select) query builder API.
- [#885] [LDAP](https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol) export format.
- [#885] New `formatQuery` option `ruleGroupProcessor` enabling development of custom output formats without completely reimplementing `formatQuery`.
  - The rule group processors for each of the existing formats have been extracted from `formatQuery` and can be used independently or as fallbacks from custom processors.
- [#883] Query tools `add`, `update`, `remove`, `move`, and `group` can now accept a `string` or `Path` where they previously accepted only `Path`-type arguments. A `string` would represent the `id` property of the subject rule/group, but otherwise the functionality of each tool is the same.
- [#883] New utility methods: `findID` returns the rule or group with the given `id` property within a query hierarchy (similar to `findPath`), and `getPathOfID` returns the `path` of the rule or group with the given `id`.
- [#885] Confirmed Mantine v8 support (no changes).

### Fixed

- [#885] `parseSQL` was translating `NOT LIKE '[...]'` (no leading or trailing wildcards) to `operator: "="` instead of `operator: "!="`.
- [#885] Importing from `react-querybuilder/formatQuery` no longer has a dependency on `react`.

## [v8.5.0] - 2025-04-07

### Added

- [#873] New prop `autoSelectValue` ([documentation](https://react-querybuilder.js.org/docs/api/querybuilder#autoselectvalue)) behaves like [`autoSelectField`](https://react-querybuilder.js.org/docs/api/querybuilder#autoselectfield)/[`autoSelectOperator`](https://react-querybuilder.js.org/docs/api/querybuilder#autoselectoperator) but for the value editor when it renders a select list.
  - The `translations` prop object has a new property `values` that accepts `placeholderName`, `placeholderLabel`, and `placeholderGroupLabel` properties ([documentation](https://react-querybuilder.js.org/docs/api/querybuilder#translations)). These translatable strings set the default values and labels when `autoSelectValue` is set to `false`.
  - A corresponding `placeholderValueName` option was added to [`formatQuery`](https://react-querybuilder.js.org/docs/utils/export#placeholder-values), which will now ignore rules where the `value` matches the placeholder value as long as `placeholderValueName` is defined (this behavior differs from `placeholderFieldName` and `placeholderOperatorName`, which do not need to be defined).
- [#876] Miscellaneous i18n enhancements for the "natural_language" export format:
  - `translations` option: Map of the words "and", "or", "true", and "false" to their translated equivalents. Also covers prefix and suffix options for rule groups.
  - `wordOrder` option: Based on the linguistic concept of [constituent word order](https://en.wikipedia.org/wiki/Word_order#Constituent_word_orders), this option accepts all permutations of "SVO" ("SOV", "VSO", etc.) and outputs the field, operator, and value in the corresponding order (S = field, V = operator, O = value).
  - `operatorMap` option: Map of operators to their natural language equivalents. If the result can differ based on the `valueSource`, the key should map to an array where the second element represents the string to be used when `valueSource` is "field". The first element will be used in all other cases.
  - Date/time formatting support: The `@react-querybuilder/datetime` package now supports the "natural_language" format for date-type rules. Formatting can be customized by passing `locales`, `dateFormat`, or `dateTimeFormat` as properties of the `context` parameter. These options are passed to a `Intl.DateTimeFormat` constructor.

### Fixed

- [#877] Dynamic imports of `react-dnd` and related packages are now obfuscated to discourage bundlers like webpack from pre-processing those imports.

## [v8.4.1] - 2025-03-24

### Fixed

- [#868] Using `QueryBuilderDndWithoutProvider` on its own now correctly implies `enableDragAndDrop={true}` for each descendant `QueryBuilder`.

## [v8.4.0] - 2025-03-18

### Fixed

- [#860] The `idGenerator` prop is respected for all operations that create new rules or groups.

### Added

- [#860] `@react-querybuilder/dnd` now supports `react-dnd-touch-backend` as a drop-in replacement for `react-dnd-html5-backend`. If both are provided, the touch backend will be preferred when a touch device is detected.
- [#860] "Group" feature of `@react-querybuilder/dnd`. Pressing the <kbd>Ctrl</kbd> key while dragging a rule/group will form a new group at the target path with the target rule/group and the dragged rule/group in its `rules` array. Pressing the <kbd>Alt</kbd>/<kbd>⌥ Option</kbd> key at the same time will leave the rule/group in its original location and clone it for the new group.
- [#860] Modifier keys used during drag-and-drop to indicate cloning and grouping (by default <kbd>Alt</kbd>/<kbd>⌥ Option</kbd> and <kbd>Ctrl</kbd>, respectively) are now configurable on the `QueryBuilderDnD` component with the `copyModeModifierKey` and `groupModeModifierKey` props.
- [#860] New `group` query tool which creates a new group at a target path with its `rules` array containing the objects from a source path and the target path.

## [v8.3.1] - 2025-02-27

### Fixed

- [#858] The `type-fest` library has been (partially) vendored into `react-querybuilder` to avoid requiring it as a dependency.
- [#858] `UseMergedContextProps` renamed to `UseMergedContextParams` (_technically_ a breaking change, but probably won't affect anyone).
- [#858] All `Parse*Options` types have been removed from the main export. They are now only available on their respective `react-querybuilder/parse*` exports (another _technically_ breaking change that probably won't affect anyone).

## [v8.3.0] - 2025-02-21

### Added

- [#855] CSS variables, enabling customization of the default stylesheet without using SCSS.
- [#855] New option `generateIDs` for all `parse*` methods. When true, the output query object will be processed through `prepareRuleGroup` to add `id`s.

## [v8.2.0] - 2025-01-28

### Added

- [#845] New `formatQuery` option `operatorProcessor`. Currently only applies to "sql", "parameterized", "parameterized_named", and "natural_language" formats.
- [#846] New `formatQuery` option `preserveValueOrder`. Preserves the order of values when exporting rules with "between"/"notBetween" operators, even if the larger value comes first.

### Fixed

- [#844] The `formatQuery` "elasticsearch" export format now includes the `.value` property when outputting Painless scripts.
- [#845] `formatQuery` handles `combinator` and `operator` values case-insensitively.
- [#846] `convertQuery`, `convertToIC`, and `convertFromIC` now support the "xor" combinator, as does the "natural_language" export format.

## [v8.1.1] - 2025-01-20

### Fixed

- [#840] The behavior and list of valid values for the `formatQuery` option `parseNumbers` now aligns with the corresponding `QueryBuilder` prop, as long as a `fields` array is also provided.
- [#836] `AntDValueSelector` now filters on the `label` property and defines options with the `options` prop instead of a `children` array of `<Select.OptGroup>`/`<Select.Option>`.
- [#836] Utilities that determine whether arrays are valid option lists (`isFullOptionArray`, `isFlexibleOptionArray`, `isFullOptionGroupArray`, `isFlexibleOptionGroupArray`) are now more strict: All leaf elements must conform to the operative type, not just the first element.
- The "mssql" `formatQuery` preset now sets `paramPrefix: '@'`.

## [v8.1.0] - 2025-01-09

### Added

- [#820] New `@react-querybuilder/datetime` package with enhanced functionality for managing date/time data. Includes rule/value processors for `formatQuery` tailored to different database platforms and date/time libraries.
- [#820] `formatQuery` will assume a format of "sql" if no format is provided as long as `preset` matches one of the supported values.
- [#820] New `formatQuery` option `wrapValueWith`, an array of two strings to act as a prefix and suffix for values (outside of any quotes).
- [#820] `formatQuery` value processors now accept an optional `context` parameter, which can be used to pass additional information to the processor.
- [#820] New "mongodb_query" export format. This format is exactly the same as "mongodb" except it returns an actual JSON object instead of a `JSON.stringify`d version. The "mongodb" format is deprecated, but will not be removed.
- [#820] Default SCSS stylesheet `query-builder.scss` now uses `@use` instead of the deprecated `@import`.
- [#834] React 19 support (verification only, no meaningful code changes were necessary).

## [v8.0.0] - 2024-11-08

### Changed

- [#805] `@react-querybuilder/chakra` now supports Chakra UI version 3 and no longer supports version 2. For Chakra UI version 2 support, use `@react-querybuilder/chakra2`.
- [#805] `ChakraDragHandle` has been removed. In Chakra UI version 3 environments, the default `DragHandle` component works without augmentation.

### Added

- [#814] Debug build which registers the internal Redux store with Redux DevTools (more "debug" functionality may be added in the future). To use the debug build, update all `"react-querybuilder"` imports to `"react-querybuilder/debug"`.

### Fixed

- [#814] The internal Redux store is no longer registered with Redux DevTools by default.
- `bootstrapClassnames` no longer includes `value: "form-control form-control-sm"`. The classes are added by `BootstrapValueEditor` only when necessary.
- [#812] `@react-querybuilder/bulma` properly indicates compatibility with Bulma v1 in its `peerDependencies`, and the website demo now uses Bulma v1.

## [v7.7.1] - 2024-10-21

### Changed

- [#791] The `@react-querybuilder/material` package uses the `TextField` component from `@mui/material` (previous versions used `Input`). Implementations that preload MUI components may need to be updated.

### Fixed

- [#791] The `extraProps` prop of `MaterialValueEditor` works properly.
- [#796] `FluentShiftActions` and `TremorShiftActions` are now applied by default in their respective compatibility packages.

## [v7.7.0] - 2024-10-08

### Changed

- The `useValueEditor` hook now requires the entire `ValueEditorProps` object instead of only requiring a subset of the props.

### Added

- [#755] New `controlElements` properties `ruleGroupHeaderElements` and `ruleGroupBodyElements`, enabling customization/replacement/augmentation of the subcomponents within the rule group header and body wrappers without needing to reimplement the entire `RuleGroup` component.
- [#785] New prop `suppressStandardClassnames`. When `true`, no classes will be added automatically to any elements (custom classes defined in `controlClassnames` will still be applied). This includes conditional and event-based classes for validation, drag-and-drop, etc.
- [#785] A "dndCopy" class will be added when drag-and-drop is enabled and the modifier key (<kbd>Alt</kbd>/<kbd>⌥ Option</kbd>) is pressed while the drag phase begins. When using the default styles, the drag-and-drop indicator line will be green (`#669933`) instead of `rebeccapurple` (`#663399`).
- [#755] New `useQueryBuilderNative` hook. Works the same as `useQueryBuilder`, but tailored for React Native implementations.
- [#769] The `parseNumbers` prop now accepts an optional "-limited" suffix on existing `string` config values "enhanced", "strict", and "native". When the "-limited" suffix is used (e.g., `parseNumbers="strict-limited"`), values will only be parsed for numericity when the `inputType` is `"number"`.
- [#769] `formatQuery` now accepts an optional `concatOperator` parameter to support non-standard concatenation methods in the various SQL dialects. The default is the ANSI standard `"||"`, which is supported by PostgreSQL, Oracle, SQLite, and various others, while SQL Server uses `"+"`. A value of `"CONCAT"` will enable MySQL compatibility by using the `CONCAT` function (do not use this for Oracle as its `CONCAT` function is limited).
- [#769] The `toArray` method now accepts an optional configuration parameter. If the `retainEmptyStrings` property of that object is `true`, the function will not filter out string elements that are empty or purely whitespace.
- [#769] The object returned from `useValueEditor` now includes a `parseNumberMethod` property, which is a processed version of the `parseNumbers` prop.
- [#769] `formatQuery` now accepts an optional `preset` option as a shortcut to configure the output for improved compatibility with different query language dialects. Options include "ansi", "mssql", "mysql", "oracle", "postgres", and "sqlite".
- [#769] `formatQuery` now accepts an optional `fieldIdentifierSeparator` string. When used in conjunction with the `quoteFieldNamesWith` option, field names will be separated by this string and bracketed individually per the `quoteFieldNamesWith` configuration (e.g., `[table name].[field name] = 'value'` instead of `[table name.field name] = 'value'`).
- [#786] New `formatQuery` export format "natural_language", similar to the "sql" or "cel" formats but with English-language operators.

### Fixed

- [#769] On rules using a "between"/"notBetween" operator, the second value no longer shifts into the first input when the first value is removed.
- [#769] Type `ParseNumbersMethod` renamed to `ParseNumberMethod` (singular) to better reflect its assocation with the `parseNumber` method as opposed to the `parseNumbers` prop.
- [#769] Internally, the default MongoDB rule processor for `formatQuery` uses actual JSON objects instead of manually constructing `JSON.parse`-able strings. This should lead to more reliably valid results.
- [#769] When generating SQL for a rule where (1) the `operator` is "between" or "notBetween", (2) the values are numeric, and (3) `parseNumbers` is `true`, `formatQuery` will place the smaller value first and the larger value second, regardless of their order in the rule's `value` property.
- [#779] When `parseJSONata` encounters an expression group where only two conditions exist for the same field, one greater-than and one less-than, a single "between"/"notBetween" rule will be generated. Previously a rule group with two separate rules would be generated.
- [#783] `MantineValueSelector` no longer sets the value to `""` when clicking the selected option again.

## [v7.6.1] - 2024-08-02

### Fixed

- Drag-and-drop hooks (`useReactDnD`, `useRuleDnD`, `useRuleGroupDnD`, and `useInlineCombinatorDnD`) are now exported from `@react-querybuilder/dnd`.
- [#748] `formatQuery` correctly handles values that are lists of numbers when `parseNumbers` is `true`.

## [v7.6.0] - 2024-07-11

### Added

- [#734] New callback props `onMoveRule` and `onMoveGroup`, called before a rule or group is moved (via drag-and-drop) or shifted. If the result of the callback is `false`, the move will be cancelled. If `true`, the move will proceed as normal. Alternatively, a full query object can be returned representing the new state if some other modifications were necessary.
- [#734] `onAddRule` and `onAddGroup` callbacks can now return `true` instead of the entire rule/group to allow the addition to proceed as normal.

### Fixed

- [#733] `parseSpEL` was not handling the `matches` operator correctly when its value was a single character.
- [#733] Improved `formatQuery` "elasticsearch" output for "contains" and "doesNotContain" operators.

## [v7.5.2] - 2024-06-27

### Fixed

- [#730] `parseMongoDB` was not handling the `$regex` operator correctly when its value was a single character.

## [v7.5.1] - 2024-06-25

### Changed

- [#727] `useMergedContext` no longer returns values that are not explicitly typed in `UseMergedContextProps`.
- [#727] `key` is no longer required in the parameter passed to `getCompatContextProvider`.

### Fixed

- [#727] Overall memoization strategy and implementation is improved.
- [#727] Option group utility functions are better at identifying what is and isn't an option group list.
- [#727] The `dragging` property of the object passed to `canDrop` is no longer a stale reference to the rule/group being dragged.

## [v7.5.0] - 2024-06-15

### Changed

- [#716] The React Native compatibility package uses `gap` for layout spacing, which means the minimum `react-native` version is now `0.71.0`.

### Added

- [#723] The `useQueryBuilder` hook has been reinstated. It does nothing more than call `useQueryBuilderSetup` and `useQueryBuilderSchema`, which no longer need to be called from separate components.
- [#723] `useQueryBuilderQuery` hook to retrieve the full, current query object during the render pass of a custom component. It requires no parameters and should be used in place of the previously recommended hook `useQueryBuilderSelector`, which requires a selector function generated with `getQuerySelectorById(props.schema.qbId)`. While `useQueryBuilderSelector` is not deprecated, it is no longer recommended except in very special circumstances.

### Fixed

- [#723] `useQueryBuilderSelector` no longer returns `undefined` during the first render pass (and neither does the new hook `useQueryBuilderQuery`).
- [#716] `parse*` methods properly escape commas in string values for "between" and "in" operators.

## [v7.4.4] - 2024-06-10

### Fixed

- [#719] The "mongodb" export format stringifies values using `JSON.stringify`.

## [v7.4.3] - 2024-06-06

### Fixed

- Compatibility packages now specify the correct `react-querybuilder` dependency version.

## [v7.4.2] - 2024-06-06

### Added

- [#713] `insert` utility method to insert a new rule or group anywhere in the query hierarchy. `insert` is similar to `add` except that the new rule or group can be inserted at any path (`add` can only append a rule or group to the end of a group's `rules` array). The option `replace: true` will replace the rule or group at the specified path.

### Fixed

- [#713] `@react-querybuilder/dnd` now supports dragging and dropping rules and groups across separate query builders. As with drag-and-drop within a single query builder, holding the modifier key (<kbd>Alt</kbd> on Windows/Linux, <kbd>⌥ Option</kbd> on Mac) when dropping the rule/group will copy it instead of move it.
- [#713] `debugMode` now logs the query builder's `qbId`.
- [#714] `parseJsonLogic` can now override group operations ("and", "or", "!", and "!!") with the `jsonLogicOperations` option.

## [v7.4.1] - 2024-06-04

### Fixed

- [#706] `parseJsonLogic` no longer nests negated groups unnecessarily.

## [v7.4.0] - 2024-05-27

### Changed

- [#703] The `independentCombinators` property has been removed from the `InlineCombinatorProps` interface. The value can be still be retrieved from the `schema` prop.
- [#703] Distributed CSS files are compressed (comments and unnecessary whitespace removed).

### Added

- [#699] Most properties of the `controlElements` prop can be set to `null`. Properties set to `null` will be rendered as `() => null`.

### Fixed

- [#700] `parseCEL` no longer creates a rule group with `not: true` when parsing a single rule in a negated parenthetical group. Instead, the rule operator is inverted.
- [#703] When `enableDragAndDrop` is `true` and a rule or group is dragged over an inline combinator (such as generated when `showCombinatorsBetweenRules` is enabled or the query uses independent combinators), the "drop location" indicator (a dashed, purple line by default) will appear _above_ the inline combinator. Previously the styles placed the indicator line _below_ the inline combinator, which could be misleading, particularly for independent combinators.

## [v7.3.0] - 2024-05-13

### Changed

- `displayName` is no longer explicitly declared for any components.

### Added

- [#696] `baseField`, `baseOperator`, `baseCombinator` props. Properties defined in these props will be applied to each option in the `fields`, `operators`, and `combinators` lists, respectively. Corresponding properties defined for individual options will override the "base" properties.
- [#688] `parseJSONata`, an experimental [JSONata](https://jsonata.org/) parser.
- [#697] `quoteValuesWith` option for `formatQuery` (applicable to "sql" format only). Values will be bracketed by the provided string, e.g. double quotes (`'"'`), instead of the default single quotes.

## [v7.2.1] - 2024-05-06

### Fixed

- [#682] `parseCEL` processes "like" operators ("contains"/"startsWith"/"endsWith") that are negated without parentheses, like `!f1.contains(f2)`.
- [#692] `formatQuery` updates (these are probably _technically_ breaking changes, but the logic itself is equivalent to the previous version so we're considering them bug fixes):
  - For the "jsonlogic" export format, the entire group structure is retained even if only one top-level child object exists.
  - For the "jsonlogic", "mongodb", and "cel" formats, rules where the operator is "in" or "notIn" and the value evaluates to an empty array are retained.
  - The "jsonata" format now respects the `quoteFieldNamesWith` option.
- [#692] Custom field selectors can set their rule's `field` property to an arbitrary value without throwing an error, even if the value is not included in the `fields` prop list.

## [v7.2.0] - 2024-04-15

### Added

- [#677] [JSONata](https://jsonata.org/) export format.

### Fixed

- [#677] A bug in the default SpEL and CEL rule processors for `formatQuery` caused rules to be ignored when the operator was "between" or "notBetween" and one of the values was falsey without being `null` or `undefined` (e.g, `0` or `""`).

## [v7.1.0] - 2024-04-01

### Changed

- To avoid confusion with the recommended query selector and update methods (`useQueryBuilderSelector`, `props.schema.getQuery()`, and `props.schema.dispatchQuery()`), the hooks `useQueryBuilderDispatch` and `useQueryBuilderStore` are no longer exported.

### Added

- New "bulk add" `controlClassnames` properties. These classnames augment&mdash;rather than replace&mdash;the classnames defined for specific controls.
  - `actionElement`: Applied to all action elements like `addRuleAction`, `addGroupAction`, etc.
  - `valueSelector`: Applied to all selection elements like `combinatorSelector`, `fieldSelector`, etc.
- New `numberedParams` option for `formatQuery`. When the format is `"parameterized"`, parameter placeholders within the generated SQL string will begin with the configured `paramPrefix` (default ":") followed by a numbered index beginning with `1` instead of using "?" as the placeholder for all parameters. This option was added primarily to reduce the code necessary for generating [PostgreSQL](https://www.postgresql.org/)-compatible SQL.
  - `formatQuery` now passes a third parameter to custom `ruleProcessor` functions when the format is "parameterized" or "parameterized_named". Currently the parameter is an object with a single property, `processedParams`, which represents the current state of the `params` array (for the "parameterized" format) or object (for the "parameterized_named" format) at the point the rule processor is invoked during query processing. The default `ruleProcessor` for the parameterized formats uses this parameter when the `numberedParams` option is `true`.

### Fixed

- Improved performance of `generateID` when `crypto.randomUUID` is not available. This led to performance improvements in initial `<QueryBuilder />` rendering and query update functions.

## [v7.0.2] - 2024-03-12

### Changed

- `@react-querybuilder/antd` uses AntD's `InputNumber` in `AntDValueEditor` when `valueEditorType === "number"`.

### Added

- [#671] `formatQuery` now respects the `ruleProcessor` option for "parameterized" and "parameterized_named" export formats.

### Fixed

- Mantine and Tremor versions are no longer pinned to a specific patch version.
- `start:*` scripts for compatibility packages now correctly load their particular dependencies (does not affect execution).

## [v7.0.1] - 2024-03-07

### Fixed

- Corrected node10/node16 module resolution for `react-querybuilder/parseSpEL`.

## [v7.0.0] - 2024-03-06

### Changed

- The minimum React version is now 18, due to the new `react-redux` v9 dependency.
- [#654] The minimum TypeScript version is now 5.1.
- [#595] The parser functions have been removed from the main export, and are _only_ available as separate exports. This change reduces the main bundle size by roughly 50%.
  <!-- prettier-ignore -->
  | Function         | New `import` requirement                                             |
  | ---------------- | -------------------------------------------------------------------- |
  | `parseCEL`       | `import { parseCEL } from "react-querybuilder/parseCEL"`             |
  | `parseJsonLogic` | `import { parseJsonLogic } from "react-querybuilder/parseJsonLogic"` |
  | `parseMongoDB`   | `import { parseMongoDB } from "react-querybuilder/parseMongoDB"`     |
  | `parseSQL`       | `import { parseSQL } from "react-querybuilder/parseSQL"`             |
- [#537] Some of the default labels have been updated per the table below.
  <!-- prettier-ignore -->
  | Key                              | Old        | New         | Notes                               |
  | -------------------------------- | ---------- | ----------- | ----------------------------------- |
  | `translations.addRule.label`     | `"+Rule"`  | `"+ Rule"`  | Space added between "+" and "Rule"  |
  | `translations.addGroup.label`    | `"+Group"` | `"+ Group"` | Space added between "+" and "Group" |
  | `translations.removeRule.label`  | `"x"`      | `"⨯"`       | HTML entity `&cross;` / `&#x2A2F;`  |
  | `translations.removeGroup.label` | `"x"`      | `"⨯"`       | HTML entity `&cross;` / `&#x2A2F;`  |
- [#589] The `independentCombinators` prop has been deprecated and will be ignored if used. To enable the independent combinators functionality, use `RuleGroupTypeIC` for the `query` or `defaultQuery` prop. The query builder will detect the query type and behave accordingly. If the `independentCombinators` prop is present, a warning will be logged to the console (in "development" mode only).
- [#523] `parseMongoDB` now generates more concise queries when it encounters `$not` operators that specify a single, boolean condition. Whereas previously that would yield a group with `not: true`, it will now generate a rule with a inverted/negated operator (`"="` inverted is `"!="`, `"contains"` inverted is `"doesNotContain"`, etc.). To prevent this behavior, set the `preventOperatorNegation` option to `true` ([#653]).
- [#589] The `disabled` prop has been un-deprecated. Disabling the entire query with the prop and setting `disabled: true` as a property of the root group now produce different behaviors. Specifically, the root group's lock/unlock button will always be enabled if the `disabled` prop is not `true`.
- [#555] Value editors for compatibility packages that render components specific to their respective library now accept an `extraProps` prop that will be passed directly to the library component, spread like `{...extraProps}`. The type of `extraProps` is `any` because each value editor can render one of several library components that accept different props.
- [#637] The `"json_without_ids"` export format now explicitly removes the `id` and `path` properties from the output, leaving all other properties unchanged. Previously this format would only include specific properties which had the effect of removing any non-standard properties.
- The first generic argument of `ValueEditorProps`, `ValueSelectorProps`, and `FieldSelectorProps` must extend the new `FullOption` interface instead of `Option`.

<details>

<summary>Compatibility packages</summary>

- [#537] Several compatibility packages now override the default labels for non-text components (`lock*`, `clone*`, `remove*`, and `dragHandle`) with SVGs from official icon packages. This brings them more in line with their respective design systems by default.
  - `@react-querybuilder/antd`: `@ant-design/icons`
  - `@react-querybuilder/bootstrap`: `bootstrap-icons`
  - `@react-querybuilder/chakra`: `@chakra-ui/icons`
  - `@react-querybuilder/fluent`: `@fluentui/react-icons-mdl2`
  - `@react-querybuilder/material`: `@mui/icons-material`
- [#537] `@react-querybuilder/mantine` now requires Mantine v7.
- [#537] `@react-querybuilder/bootstrap` component `BootstrapDragHandle` has been removed. It is redundant since `dragHandle.label` can now be a `ReactNode`.

</details>

<details>

<summary>Low-impact changes</summary>

- [#537] The `useQueryBuilder` hook has been split into `useQueryBuilderSetup` and `useQueryBuilderSchema`. Each hook takes the full `QueryBuilder` props object as its first parameter (as `useQueryBuilder` did), and `useQueryBuilderSchema` accepts the return value of `useQueryBuilderSetup` as its second parameter.
- [#537] The `useStopEventPropagation` hook now takes a single function as its parameter instead of an object map of functions, so it must be run for each wrapped function individually.
- [#537] Paths are now declared with a new type alias `Path` instead of `number[]`. The actual type is the same: `type Path = number[]`.
- [#537] The `RuleGroupTypeIC` type now includes `combinator?: undefined` to ensure that query objects intended for use in query builders where `independentCombinators` is enabled do not contain `combinator` properties.
- [#663] Whereever the native `parseFloat` was used internally, `parseNumber` is now used. `parseNumber` now delegates parsing to the more versatile `numeric-quantity` package. The default behavior has not changed, but a new "enhanced" option will ignore trailing invalid characters (e.g., "abc" in "123abc") just like the native `parseFloat` method, with the only difference being it won't return `NaN` when parsing fails. Additionally, the `numericRegex` export is now adapted from (but largely identical to) the export of the same name from `numeric-quantity`.
- The logic to prefer a field's `valueEditorType` over the `getValueEditorType` prop has moved from the `useRule` hook to the `useQueryBuilderSetup` hook.

</details>

### Added

- Default structural styles (flex direction, alignment, spacing, etc.) are now available in a standalone stylesheet `query-builder-layout.css`/`query-builder-layout.scss`. The default stylesheet, `query-builder.css`/`query-builder.scss`, still contains structural styles but also includes more decorative styles like colors and border styles. The effective styles of the default stylesheet have not changed from version 6.
- [#586] Options in list-type props can now use `value` as the identifier property in lieu of `name`. Additionally, all `Option`s within `OptionList`s passed down to subcomponents (`fields`, `fieldData`, `combinators`, `operators`, `values`, etc.) are guaranteed to have both `name` and `value`. This makes it easier to use libraries like `react-select` that expect a list of type `{ value: string; label: string; }[]` and not `{ name: string; label: string; }[]`.
  - [#654] Relatedly, field identifier types (`name`/`value` properties) will now be inferred from the `fields` prop if they have been narrowed from `string`. These narrowed types will be applied to subcomponents and other props that take fields or field identifiers as arguments/props.
  - [#663] The `Field`, `Operator`, and `Combinator` interfaces each have corresponding `Full*` and `*ByValue` counterparts. Both `name` and `value` are required in the `Full*` interfaces; only `value` is required in the `*ByValue` interfaces.
- [#595] Two "bulk override" properties have been added to the `controlElements` prop: `actionElement` and `valueSelector`. When `actionElement` is defined, it will be used for each component that defaults to `ActionElement` (as long as that component is not explicitly overridden in the `controlElements` prop). Same for `valueSelector` and components that default to `ValueSelector` (including `ValueEditor` in cases where it renders a value selector). This makes it possible to define replacement components for all buttons and selectors at once instead of one-by-one.
  <!-- prettier-ignore -->
  | `controlElements` property | Sets default for                                                                                                                                       |
  | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `valueSelector`            | `combinatorSelector`, `fieldSelector`, `operatorSelector`, `valueSourceSelector`, `valueEditor` (when rendering a value selector)                      |
  | `actionElement`            | `addGroupAction`, `addRuleAction`, `cloneGroupAction`, `cloneRuleAction`, `lockGroupAction`, `lockRuleAction`, `removeGroupAction`, `removeRuleAction` |
- [#577] A new `showShiftActions` prop provides first-class support for rearranging rules within a query without enabling drag-and-drop. When `showShiftActions` is `true`, two buttons will appear at the front of each rule and group (except the root group), stacked vertically by default. The first/upper button will shift the rule or group one spot higher, while the second/lower button will shift it one spot lower. Pressing the modifier key (<kbd>Alt</kbd> on Windows/Linux, <kbd>⌥ Option</kbd> on Mac) while clicking a shift action will clone the rule or group instead of just moving it. A `ShiftActions` component has been added, along with a corresponding component for each compatibility package. New `translations` properties `shiftActionUp` and `shiftActionDown` allow configuration of the label and title of each button within the new component.
- [#512] Accessibility is improved with the addition of a `title` attribute to the outermost `<div>` of each rule group. The text of this attribute can be customized with the `accessibleDescriptionGenerator` function prop.
- [#537]/[#589] Three new methods make it easier to manage arbitrary query updates from custom components. (Previously we recommended including the query object as a property of the `context` prop, but that workaround is no longer necessary.) The first two methods are available from the `schema` prop passed to every component, and should only be used in event handlers. The third is a React Hook and should follow the appropriate rules.
  - `getQuery()`: returns the current root query object.
  - `dispatchQuery(query)`: updates the internal query state and then calls the `onQueryChange` callback.
  - `useQueryBuilderSelector(selector)`: returns the current root query object using the provided selector function, which can be generated with `getQuerySelectorById(props.schema.qbId)`.
- Most of the `get*` callback props now receive an additional "meta" parameter with a `fieldData` property (more properties may be added to the "meta" object in the future). `fieldData` is the full `Field` object from the `fields` array for the given `field` name, including any custom properties (a common one is `datatype`). This eliminates the need to find the field object based solely on the field's `name` within the `get*` functions themselves. The following callback props provide the new "meta" parameter: `getDefaultOperator`, `getDefaultValue`, `getInputType`, `getOperators`, `getRuleClassname`, `getValueEditorSeparator`, `getValueEditorType`, `getValues`, and `getValueSources`.
- [#537] `<QueryBuilderDnD />` and `<QueryBuilderDndWithoutProvider />` from `@react-querybuilder/dnd` now accept a `canDrop` callback prop. If provided, the function will be called when dragging a rule or group. The only parameter will be an object containing `dragging` and `hovering` properties, representing the rule/group being dragged and the rule/group over which it is hovered, respectively. The objects will also contain the `path` of each item. If `canDrop` returns `false`, dropping the item at its current position will have no effect on the query. Otherwise the normal drag-and-drop rules will apply.
- [#537] All `label` props and `translations.*.label` properties now accept `ReactNode`. This includes all action elements (buttons), "not" toggles, and drag handles. Previously `label` was limited to `string`. This enables, for example, the assignment of SVG elements as labels.
- [#537] The `translations` prop can now be passed down through the compatibility context providers like `<QueryBuilderBootstrap />` and `<QueryBuilderMaterial />`. The object will be merged with the `translations` prop of descendant `QueryBuilder` components.
- [#589] Custom rule processors for `formatQuery` now receive the full `Field` object in the options parameter, as long as the `fields` array is provided alongside `ruleProcessor`. In TypeScript, the member type of the `fields` array now requires a `label: string` property. Previously, only `name` was required.
- [#595] `parseMongoDB` now supports custom operators through the `additionalOperators` option.
- [#589] New utility function `uniqByIdentifier` replaces `uniqByName`, which has been deprecated. `uniqByIdentifier` will remove duplicates based on the `value` property, or `name` if `value` is undefined (see [#586]).
- [#526] Experimental support for ElasticSearch export format in `formatQuery`.
- [#606] New compatibility package for [Tremor](https://www.tremor.so/), `@react-querybuilder/tremor`.
- [#537] New API documentation, generated directly from the source code, at https://react-querybuilder.js.org/api. In support of this, many types and functions now have better JSDoc comments which should provide a better developer experience in modern IDEs.
- [#638] Value selectors now respect the `disabled` property of individual options in option lists.
- [#663] The `format` option set during a call to `formatQuery` will be passed to custom rule processors as a property of the options object in the second parameter.
- [#663] `parseSpEL` method for importing [SpEL](https://docs.spring.io/spring-framework/docs/3.0.x/reference/expressions.html) expressions.

### Fixed

- [#537] Performance is improved (especially for large queries), as long as each prop except for `query` has a stable reference. The most common violation of that rule is probably inline arrow function declarations in the `onQueryChange` prop, a problem which can usually be addressed with `useCallback`.
- [#589] Fixed issue where locking the root group would prevent unlocking the query.
- [#595] `MantineValueSelector` now correctly renders option group headers.
- [#619] The package.json#types location has been corrected for all packages. This (probably) only affected legacy build systems that don't support/respect package.json#exports.
- [#623] Fixed an issue where Next triggered the "uncontrolled to controlled" warning unnecessarily. Removed a `useEffect` call from `usePrevious` and a ref that tracked "first render" from `useQueryBuilderSchema`.
- [#625] A default value will not be selected unnecessarily when `valueEditorType` evaluates to `"multiselect"`.
- Refactored custom hooks to avoid unnecessary `useEffect` calls.
- [#663] `formatQuery` for "jsonlogic" will no longer collapse subgroups that only contain one rule into a single JsonLogic rule. Full query objects that contain only one rule will still be collapsed.
- [#663] When a `values` list is defined for a field, and the value is reset due to `resetOnFieldChange` or `resetOnOperatorChange` being `true`, the rule `value` will no longer be set to the first value in the list unless the `valueEditorType` evaluates to "select" or "radio".
- [#663] `formatQuery` now renders the fallback expression for subgroups where all rules are invalid. Previously this could result in `"()"`, which is invalid SQL.

## [v6.5.5] - 2024-01-15

### Fixed

- [#632] The `useValueEditor` hook no longer updates values that are arrays to `value[0]` when `valueEditorType === "multiselect"`.

## [v6.5.4] - 2023-11-04

### Fixed

- [#585] Avoid React warning about unique `key` props.
- [#585] Fixed invalid reference to `generatePicker` in `@react-querybuilder/antd`.

## [v6.5.3] - 2023-10-20

### Added

- [#574] `transformQuery` enhancements:
  - `rules` properties are no longer retained unconditionally. The `rules` property can be copied or renamed like any other property using the `propertyMap` option.
  - `propertyMap` keys can now have `false` values. Properties matching a `propertyMap` key with a value of `false` will be removed without further processing (including the `rules` property, which would avoid recursion through the hierarchy altogether).
  - New boolean option `omitPath`. When `true`, a `path` property will _not_ be added to each rule and group in the query hierarchy.

### Fixed

- `paramsKeepPrefix` was not applying to bind variables generated from rules with an `operator` of "between", "notBetween", "in", or "notIn".

## [v6.5.2] - 2023-10-19

### Changed

- The `useValueEditor` hook will now update all values that are arrays (`Array.isArray(value)`) to the first element of the array (`value[0]`) when `operator` is anything except "between", "notBetween", "in", or "notIn". Previously this logic only applied when `inputType` was "number". (To bypass this logic, pass `{ skipHook: true }`.)

### Added

- New `paramsKeepPrefix` option for `formatQuery`, which enables compatibility with [SQLite](https://sqlite.org/). When used in conjunction with the `"parameterized_named"` export format, the `params` object keys will maintain the `paramPrefix` string as it appears in the `sql` string (e.g. `{ '$param_1': 'val' }` instead of `{ param_1: 'val' }`).

### Fixed

- [#523] `parseMongoDB` now properly handles objects in the form of `{ fieldName: { $not: { /* ...rule */ } } }`. This problem was particularly evident for `$regex` operators that should have generated rules with `"doesNot[Contain/BeginWith/EndWith]"` operators, since `formatQuery(query, 'mongodb')` produces this structure and `parseMongoDB` was not handling the inverse operation.
- `isRuleGroup` will not error when the argument is `null`.
- [#572] `parseSQL` now recognizes signed numeric values like `-12` or `+14`.

## [v6.5.1] - 2023-06-26

### Fixed

- `AntDValueEditor` calls `generatePicker` from the correct import.
- Packages no longer ["masquerade as CJS"](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseCJS.md) when imported from ESM under `"node16"` module resolution.

## [v6.5.0] - 2023-06-13

### Changed

- [#529] [Drag handle components](https://react-querybuilder.js.org/docs/components/draghandle) will no longer be rendered unless [drag-and-drop is enabled](https://react-querybuilder.js.org/docs/components/querybuilder#enabledraganddrop). Previously, drag handle components were rendered unconditionally. Accordingly, the default stylesheet no longer applies `display: none` to the `queryBuilder-dragHandle` class when drag-and-drop is disabled since the components will not be rendered anyway.

### Added

- [#529] New props for several sub-components:
  - The parent `rule` object will now be provided to `fieldSelector`, `operatorSelector`, `valueSourceSelector`, and `valueEditor` components.
  - The parent `ruleGroup` object will now be provided to `notToggle` components.
  - The parent `ruleOrGroup` object will now be provided to `dragHandle` components.

### Fixed

- [#529] The full rule object will now be passed to [field-based `validator` functions](https://react-querybuilder.js.org/docs/utils/validation#field-based-validation). Previously, the parameter object only included the `field`, `operator`, `valueSource`, and `value` properties of the rule.

## [v6.4.1] - 2023-05-23

### Fixed

- The custom JsonLogic operators `startsWith` and `endsWith` (properties of `jsonLogicAdditionalOperators`) now check the type of the first parameter before calling the respective methods. This avoids errors like "Uncaught TypeError: Cannot read properties of null (reading 'startsWith')" when a field in the object being evaluated is `null`.

## [v6.4.0] - 2023-05-20

### Changed

- [#517] `@react-querybuilder/mantine` now requires Mantine v6. React Query Builder v6.3.0 is compatible with Mantine v5.

### Added

- [#519] Extracted event default/propagation code from `Rule` and `RuleGroup` into a new `useStopEventPropagation` hook.

### Fixed

- `transformQuery` no longer reassigns or remaps properties that don't already exist in the source query object.

## [v6.3.0] - 2023-05-03

### Changed

- [#503] Merged `@react-querybuilder/ctx` and `@react-querybuilder/ts` back into the main `react-querybuilder` package.

### Fixed

- [#503] Resolved dependency issues in some environments.
- [#503] Corrected `query-builder.css.map` "sources" path.

## [v6.2.0] - 2023-04-28

### Changed

- [#499] `@react-querybuilder/material` no longer loads MUI components asynchronously. Therefore, the components no longer need to be preloaded to avoid a flash of unstyled content.

### Fixed

- `transformQuery` with the `deleteRemappedProperties` option set to `true` (which is the default) will not attempt to `delete` properties that do not exist on the object (per `Object.hasOwn()`).

## [v6.1.4] - 2023-03-27

### Fixed

- Subpath exports for utility functions (`formatQuery`, `transformQuery`, and the `parse*` functions) now map to their TypeScript types and work for all module resolution strategies.

## [v6.1.3] - 2023-03-24

### Fixed

- [#491] Chakra UI components no longer have hardcoded style-related props like `size`, `variant`, and `colorScheme`.
- [#491] The `schema` prop will no longer be passed down to Ant Design and Chakra UI components.

## [v6.1.2] - 2023-03-21

### Fixed

- `parseCEL` now recognizes dot-separated identifiers correctly.

## [v6.1.0] - 2023-03-16

### Fixed

- [#488] The `formatQuery` option `quoteFieldNamesWith` now applies to values that represent field names (i.e. `valueSource: 'field'`) when exporting to a SQL-based format.

### Added

- [#488] The `formatQuery` option `ruleProcessor` now applies to the "sql" format (though notably _not_ the other SQL-based formats, "parameterized" and "parameterized_named"), allowing complete control over each rule's translation to SQL. The default rule processor for "sql" is exported as `defaultRuleProcessorSQL`.

## [v6.0.7] - 2023-03-10

### Fixed

- [#486] Custom, non-legacy `valueProcessor` functions called from `formatQuery` will now receive all relevant options, not only `parseNumbers`.

## [v6.0.6] - 2023-03-07

### Fixed

- [#483] The regular expression behind `parseSQL` in the previous version was capturing too many characters when field names were wrapped in delimiters.

## [v6.0.5] - 2023-03-06

### Fixed

- [#479] `parseSQL` is now _much_ more permissive of valid characters within strings and identifiers (whether they are delimited or plain). ([#478] only added recognition of spaces within delimited identifiers.)

## [v6.0.4] - 2023-03-05

### Fixed

- [#478] `parseSQL` now recognizes field names wrapped in square brackets, like `[field name]`. (The corresponding update to `formatQuery` was made in [#463] as part of v6.0.0).

## [v6.0.3] - 2023-03-02

### Fixed

- [#472] All development-mode console error messages have been (temporarily) removed to avoid the `process is not defined` issue.
- `BulmaValueSelector` now adds the `"is-multiple"` class to the wrapper `div` when the `multiple` prop is `true`.

## [v6.0.2] - 2023-02-25

### Fixed

- [#470] `parseSQL` now handles escaped single quotes within strings

## [v6.0.1] - 2023-02-22

### Added

- [Fluent UI](https://github.com/microsoft/fluentui) [compatibility package](https://www.npmjs.com/package/@react-querybuilder/fluent)

## [v6.0.0] - 2023-02-18

### Changed

- [#455] A UMD build is no longer provided. See [new instructions for buildless environments using ESM](https://react-querybuilder.js.org/docs/buildless).
- [#431] Major `ValueEditor` update--including the `ValueEditor`s in the compatibility packages--for "between"/"notBetween" operators. When the `operator` for a rule is "between" or "notBetween", two inputs will be displayed. Each will have the class "rule-value-list-item". They will manage the `value` as a comma-separated list unless `listsAsArrays` is `true`, in which case a proper array will be used.
- [#431] The default border radius on rule groups and branch lines (SCSS variable `$rqb-border-radius`) is now `0.25rem` (previously `4px`). Visually, this should be the same for most users since `16px` is the default `font-size` on most browsers, and $16 \times 0.25 = 4$.
- [#431] Utility function `c` has been removed. Use a package like [`clsx`](https://www.npmjs.com/package/clsx) (what RQB uses internally) instead.
- [#431] Bulma compatibility components no longer specify the `is-small` class, so they will be rendered at their default size.

### Fixed

- [#452] All packages now use the `"exports"` field in their `package.json` for better ESM compatibility.

### Added

- [#452] New `ValueEditor` prop `selectorComponent` (optional) enables the replacement of only the selector component in the value editor without recreating the logic in the default value editor. E.g., `const MyValueEditor = (props: ValueEditorProps) => (<ValueEditor {...props} selectorComponent={MyValueSelector} />)` will use the default value editor logic and presentation _except_ when it would normally display the default `ValueSelector`.
- [#452] New [React Native](https://reactnative.dev/)-compatible package `@react-querybuilder/native` and associated [example](https://github.com/react-querybuilder/react-querybuilder/tree/main/examples/native) showcasing multiple UI libraries.
- [#452] New exports:
  - `useQueryBuilder`: All logic and configuration formerly internal to the `QueryBuilder` component has been extracted into a custom Hook, making it easy to implement one's own presentation layer without reproducing or copy-pasting the official component code.
  - `useRuleGroup`: As `useQueryBuilder` is to the `QueryBuilder` component, the `useRuleGroup` Hook is to the `RuleGroup` component.
  - `useRule`: As `useRuleGroup` is to the `RuleGroup` component, the `useRule` Hook is to the `Rule` component.
  - `RuleGroupHeaderComponents`/`RuleGroupBodyComponents`: These JSX fragments have been extracted from the `RuleGroup` component and exposed as named exports, enabling the creation of a custom `RuleGroup` wrapper without recreating the "innards" of the default `RuleGroup`. (For example, the new `@react-querybuilder/native` package wraps these fragments in `View` elements from `react-native`).
- [#431] New props and Hook returns to support `ValueEditor`s new behavior for "between"/"notBetween" operators.
  - New `QueryBuilder` prop `getValueEditorSeparator`: Takes a `field` name and an `operator` name and should return a `ReactNode` (string, element, etc.) that will be placed between the two editors when `operator` is "between" or "notBetween". E.g., `getValueEditorSeparator={() => "and"}`.
  - New `QueryBuilder` prop `parseNumbers`: When `true`, the default `ValueEditor` will update its rule with an actual number instead of the string representation whenever possible.
  - New `ValueEditor` prop `skipHook`: When `true`, the `useValueEditor` hook call within the default `ValueEditor` component will not make query updates. Enables safer rendering of the default `ValueEditor` as a fallback to a custom value editor.
  - The `useValueEditor` hook now returns an object with `valueAsArray` and `multiValueHandler` properties. See `ValueEditor` code for usage.
- [#455] `regenerateIDs` works for any object, not just rule groups.
- [#455] Query tools (`add`, `remove`, `update`, and `move`) will fail gracefully and return the original query if the provided `path` or `parentPath` points to an invalid location in the query hierarchy.
- [#463] The `formatQuery` option `quoteFieldNamesWith` now accepts an array of strings with two elements. The first element will precede each field name and the second will succeed each field name. E.g., `['[', ']']` would result in `` `[Field name] ...` ``.

## [v5.4.1] - 2023-01-30

### Fixed

- [#458] Fixed `parseJsonLogic` output when a negated "between", "in", "contains", "beginsWith", or "endsWith" rule is the only operation.

## [v5.4.0] - 2023-01-06

### Changed

- [#443] Automatically generated `id`s are no longer prefixed with `"g-"` or `"r-"`.
- The default border color has changed from `#7f81a2` to `#8081a2`. This difference will almost certainly be imperceptible.

### Fixed

- [#443] `generateID` no longer tries to `require('crypto')` which should allow its use in more environments and build targets.

### Added

- [#443] New prop `idGenerator` can be used to override the default `generateID` function.

## [v5.3.3] - 2022-12-27

### Fixed

- New `jsonLogicOperations` option was causing `parseJsonLogic` to return a rule instead of a group if only one JsonLogic rule was passed in.

## [v5.3.2] - 2022-12-26

### Added

- [#434] Added `jsonLogicOperations` option to `parseJsonLogic` to enable parsing of custom operations.

## [v5.3.1] - 2022-12-23

### Fixed

- [#432] The `crypto` package was used in a way that didn't work in some Node environments.

## [v5.3.0] - 2022-12-23

### Changed

- New rule and group `id`s are now generated as valid v4 UUIDs using `crypto.getRandomValues()` instead of `Math.random()`. The `generateID` function used internally is exported.
- [#418] TypeScript interface `NameLabelPair` has been deprecated and is now an alias for the `Option` interface.

### Fixed

- [#407] Drag-and-drop will now allow drops on locked rules (which places the dragged rule/group below the drop target) and above locked rules/groups.
- [#411] When `showCombinatorsBetweenRules` is enabled, a combinator selector immediately above a locked rule/group will no longer be locked unless the group it belongs to is locked.
- `jsonLogicAdditionalOperators` is exported again ([documentation](https://react-querybuilder.js.org/docs/api/export#jsonlogic)).

### Added

- [#422] Adding the class `queryBuilder-branches` displays "tree view" branch lines.
- [#426] Dynamic classnames based on the specific rule/group properties.
  - New function props `getRuleClassname` and `getRuleGroupClassname` are passed the rule or group, and the return value will be added as a class to the surrounding `div`.
  - `Field`, `Operator`, and new interface `Combinator` now have an optional `className` property that will be applied to rules or groups that specify the appropriate attribute.
- [#417] Optional `arity` property for operators. When `arity` is either "unary" or a number less than 2, the value editor will not render when that operator is selected (similar to the standard "null"/"notNull" operators).
- [#408] The interfaces `Option` (née `NameLabelPair`), `Field`, and `ValueEditorProps` now accept generics for `name` and other properties.
- [#418] A new `OptionList` type covers the `options` property for all standard selection lists (field, operator, combinator, etc.). Previously this was a union type: `NameLabelPair[] | OptionGroup<NameLabelPair>[]`. `OptionList` is equivalent to this type, but 1) doesn't require typing the base type twice, and 2) uses the new `Option` name instead of the deprecated `NameLabelPair`.
- [#421] When `independentCombinators` is enabled, custom `onAddRule` and `onAddGroup` callbacks can add a `combinatorPreceding` property to the rule/group which will end up being the combinator inserted above the new rule/group (if the parent group is not empty).

## [v5.2.0] - 2022-11-26

### Added

- [#403] Add `onRemove` prop and pass rule/group to all `ActionElement`s (buttons).

## [v5.1.3] - 2022-11-23

### Fixed

- [#387] Support `antd` version 5.

## [v5.1.2] - 2022-11-21

### Fixed

- [#399]/[#401] When dragging a rule or group over a group header, the `dndOver` class is no longer applied to child group headers.

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

- [#394] `parseJsonLogic` now handles `null` values correctly.

### Added

- [#392] `parseMongoDB` utility for importing queries from [MongoDB](https://www.mongodb.com/).

## [v5.0.0] - 2022-10-22

### Changed

- Internet Explorer is no longer supported.
- The minimum TypeScript version is now 4.5.
- When `defaultQuery` is defined, an `id` property will be added to each rule and group in the query hierarchy. This will be reflected in the `onQueryChange` callback parameter. In previous versions `defaultQuery` was not modified by the component itself, but `id` is now added because it is a required attribute internally.
- Related to the previous bullet, the `prepareRuleGroup` utility function will no longer coerce the `not` property of groups to be a `boolean` type (or even defined at all).
- [#385] MongoDB output has been simplified: The `$eq` and `$and` operators are only used when necessary.
- [#343] Drag-and-drop functionality migrated
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

- [#324] The `@react-querybuilder/material` package now properly inherits the theme configuration from ancestor `ThemeProvider`s. Note: the `@mui/material` components are now loaded asynchronously by default, so the query builder will initially be rendered with the default components. See the [documentation](https://react-querybuilder.js.org/docs/compat#preload-mui-components) or the [README](https://github.com/react-querybuilder/react-querybuilder/blob/main/packages/material/README.md) to find out how to render the MUI components immediately.
- `parseCEL` now handles strings correctly (including multi-line strings).
- [#389] `AntDValueSelector` properly handles empty string values in multiselect mode.

### Added

- Each [compatibility package](https://react-querybuilder.js.org/docs/compat) now exports its own context provider that injects the appropriate `controlElements` and `controlClassnames` properties into any descendant `QueryBuilder` components (composition FTW!). This is now the recommended usage for all compatibility packages.
- The [`onAddRule`](https://react-querybuilder.js.org/docs/api/querybuilder#onaddrule) and [`onAddGroup`](https://react-querybuilder.js.org/docs/api/querybuilder#onaddgroup) callback props now receive an optional "context" parameter as the fourth argument. This parameter can be provided by a custom `addRuleAction`/`addGroupAction` component to its `handleOnClick` prop. This allows users to alter or replace the default rule based on arbitrary data. For example, the `addRuleAction` component could render two "add rule" buttons which add different rules depending on which one was clicked, as long as they provided a different `context` parameter.
- When drag-and-drop is enabled, rules will be copied instead of moved if the user has a modifier key (<kbd>Alt</kbd> on Windows/Linux, <kbd>⌥ Option</kbd> on Mac) pressed when the drop occurs.
- `formatQuery` has a new `ruleProcessor` configuration option applicable to non-SQL query language formats. When provided, the entire rule output will be determined by the function. For the relevant formats, `valueProcessor` already behaved this way; the default "value" processors have been renamed to `defaultRuleProcessor[Format]` to clarify the behavior. The default processors' original "value" names are deprecated but still available (with no immediate plans to remove them).
- `parseSQL` will now ignore a leading `WHERE` keyword, e.g. `parseSQL("WHERE firstName = 'Steve'")` will not fail to produce a query rule like in v4.

<details>

<summary>Miscellaneous</summary>

- The [documentation site](https://react-querybuilder.js.org/) now has separate documentation for past versions.
- The `controlElements` prop has a new option: `inlineCombinator`. By default, this is a small wrapper around the `combinatorSelector` component that is used when either `showCombinatorsBetweenRules` or `independentCombinators` is `true`. The `inlineCombinator` option was only added to support `@react-querybuilder/dnd`, so there is almost certainly no reason to use it directly.

</details>

## [v4.5.3] - 2022-09-28

### Fixed

- [#364] The array passed to the `fields` prop was being mutated if it contained duplicates, whether they were duplicate field `name`s or option group `label`s. The `fields` prop is now treated as immutable.
- [#374] `RuleGroup` was using unstable keys to render elements in the `rules` array. Keys are now stable based on `id` properties, which are auto-generated if not provided in the `query`/`defaultQuery` prop.

## [v4.5.2] - 2022-08-19

### Fixed

- Backslashes are now properly escaped when `formatQuery` generates `JSON.parse`-able strings ("mongodb" and "json_without_ids" formats).
- The `parse*` import methods properly handle backslashes.
- [#353] The `moment` package is no longer included in the build for `@react-querybuilder/antd`.

### Added

- [#333] When a rule has an `operator` of "between"/"notBetween" and either `valueSource: "field"` or `valueEditorType: "select"`, the default `ValueEditor` will display two drop-down lists. The values of the drop-down lists will be joined with a comma when the rule's `value` property is updated.
- [#337] In conjunction with the "between"-related enhancements above, a new Boolean prop has been added to `<QueryBuilder />` called `listsAsArrays`. This prop works in a similar manner to the [`parse*` option of the same name](https://react-querybuilder.js.org/docs/api/import#lists-as-arrays). When the prop is `true`, `ValueEditor` (and `ValueSelector` for `multiple: true`) will store lists of values, including "between" value pairs, as proper arrays instead of comma-separated strings.
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

- [#319] `formatQuery` will now invoke custom `valueProcessor` functions with different arguments based on the function's `.length` property, which is the number of arguments a function accepts excluding those with default values:
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

- [#319] Invoking `valueProcessor` with the full `RuleType` object provides access to much more information about specific rules. Standard properties that were previously unavailable include `path`, `id`, and `disabled`, but any custom properties will also be accessible.
  - The default value processors for "sql", "parameterized", "parameterized_named", "mongodb", "cel", and "spel" formats have not changed, but alternate functions using the new `fn(rule, options)` signature are now available:
    - `defaultValueProcessorByRule`
    - `defaultValueProcessorCELByRule`
    - `defaultValueProcessorMongoDBByRule`
    - `defaultValueProcessorSpELByRule`
- [#320]/[#323] New parser functions (also available as standalone builds in the `dist` folder). Click the respective "Import from [format]" button in [the demo](https://react-querybuilder.js.org/react-querybuilder) to try them out.
  - `parseJsonLogic` takes a [JsonLogic](https://jsonlogic.com/) object and converts it to `RuleGroupType`.
  - `parseCEL` takes a [CEL](https://github.com/google/cel-spec) string and converts it to `RuleGroupType`. Click the "Import from CEL" button in [the demo](https://react-querybuilder.js.org/react-querybuilder).
- [#328] New utility function `transformQuery` recursively processes rule groups and rules with the provided `ruleProcessor`, `ruleGroupProcessor`, and other options ([documentation](https://react-querybuilder.js.org/docs/api/misc#transformquery)).

### Fixed

- [#323] `formatQuery` outputs will now escape quotation marks when appropriate:
  - For SQL ("sql", "parameterized", "parameterized_named"), single quotes will be doubled up, e.g. `(firstName = 'Ra''s')`
  - For other formats, double or single quotes will be escaped with a backslash if necessary (`firstName == 'Ra\'s'` or `firstName == "Ra\"s"`).
- [#323] The standalone builds of `formatQuery` and `parseSQL` no longer include React and are not minified.

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

- [#304] Many compatibility components now accept the props of the rendered library component in addition to the standard props ([see documentation](https://react-querybuilder.js.org/docs/compat#customization)), allowing customization specific to the style library.
- [#306] New prop `autoSelectOperator` ([documentation](https://react-querybuilder.js.org/docs/api/querybuilder#autoselectoperator)) behaves like [`autoSelectField`](https://react-querybuilder.js.org/docs/api/querybuilder#autoselectfield) but for the operator selector.
  - The `fields` and `operators` properties of the `translations` prop object now accept `placeholderName`, `placeholderLabel`, and `placeholderGroupLabel` properties ([documentation](https://react-querybuilder.js.org/docs/api/querybuilder#translations)). These translatable strings set the default field and operator values and labels when `autoSelectField` and/or `autoSelectOperator` are set to `false`.
  - Corresponding options were also added to [`formatQuery`](https://react-querybuilder.js.org/docs/api/export#placeholder-values), which will now ignore rules where the `field` or `operator` match the placeholder values for most export formats.
- [#303] Added support for wildcards concatenated to field names in `parseSQL`. Examples:
  - SQL `"lastName LIKE firstName || '%'"` would generate `RuleType` object:
    ```json
    {
      "field": "lastName",
      "operator": "beginsWith",
      "value": "firstName",
      "valueSource": "field"
    }
    ```
  - SQL `"lastName NOT LIKE '%' || firstName || '%'"` would generate `RuleType` object:
    ```json
    {
      "field": "lastName",
      "operator": "doesNotContain",
      "value": "firstName",
      "valueSource": "field"
    }
    ```

### Fixed

- [#301] `react-querybuilder` and the compatibility packages are all built with React v18 now (the `peerDependencies` version is still `">=16.8.0"`). Previous 4.x versions were usable within React 18 applications, but now the build and tests explicitly use it.
- [#308] The CodeSandbox CI template is now located [within the repository](https://github.com/react-querybuilder/react-querybuilder/tree/main/examples/ci), and several other CodeSandbox-compatible examples have been added as well (see [examples folder](https://github.com/react-querybuilder/react-querybuilder/tree/main/examples)).

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

- [#276] When using `react-querybuilder` v4 within an application that already implemented `react-dnd`, an error would appear: "Cannot have two HTML5 backends at the same time." This can now be resolved by using the `<QueryBuilderWithoutDndProvider />` component instead of `<QueryBuilder />`. They are functionally the same, but the former allows (in fact, _relies on_) a `react-dnd` backend (e.g. `react-dnd-html5-backend`) to be implemented higher up in the component tree.
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
- A new drag handle element will always be rendered at the front of every rule and rule group header element, regardless of whether you enable the drag-and-drop feature (see Features section below). If drag-and-drop is disabled (the default setting), you should hide the drag handle by either (1) using the default stylesheet which hides it automatically when drag-and-drop is disabled, or (2) hiding it with a style rule like `.queryBuilder-dragHandle { display: none; }`.
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
- [#258] When the `formatQuery` export format is "mongodb", the resulting string can be parsed by `JSON.parse` ([@mylawacad](https://github.com/mylawacad))

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

### Miscellaneous

<details>

<summary>v4.0.0-beta.* releases</summary>

#### [v4.0.0-beta.8] - 2021-12-24

##### Fixed

- [#255] Fix a couple of issues with the "mongodb" `formatQuery` export type ([@mylawacad](https://github.com/mylawacad))

##### Added

- [#261] `valueProcessor` for "mongodb" export format
- [#252] Export `RuleGroup` component ([@ZigZagT](https://github.com/ZigZagT))
- [#250] Bulma compatibility package and demo
- [#248] `disabled` prop

#### [v4.0.0-beta.7] - 2021-12-13

##### Fixed

- [#247] Fix drag-and-drop for `independentCombinators`

#### [v4.0.0-beta.6] - 2021-11-27

- Maintenance release focused on converting to a monorepo with Vite driving the build process.

##### Added

- If using `react-querybuilder` with NodeJS, and you only want to use the `formatQuery` function, you no longer have to install React on the server as well. Just `import formatQuery from 'react-querybuilder/dist/formatQuery'`. Note: TypeScript types are not available for this export.

#### [v4.0.0-beta.5] - 2021-11-12

##### Changed

- Earlier 4.0 beta releases had an `inlineCombinators` prop. This has been renamed to `independentCombinators`.
- Dropped `lodash` dependency. Added `immer` and `react-dnd`.
- **_Styles_**
  - The default styles now use flexbox. This should allow greater flexibility and more consistent styling.
  - The `query-builder.scss` file now uses variables instead of hard-coded colors and spacing. Feel free to import it and override the default values with your own theme's colors/styles/etc.
- **_Structure_**
  - A new drag handle element sits at the front of every rule and rule group header element. If you are not using the drag-and-drop feature (see Features section below), you should hide the drag handle by using the default stylesheet which hides it automatically when `enableDragAndDrop` is `false`, or hide it with a rule like `.queryBuilder-dragHandle { display: none; }`.
- **_Behavior_**
  - `<QueryBuilder />` is now a properly controlled or uncontrolled component depending on which props are passed in. If you pass a `query` prop, the query will not change until a new `query` is passed in. You should use the parameter of the `onQueryChange` callback to update the `query` prop. Typically this involves using React's `useState` hook. To render an _uncontrolled_ component, don't pass a `query` prop. You can set the initial query by using the new `defaultQuery` prop, and you can still listen for changes with `onQueryChange`.

##### Added

- [#235] Drag-and-drop! Pass the `enableDragAndDrop` prop to display a drag handle on each rule and group header. Users will be able to reorder rules and groups with the click (and drag) of a mouse.
- New IE11-compatible demo page.

#### [v4.0.0-beta.4] - 2021-11-03

##### Fixed

- [v4.0.0-beta.3] had an outdated build

##### Added

- All props on the `<QueryBuilder />` component are now optional

#### [v4.0.0-beta.3] - 2021-11-03

##### Added

- [#231] `inlineCombinators` prop. When `true`, `<QueryBuilder />` will insert an independent combinator (and/or) selector between each pair of sibling rules/groups. This new feature shouldn't introduce any breaking changes, i.e. if `inlineCombinators` is undefined or `false`, then the `<QueryBuilder />` should behave the same as it did in v4.0.0-beta.2. However, the TypeScript types are _significantly_ more complex in this release so we're going to leave this beta out for a while before releasing v4.0.0 properly.

#### [v4.0.0-beta.2] - 2021-10-29

##### Added

- [#230] `parseSQL` method to import queries from SQL (try the [demo](https://react-querybuilder.js.org/react-querybuilder/)).

#### [v4.0.0-beta.1] - 2021-10-23

##### Changed

- [#229] Path-based query management
  - `Rule` and `RuleGroup` props now include `path: number[]`, and `id` may be undefined.
  - `getLevel` has been removed from the `schema` prop.
  - The following functions that are part of the `schema` prop have been refactored to use `path` or `parentPath` instead of `id` or `parentId`: `onGroupAdd`, `onGroupRemove`, `onPropChange`, `onRuleAdd`, `onRuleRemove`.
  - `onAddRule` and `onAddGroup` callbacks now pass a `number[]` (`parentPath`) as the second argument instead of a `string` (`parentId`).
  - The exported method `findRule` has been replaced by `findPath`, which is useful in conjunction with the previously mentioned, refactored `onAddRule` and `onAddGroup` callbacks.
  - The `onQueryChange` callback's argument, the current query object, will include a `path` for each rule and group. The `formatQuery` default output format, "json", will also include `path`s.
  - Rule and group `div`s now include a `data-path` attribute.

##### Added

- `formatQuery` accepts a new `format` type: `"parameterized_named"`. This new format is similar to `"parameterized"`, but instead of anonymous `?`-style bind variables, each parameter is given a unique name based on the field name and the order in the query. A corresponding option `paramPrefix` is available in order to use a different character than the default ":" within the `sql` string.
- [#228] CodeSandbox CI

</details>

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

- [#225] [Validation](https://react-querybuilder.js.org/docs/3/intro#validator): pass a `validator` prop to validate the entire query, or include a `validator` attribute on each field in the `fields` array to validate each rule based on the selected field.
  - CSS classes will be added (`"queryBuilder-valid"` or `"queryBuilder-invalid"`) to validated rules and groups, and all sub-components will receive the validation result as a prop.
  - The `formatQuery` function has two new validation-related options: (1) `validator` (same signature as the prop mentioned earlier) and (2) `fields` (same shape as the `fields` prop). Rules and groups deemed invalid will be ignored if the output format is "sql", "parameterized", or "mongodb".
- [#223] [Rule/group cloning](https://react-querybuilder.js.org/docs/3/intro#showclonebuttons): pass the `showCloneButtons` prop to enable duplication of rules and groups. Associated `controlElements` properties are also available for custom clone button components.
- [#224] [Add rule to new groups](https://react-querybuilder.js.org/docs/3/intro#addruletonewgroups): pass the `addRuleToNewGroups` prop to add the default rule to all new groups automatically.
- [#224] [Default operator](https://react-querybuilder.js.org/docs/3/intro#getdefaultoperator): pass a `getDefaultOperator` function prop to determine which operator is set for new rules (or include a `defaultOperator` attribute on objects in the `fields` array to set the default operator for specific fields).
- [#224] [Cancel or modify a new rule](https://react-querybuilder.js.org/docs/3/intro#onaddrule)/[group](https://react-querybuilder.js.org/docs/3/intro#onaddgroup): use the `onAddRule` and `onAddGroup` callbacks to return a new rule/group that will be added instead of the default, or return `false` to cancel the addition of the new rule/group. _(Note: to completely prevent the addition of new groups, you can also pass `controlElements={{ addGroupAction: () => null }}` which will hide the "+Group" button.)_
- [New "between" and "not between" default operators](https://react-querybuilder.js.org/docs/3/intro#operators): the [`formatQuantity`](https://react-querybuilder.js.org/docs/3/intro#formatquantity) function has also been updated to handle the new operators properly.
- The [demo](https://react-querybuilder.js.org/react-querybuilder/) has been updated with all the new features, and now includes tooltips on options and links to relevant documentation.

## [v3.11.1] - 2021-09-18

### Changed

- Relaxed and corrected types related to `NameLabelPair`
- Simplified `formatQuery` for MongoDB

## [v3.11.0] - 2021-08-24

### Added

- [#218] `autoSelectField` prop. When set to `false`, prevents automatic selection of the first field in new rules by adding an "empty" choice as the first option. When the "empty" option is selected, the operator and value components for that rule will not be displayed.

## [v3.10.1] - 2021-08-19

### Added

- [#214] `"mongodb"` query export format ([@CodMonk](https://github.com/CodMonk))

## [v3.10.0] - 2021-07-27

### Added

- New item in the `translations` prop object: `notToggle.label`
- [#210] Customizable label for "not" toggle component ([@jakeboone02](https://github.com/jakeboone02))

## [v3.9.9] - 2021-03-05

### Changed

- `field`, `fieldData`, and `operator` are now required in `ValueEditorProps`

## [v3.9.8] - 2021-02-22

### Added

- [#190] Export default components `ActionElement`, `NotToggle`, `ValueEditor`, and `ValueSelector` ([@jakeboone02](https://github.com/jakeboone02))

## [v3.9.7] - 2021-02-18

### Fixed

- [#188] Any extra attributes in the `query` prop will be persisted ([@jakeboone02](https://github.com/jakeboone02))

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

- [#179] Added `enableMountQueryChange` prop to allow disabling initial `onQueryChange` call ([@saurabhnemade](https://github.com/saurabhnemade))

## [v3.9.2] - 2021-01-24

### Added

- [#178] Export several default configuration options ([@jakeboone02](https://github.com/jakeboone02))
  - `defaultCombinators`
  - `defaultOperators`
  - `defaultTranslations`
  - `defaultValueProcessor`

## [v3.9.1] - 2021-01-17

### Changed

- [#175] Replaced `nanoid` with `Math.random()` ([@jakeboone02](https://github.com/jakeboone02))

### Fixed

- This release removes the requirement to re-map the `window.msCrypto` object to `window.crypto` for IE11. Woohoo!

## [v3.9.0] - 2020-12-07

### Added

- [#171] Add `context` prop to pass arbitrary data to custom components ([@jakeboone02](https://github.com/jakeboone02))

## [v3.8.4] - 2020-11-16

### Added

- [#167] `placeholder` support for text fields ([@eddie-xavi](https://github.com/eddie-xavi))

## [v3.8.3] - 2020-11-04

### Fixed

- Bug with using false as `defaultValue`

## [v3.8.2] - 2020-11-03

### Fixed

- [#164] Fixed setting of default values ([@jakeboone02](https://github.com/jakeboone02))

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
- [#160] Added field-level configuration options ([@jakeboone02](https://github.com/jakeboone02))

## [v3.7.1] - 2020-10-07

### Fixed

- [#158] `createRule` was setting `name` to `undefined` when fields are empty ([@saurabhnemade](https://github.com/saurabhnemade))

## [v3.7.0] - 2020-10-04

### Added

- [#157] `getDefaultField` and `getDefaultValue` props ([@jakeboone02](https://github.com/jakeboone02))

### Fixed

- Allow nulls to be returned from getOperators and getValueEditorType

## [v3.6.0] - 2020-10-01

### Changed

- [#155] Refactored `formatQuery` options ([@jakeboone02](https://github.com/jakeboone02))
  - `valueProcessor` is no longer the third argument of `formatQuery`. To use a custom `valueProcessor`, pass an options object as the second parameter and include `valueProcessor` as a key in that object.
  - When the `formatQuery` format is set to `sql` (either by `formatQuery(query, 'sql')` or `formatQuery(query, { format: 'sql' })`), the values will be quoted with single quotes instead of double quotes, e.g. `(name = 'Peter Parker')`.

## [v3.5.1] - 2020-06-22

### Fixed

- Prevent lodash from assigning global `_` variable 74ee1ca

## [v3.5.0] - 2020-06-20

### Changed

- [#145] Convert source to TypeScript ([@jakeboone02](https://github.com/jakeboone02))
- [#135] Reset `value` on `operator` change ([@artenator](https://github.com/artenator))

### Added

- Option to reset rule on operator change
- [#144] IE11 support ([@jakeboone02](https://github.com/jakeboone02))

## [v3.4.0] - 2020-06-15

### Added

- [#142] Customizable `Rule` component ([@jakeboone02](https://github.com/jakeboone02))

## [v3.3.0] - 2020-06-12

### Added

- [#141] `RuleGroup` can now be replaced with a custom component ([@rbalaine](https://github.com/rbalaine))

### Changed

- Some TypeScript type names have changed, e.g. `Rule` is now `RuleType` since `Rule` is an exported React component.

## [v3.2.0] - 2020-05-28

### Added

- [#139] `"parameterized"` option for `formatQuery` ([@jakeboone02](https://github.com/jakeboone02))

## [v3.1.2] - 2020-03-19

### Added

- `"json_without_ids"` option for `formatQuery`

## [v3.1.1] - 2020-02-18

### Fixed

- v3.1.0 published files were outdated

## [v3.1.0] - 2020-02-18

### Added

- [#122] `resetOnFieldChange` prop to control `value` and `operator` reset functionality on `field` change ([@lakk1](https://github.com/lakk1))

## [v3.0.2] - 2019-12-09

### Fixed

- [v3.0.1] published files were outdated

## [v3.0.1] - 2019-12-06

### Fixed

- [#117] Rule default value on add/change ([@xxsnakerxx](https://github.com/xxsnakerxx))

## [v3.0.0] - 2019-11-29

### Added

- [#115] Add `div.ruleGroup-header` ([@jakeboone02](https://github.com/jakeboone02))
  - A `div` with class `ruleGroup-header` now wraps around the rule group header elements to assist with styling those elements as a group. This may affect some custom CSS rules that depend on the particular HTML arrangement in versions earlier than 3.0.0.

## [v2.5.1] - 2019-11-11

### Fixed

- [#113] Passing `not` property to rule groups below root ([@RomanLamsal1337](https://github.com/RomanLamsal1337))

## [v2.5.0] - 2019-11-10

### Changed

- Lowercase operator labels

### Fixed

- [#111], [#112] `formatQuery` handle more operators ([@oumar-sh](https://github.com/oumar-sh))

## [v2.4.0] - 2019-09-23

### Added

- [#107] `fieldData` prop for custom `OperatorSelector` and `ValueEditor` components ([@jakeboone02](https://github.com/jakeboone02))

## [v2.3.0] - 2019-09-16

### Added

- [#104] Inversion (`"not"`) toggle switch for rule groups ([@jakeboone02](https://github.com/jakeboone02))
- [#103] Added `level` and rule `id` to DOM elements ([@srinivasdamam](https://github.com/srinivasdamam))

### Changed

- [#102] Replace `uuid` with `nanoid` ([@srinivasdamam](https://github.com/srinivasdamam))

## [v2.2.1] - 2019-08-29

### Fixed

- TypeScript definitions

## [v2.2.0] - 2019-08-29

### Added

- [#96] `showCombinatorsBetweenRules` prop
- [#95] `formatQuery` function

### Fixed

- Added missing props to new `ValueEditor` types
- Added `title` prop and completed `ValueEditor` props

## [v2.1.0] - 2019-08-27

### Added

- Enhanced default `ValueEditor` to handle multiple input types ([#94])

## [v2.0.1] - 2019-08-27

### Added

- [#93] Pass in new root to `_notifyQueryChange` ([@pumbor](https://github.com/pumbor))
- [#84] Add `className` prop to `ValueEditor`, pass it on to `input` element ([@kkkrist](https://github.com/kkkrist))

## [v2.0.0] - 2019-08-18

### Changed

- [#87] Hooks rewrite and increased test coverage ([@jakeboone02](https://github.com/jakeboone02))

### Fixed

- [#82] Removed type restrictions on rule `value`s ([@jakeboone02](https://github.com/jakeboone02))

## [v1.4.3] - 2018-04-08

### Fixed

- [#60] Fixed TypeScript function parameter definitions ([@jakeboone02](https://github.com/jakeboone02))

## [v1.4.2] - 2018-03-02

### Added

- [#55] Add optional `id` information in README ([@CharlyJazz](https://github.com/CharlyJazz))

## [v1.4.1] - 2018-03-02

### Added

- [#53] Add optional `id` property to `fields` ([@CharlyJazz](https://github.com/CharlyJazz))

## [v1.4.0] - 2017-12-11

### Fixed

- [#46] Types: Added `id` attribute to `RuleGroup` ([@jakeboone02](https://github.com/jakeboone02))

### Added

- [#47] Add `translations` prop to be able to set translatable texts ([@bubenkoff](https://github.com/bubenkoff))
- [#44] Add TypeScript typings ([@jakeboone02](https://github.com/jakeboone02))
- [#42] Converted `Rule` subcomponents to SFCs ([@jakeboone02](https://github.com/jakeboone02))

## [v1.3.8] - 2017-07-14

### Fixed

- [#37] package updates and making it compatible with codesandbox.io ([@pavanpodila](https://github.com/pavanpodila))

## [v1.3.6] - 2017-03-13

### Added

- [#28] Add `field` to operator selector control element ([@SamLoy](https://github.com/SamLoy))
- [#27] Added more context information to `controlElements` ([@SamLoy](https://github.com/SamLoy))

## [v1.3.5] - 2017-02-06

### Fixed

- [#24] README: Update live demo link to use v1.3.4 and React 15 ([@mreishus](https://github.com/mreishus))
- [#23] README.md Usage - destructuring removed from import ([@mreishus](https://github.com/mreishus))

## [v1.3.4] - 2017-01-23

### Added

- [#18] Add code coverage & TravisCI ([@maniax89](https://github.com/maniax89))
- [#17] Add npm-based changelog generator ([@maniax89](https://github.com/maniax89))

## [v1.3.0] - 2016-10-12

### Fixed

- [#15] Fix test setup ([@maniax89](https://github.com/maniax89))
- [#11] Move 'this' binding to `componentWillMount` ([@maniax89](https://github.com/maniax89))
- [#9] Remove unnecessary imports ([@maniax89](https://github.com/maniax89))

### Added

- [#13] Rule group tests ([@maniax89](https://github.com/maniax89))
- [#12] Add `ActionElement` tests to `<Rule />` ([@maniax89](https://github.com/maniax89))
- [#10] WIP: Add `<Rule />` Tests ([@maniax89](https://github.com/maniax89))
- [#8] WIP: Added CHANGELOG.md ([@maniax89](https://github.com/maniax89))
- [#7] Add in `ActionElement` for custom `<button />` elements ([@maniax89](https://github.com/maniax89))
- [#6] Custom rule controls ([@maniax89](https://github.com/maniax89))

## [v1.2.0] - 2016-07-11

### Fixed

- [#1] fix missing field ([@vitorhsb](https://github.com/vitorhsb))

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

<!-- #region Issue and Pull Request links -->

[#1]: https://github.com/react-querybuilder/react-querybuilder/pull/1
[#6]: https://github.com/react-querybuilder/react-querybuilder/pull/6
[#7]: https://github.com/react-querybuilder/react-querybuilder/pull/7
[#8]: https://github.com/react-querybuilder/react-querybuilder/pull/8
[#9]: https://github.com/react-querybuilder/react-querybuilder/pull/9
[#10]: https://github.com/react-querybuilder/react-querybuilder/pull/10
[#11]: https://github.com/react-querybuilder/react-querybuilder/pull/11
[#12]: https://github.com/react-querybuilder/react-querybuilder/pull/12
[#13]: https://github.com/react-querybuilder/react-querybuilder/pull/13
[#15]: https://github.com/react-querybuilder/react-querybuilder/pull/15
[#17]: https://github.com/react-querybuilder/react-querybuilder/pull/17
[#18]: https://github.com/react-querybuilder/react-querybuilder/pull/18
[#23]: https://github.com/react-querybuilder/react-querybuilder/pull/23
[#24]: https://github.com/react-querybuilder/react-querybuilder/pull/24
[#27]: https://github.com/react-querybuilder/react-querybuilder/pull/27
[#28]: https://github.com/react-querybuilder/react-querybuilder/pull/28
[#37]: https://github.com/react-querybuilder/react-querybuilder/pull/37
[#42]: https://github.com/react-querybuilder/react-querybuilder/pull/42
[#44]: https://github.com/react-querybuilder/react-querybuilder/pull/44
[#46]: https://github.com/react-querybuilder/react-querybuilder/pull/46
[#47]: https://github.com/react-querybuilder/react-querybuilder/pull/47
[#53]: https://github.com/react-querybuilder/react-querybuilder/pull/53
[#55]: https://github.com/react-querybuilder/react-querybuilder/pull/55
[#60]: https://github.com/react-querybuilder/react-querybuilder/pull/60
[#82]: https://github.com/react-querybuilder/react-querybuilder/pull/82
[#84]: https://github.com/react-querybuilder/react-querybuilder/pull/84
[#87]: https://github.com/react-querybuilder/react-querybuilder/pull/87
[#93]: https://github.com/react-querybuilder/react-querybuilder/pull/93
[#94]: https://github.com/react-querybuilder/react-querybuilder/pull/94
[#95]: https://github.com/react-querybuilder/react-querybuilder/pull/95
[#96]: https://github.com/react-querybuilder/react-querybuilder/pull/96
[#102]: https://github.com/react-querybuilder/react-querybuilder/pull/102
[#103]: https://github.com/react-querybuilder/react-querybuilder/pull/103
[#104]: https://github.com/react-querybuilder/react-querybuilder/pull/104
[#107]: https://github.com/react-querybuilder/react-querybuilder/pull/107
[#111]: https://github.com/react-querybuilder/react-querybuilder/pull/111
[#112]: https://github.com/react-querybuilder/react-querybuilder/pull/112
[#113]: https://github.com/react-querybuilder/react-querybuilder/pull/113
[#115]: https://github.com/react-querybuilder/react-querybuilder/pull/115
[#117]: https://github.com/react-querybuilder/react-querybuilder/pull/117
[#122]: https://github.com/react-querybuilder/react-querybuilder/pull/122
[#135]: https://github.com/react-querybuilder/react-querybuilder/pull/135
[#139]: https://github.com/react-querybuilder/react-querybuilder/pull/139
[#141]: https://github.com/react-querybuilder/react-querybuilder/pull/141
[#142]: https://github.com/react-querybuilder/react-querybuilder/pull/142
[#144]: https://github.com/react-querybuilder/react-querybuilder/pull/144
[#145]: https://github.com/react-querybuilder/react-querybuilder/pull/145
[#155]: https://github.com/react-querybuilder/react-querybuilder/pull/155
[#157]: https://github.com/react-querybuilder/react-querybuilder/pull/157
[#158]: https://github.com/react-querybuilder/react-querybuilder/pull/158
[#160]: https://github.com/react-querybuilder/react-querybuilder/pull/160
[#164]: https://github.com/react-querybuilder/react-querybuilder/pull/164
[#167]: https://github.com/react-querybuilder/react-querybuilder/pull/167
[#171]: https://github.com/react-querybuilder/react-querybuilder/pull/171
[#175]: https://github.com/react-querybuilder/react-querybuilder/pull/175
[#178]: https://github.com/react-querybuilder/react-querybuilder/pull/178
[#179]: https://github.com/react-querybuilder/react-querybuilder/pull/179
[#188]: https://github.com/react-querybuilder/react-querybuilder/pull/188
[#190]: https://github.com/react-querybuilder/react-querybuilder/pull/190
[#210]: https://github.com/react-querybuilder/react-querybuilder/pull/210
[#214]: https://github.com/react-querybuilder/react-querybuilder/pull/214
[#218]: https://github.com/react-querybuilder/react-querybuilder/pull/218
[#223]: https://github.com/react-querybuilder/react-querybuilder/pull/223
[#224]: https://github.com/react-querybuilder/react-querybuilder/pull/224
[#225]: https://github.com/react-querybuilder/react-querybuilder/pull/225
[#228]: https://github.com/react-querybuilder/react-querybuilder/pull/228
[#229]: https://github.com/react-querybuilder/react-querybuilder/pull/229
[#230]: https://github.com/react-querybuilder/react-querybuilder/pull/230
[#231]: https://github.com/react-querybuilder/react-querybuilder/pull/231
[#235]: https://github.com/react-querybuilder/react-querybuilder/pull/235
[#247]: https://github.com/react-querybuilder/react-querybuilder/pull/247
[#248]: https://github.com/react-querybuilder/react-querybuilder/pull/248
[#250]: https://github.com/react-querybuilder/react-querybuilder/pull/250
[#252]: https://github.com/react-querybuilder/react-querybuilder/pull/252
[#255]: https://github.com/react-querybuilder/react-querybuilder/pull/255
[#258]: https://github.com/react-querybuilder/react-querybuilder/pull/258
[#261]: https://github.com/react-querybuilder/react-querybuilder/pull/261
[#276]: https://github.com/react-querybuilder/react-querybuilder/pull/276
[#301]: https://github.com/react-querybuilder/react-querybuilder/pull/301
[#303]: https://github.com/react-querybuilder/react-querybuilder/pull/303
[#304]: https://github.com/react-querybuilder/react-querybuilder/pull/304
[#306]: https://github.com/react-querybuilder/react-querybuilder/pull/306
[#308]: https://github.com/react-querybuilder/react-querybuilder/pull/308
[#319]: https://github.com/react-querybuilder/react-querybuilder/pull/319
[#320]: https://github.com/react-querybuilder/react-querybuilder/pull/320
[#323]: https://github.com/react-querybuilder/react-querybuilder/pull/323
[#324]: https://github.com/react-querybuilder/react-querybuilder/pull/324
[#328]: https://github.com/react-querybuilder/react-querybuilder/pull/328
[#333]: https://github.com/react-querybuilder/react-querybuilder/pull/333
[#337]: https://github.com/react-querybuilder/react-querybuilder/pull/337
[#343]: https://github.com/react-querybuilder/react-querybuilder/pull/343
[#353]: https://github.com/react-querybuilder/react-querybuilder/pull/353
[#364]: https://github.com/react-querybuilder/react-querybuilder/issues/364
[#374]: https://github.com/react-querybuilder/react-querybuilder/issues/374
[#385]: https://github.com/react-querybuilder/react-querybuilder/issues/385
[#387]: https://github.com/react-querybuilder/react-querybuilder/issues/387
[#389]: https://github.com/react-querybuilder/react-querybuilder/pull/389
[#392]: https://github.com/react-querybuilder/react-querybuilder/issues/392
[#394]: https://github.com/react-querybuilder/react-querybuilder/issues/394
[#399]: https://github.com/react-querybuilder/react-querybuilder/issues/399
[#401]: https://github.com/react-querybuilder/react-querybuilder/issues/401
[#403]: https://github.com/react-querybuilder/react-querybuilder/issues/403
[#407]: https://github.com/react-querybuilder/react-querybuilder/issues/407
[#408]: https://github.com/react-querybuilder/react-querybuilder/issues/408
[#411]: https://github.com/react-querybuilder/react-querybuilder/issues/411
[#417]: https://github.com/react-querybuilder/react-querybuilder/issues/417
[#418]: https://github.com/react-querybuilder/react-querybuilder/issues/418
[#421]: https://github.com/react-querybuilder/react-querybuilder/issues/421
[#422]: https://github.com/react-querybuilder/react-querybuilder/issues/422
[#426]: https://github.com/react-querybuilder/react-querybuilder/issues/426
[#431]: https://github.com/react-querybuilder/react-querybuilder/issues/431
[#432]: https://github.com/react-querybuilder/react-querybuilder/issues/432
[#434]: https://github.com/react-querybuilder/react-querybuilder/issues/434
[#443]: https://github.com/react-querybuilder/react-querybuilder/issues/443
[#452]: https://github.com/react-querybuilder/react-querybuilder/pull/452
[#455]: https://github.com/react-querybuilder/react-querybuilder/pull/455
[#458]: https://github.com/react-querybuilder/react-querybuilder/issues/458
[#463]: https://github.com/react-querybuilder/react-querybuilder/pull/463
[#470]: https://github.com/react-querybuilder/react-querybuilder/pull/470
[#472]: https://github.com/react-querybuilder/react-querybuilder/issues/472
[#478]: https://github.com/react-querybuilder/react-querybuilder/pull/478
[#479]: https://github.com/react-querybuilder/react-querybuilder/pull/479
[#483]: https://github.com/react-querybuilder/react-querybuilder/pull/483
[#486]: https://github.com/react-querybuilder/react-querybuilder/pull/486
[#488]: https://github.com/react-querybuilder/react-querybuilder/pull/488
[#491]: https://github.com/react-querybuilder/react-querybuilder/pull/491
[#499]: https://github.com/react-querybuilder/react-querybuilder/pull/499
[#503]: https://github.com/react-querybuilder/react-querybuilder/pull/503
[#512]: https://github.com/react-querybuilder/react-querybuilder/issues/512
[#517]: https://github.com/react-querybuilder/react-querybuilder/pull/517
[#519]: https://github.com/react-querybuilder/react-querybuilder/pull/519
[#523]: https://github.com/react-querybuilder/react-querybuilder/issues/523
[#526]: https://github.com/react-querybuilder/react-querybuilder/issues/526
[#529]: https://github.com/react-querybuilder/react-querybuilder/pull/529
[#537]: https://github.com/react-querybuilder/react-querybuilder/pull/537
[#555]: https://github.com/react-querybuilder/react-querybuilder/issues/555
[#572]: https://github.com/react-querybuilder/react-querybuilder/issues/572
[#574]: https://github.com/react-querybuilder/react-querybuilder/issues/574
[#577]: https://github.com/react-querybuilder/react-querybuilder/pull/577
[#585]: https://github.com/react-querybuilder/react-querybuilder/pull/585
[#586]: https://github.com/react-querybuilder/react-querybuilder/pull/586
[#589]: https://github.com/react-querybuilder/react-querybuilder/pull/589
[#595]: https://github.com/react-querybuilder/react-querybuilder/pull/595
[#606]: https://github.com/react-querybuilder/react-querybuilder/pull/606
[#619]: https://github.com/react-querybuilder/react-querybuilder/pull/619
[#623]: https://github.com/react-querybuilder/react-querybuilder/pull/623
[#625]: https://github.com/react-querybuilder/react-querybuilder/issues/625
[#632]: https://github.com/react-querybuilder/react-querybuilder/pull/632
[#637]: https://github.com/react-querybuilder/react-querybuilder/pull/637
[#638]: https://github.com/react-querybuilder/react-querybuilder/pull/638
[#646]: https://github.com/react-querybuilder/react-querybuilder/pull/646
[#653]: https://github.com/react-querybuilder/react-querybuilder/pull/653
[#654]: https://github.com/react-querybuilder/react-querybuilder/pull/654
[#663]: https://github.com/react-querybuilder/react-querybuilder/pull/663
[#671]: https://github.com/react-querybuilder/react-querybuilder/pull/671
[#677]: https://github.com/react-querybuilder/react-querybuilder/issues/677
[#682]: https://github.com/react-querybuilder/react-querybuilder/issues/682
[#688]: https://github.com/react-querybuilder/react-querybuilder/pull/688
[#692]: https://github.com/react-querybuilder/react-querybuilder/pull/692
[#696]: https://github.com/react-querybuilder/react-querybuilder/pull/696
[#697]: https://github.com/react-querybuilder/react-querybuilder/pull/697
[#699]: https://github.com/react-querybuilder/react-querybuilder/pull/699
[#700]: https://github.com/react-querybuilder/react-querybuilder/pull/700
[#703]: https://github.com/react-querybuilder/react-querybuilder/pull/703
[#706]: https://github.com/react-querybuilder/react-querybuilder/pull/706
[#713]: https://github.com/react-querybuilder/react-querybuilder/pull/713
[#714]: https://github.com/react-querybuilder/react-querybuilder/pull/714
[#716]: https://github.com/react-querybuilder/react-querybuilder/pull/716
[#719]: https://github.com/react-querybuilder/react-querybuilder/issues/719
[#723]: https://github.com/react-querybuilder/react-querybuilder/pull/723
[#727]: https://github.com/react-querybuilder/react-querybuilder/pull/727
[#730]: https://github.com/react-querybuilder/react-querybuilder/pull/730
[#733]: https://github.com/react-querybuilder/react-querybuilder/pull/733
[#734]: https://github.com/react-querybuilder/react-querybuilder/pull/734
[#748]: https://github.com/react-querybuilder/react-querybuilder/pull/748
[#755]: https://github.com/react-querybuilder/react-querybuilder/pull/755
[#769]: https://github.com/react-querybuilder/react-querybuilder/pull/769
[#779]: https://github.com/react-querybuilder/react-querybuilder/pull/779
[#783]: https://github.com/react-querybuilder/react-querybuilder/pull/783
[#785]: https://github.com/react-querybuilder/react-querybuilder/pull/785
[#786]: https://github.com/react-querybuilder/react-querybuilder/pull/786
[#791]: https://github.com/react-querybuilder/react-querybuilder/pull/791
[#796]: https://github.com/react-querybuilder/react-querybuilder/pull/796
[#805]: https://github.com/react-querybuilder/react-querybuilder/pull/805
[#812]: https://github.com/react-querybuilder/react-querybuilder/pull/812
[#814]: https://github.com/react-querybuilder/react-querybuilder/pull/814
[#820]: https://github.com/react-querybuilder/react-querybuilder/pull/820
[#834]: https://github.com/react-querybuilder/react-querybuilder/pull/834
[#836]: https://github.com/react-querybuilder/react-querybuilder/pull/836
[#840]: https://github.com/react-querybuilder/react-querybuilder/pull/840
[#844]: https://github.com/react-querybuilder/react-querybuilder/pull/844
[#845]: https://github.com/react-querybuilder/react-querybuilder/pull/845
[#846]: https://github.com/react-querybuilder/react-querybuilder/pull/846
[#855]: https://github.com/react-querybuilder/react-querybuilder/pull/855
[#858]: https://github.com/react-querybuilder/react-querybuilder/pull/858
[#860]: https://github.com/react-querybuilder/react-querybuilder/pull/860
[#868]: https://github.com/react-querybuilder/react-querybuilder/pull/868
[#873]: https://github.com/react-querybuilder/react-querybuilder/pull/873
[#876]: https://github.com/react-querybuilder/react-querybuilder/pull/876
[#877]: https://github.com/react-querybuilder/react-querybuilder/pull/877
[#883]: https://github.com/react-querybuilder/react-querybuilder/pull/883
[#885]: https://github.com/react-querybuilder/react-querybuilder/pull/885
[#890]: https://github.com/react-querybuilder/react-querybuilder/pull/890
[#891]: https://github.com/react-querybuilder/react-querybuilder/pull/891
[#893]: https://github.com/react-querybuilder/react-querybuilder/pull/893
[#900]: https://github.com/react-querybuilder/react-querybuilder/pull/900
[#903]: https://github.com/react-querybuilder/react-querybuilder/pull/903
[#911]: https://github.com/react-querybuilder/react-querybuilder/pull/911
[#914]: https://github.com/react-querybuilder/react-querybuilder/pull/914
[#916]: https://github.com/react-querybuilder/react-querybuilder/pull/916
[#926]: https://github.com/react-querybuilder/react-querybuilder/pull/926
[#931]: https://github.com/react-querybuilder/react-querybuilder/pull/931
[#932]: https://github.com/react-querybuilder/react-querybuilder/pull/932
[#935]: https://github.com/react-querybuilder/react-querybuilder/pull/935
[#937]: https://github.com/react-querybuilder/react-querybuilder/pull/937
[#942]: https://github.com/react-querybuilder/react-querybuilder/pull/942
[#947]: https://github.com/react-querybuilder/react-querybuilder/pull/947
[#948]: https://github.com/react-querybuilder/react-querybuilder/pull/948
[#950]: https://github.com/react-querybuilder/react-querybuilder/pull/950
[#951]: https://github.com/react-querybuilder/react-querybuilder/pull/951
[#954]: https://github.com/react-querybuilder/react-querybuilder/pull/954
[#957]: https://github.com/react-querybuilder/react-querybuilder/pull/957

<!-- #endregion -->

<!-- #region Release comparison links -->

[unreleased]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.10.0...HEAD
[v8.10.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.9.2...v8.10.0
[v8.9.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.9.1...v8.9.2
[v8.9.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.9.0...v8.9.1
[v8.9.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.8.4...v8.9.0
[v8.8.4]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.8.3...v8.8.4
[v8.8.3]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.8.2...v8.8.3
[v8.8.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.8.1...v8.8.2
[v8.8.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.8.0...v8.8.1
[v8.8.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.7.1...v8.8.0
[v8.7.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.7.0...v8.7.1
[v8.7.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.6.2...v8.7.0
[v8.6.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.6.1...v8.6.2
[v8.6.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.6.0...v8.6.1
[v8.6.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.5.0...v8.6.0
[v8.5.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.4.1...v8.5.0
[v8.4.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.4.0...v8.4.1
[v8.4.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.3.1...v8.4.0
[v8.3.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.3.0...v8.3.1
[v8.3.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.2.0...v8.3.0
[v8.2.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.1.1...v8.2.0
[v8.1.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.1.0...v8.1.1
[v8.1.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v8.0.0...v8.1.0
[v8.0.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.7.1...v8.0.0
[v7.7.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.7.0...v7.7.1
[v7.7.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.6.1...v7.7.0
[v7.6.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.6.0...v7.6.1
[v7.6.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.5.2...v7.6.0
[v7.5.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.5.1...v7.5.2
[v7.5.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.5.0...v7.5.1
[v7.5.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.4.4...v7.5.0
[v7.4.4]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.4.3...v7.4.4
[v7.4.3]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.4.2...v7.4.3
[v7.4.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.4.1...v7.4.2
[v7.4.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.4.0...v7.4.1
[v7.4.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.3.0...v7.4.0
[v7.3.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.2.1...v7.3.0
[v7.2.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.2.0...v7.2.1
[v7.2.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.1.0...v7.2.0
[v7.1.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.0.2...v7.1.0
[v7.0.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.0.1...v7.0.2
[v7.0.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v7.0.0...v7.0.1
[v7.0.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.5.5...v7.0.0
[v6.5.5]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.5.4...v6.5.5
[v6.5.4]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.5.3...v6.5.4
[v6.5.3]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.5.2...v6.5.3
[v6.5.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.5.1...v6.5.2
[v6.5.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.5.0...v6.5.1
[v6.5.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.4.1...v6.5.0
[v6.4.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.4.0...v6.4.1
[v6.4.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.3.0...v6.4.0
[v6.3.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.2.0...v6.3.0
[v6.2.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.1.4...v6.2.0
[v6.1.4]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.1.3...v6.1.4
[v6.1.3]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.1.2...v6.1.3
[v6.1.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.1.0...v6.1.2
[v6.1.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.0.7...v6.1.0
[v6.0.7]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.0.6...v6.0.7
[v6.0.6]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.0.5...v6.0.6
[v6.0.5]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.0.4...v6.0.5
[v6.0.4]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.0.3...v6.0.4
[v6.0.3]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.0.2...v6.0.3
[v6.0.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.0.1...v6.0.2
[v6.0.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v6.0.0...v6.0.1
[v6.0.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v5.4.1...v6.0.0
[v5.4.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v5.4.0...v5.4.1
[v5.4.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v5.3.3...v5.4.0
[v5.3.3]: https://github.com/react-querybuilder/react-querybuilder/compare/v5.3.2...v5.3.3
[v5.3.2]: https://github.com/react-querybuilder/react-querybuilder/compare/v5.3.1...v5.3.2
[v5.3.1]: https://github.com/react-querybuilder/react-querybuilder/compare/v5.3.0...v5.3.1
[v5.3.0]: https://github.com/react-querybuilder/react-querybuilder/compare/v5.2.0...v5.3.0
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

<!-- #endregion -->
