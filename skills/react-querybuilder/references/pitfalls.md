# Pitfalls

Checked against v8 source. Each entry gives the symptom, the cause, and the fix.

## Imports and setup

1. **React in server bundles / "window is not defined"**: server code imported `react-querybuilder`. Use `@react-querybuilder/core`.
2. **`parseSQL` is not exported**: parsers aren't on the package root. Import from subpaths: `@react-querybuilder/core/parseSQL` (or `react-querybuilder/parseSQL`). `parseGQL` lives in `/parseCypher`.
3. **Unstyled / broken layout**: missing `import 'react-querybuilder/dist/query-builder.css'`, or the UI library's CSS/provider (Mantine `styles.css` + `MantineProvider`, Bootstrap CSS + icons, etc.).
4. **Version mismatch errors / duplicate contexts**: all `react-querybuilder` and `@react-querybuilder/*` packages must have the exact same version.
5. **UI package not applied**: wrap `QueryBuilder` with the package's wrapper (`QueryBuilderMantine`, `QueryBuilderMaterial`, …). Don't rebuild `controlElements` manually. `@react-querybuilder/native` is the exception: `QueryBuilderNative` **replaces** `QueryBuilder`.

## State

6. **Warnings / query resets / ignored edits**: mixing `query` and `defaultQuery`, or passing `query` only sometimes. Choose controlled (`query` + `onQueryChange`) or uncontrolled (`defaultQuery`).
7. **Edits not reflected**: mutating `query` in place. Use immutable helpers (`add`, `update`, `remove`, `move`, `insert`, `group`, `ungroup`) or `QueryManager` / `useQueryManager`, then set state.
8. **Lookups by id fail**: hand-built queries have no `id`s. `QueryBuilder` auto-adds ids only when the **root** lacks an `id`. Nested items under an id'd root are left alone. Run `prepareRuleGroup(query)` on hand-built/imported queries if you rely on ids (ValidationMap, `findID`, `update(q, prop, val, id)`). `formatQuery` doesn't need ids.
9. **Input loses focus on every keystroke**: custom component declared inside another component, or passed as an inline arrow (`valueEditor: p => <X {...p} />`). Declare at module scope; pass the reference.
10. **Re-render storms**: `fields`/`operators`/`controlElements` recreated every render. Hoist them or `useMemo`.

## Query shape

11. **`RuleGroupType` vs `RuleGroupTypeIC` mixed**: e.g. adding `combinator` to an IC group, or pushing rules without combinator strings between them. Detect with `isRuleGroupTypeIC`; convert with `convertToIC`/`convertFromIC`/`convertQuery`. `showCombinatorsBetweenRules` is display only; the deprecated `independentCombinators` prop is ignored.
12. **List values**: `in`/`notIn`/`between`/`notBetween`/`multiselect` values are comma strings by default, arrays with `listsAsArrays`. Code reading `rule.value` must handle both (`toArray(value)` helper exists in core). `formatQuery` accepts both.
13. **Numbers exported as strings** (`age > '30'`): text inputs produce strings. Use `parseNumbers` (`'strict-limited'` + `inputType: 'number'` is a safe default) on `QueryBuilder` and/or `formatQuery`.
14. **`fields` shape confusion**: `fields` may be an array, option groups (`{ label, options }[]`), or an object map keyed by name. Options use `name` (or `value`). Rules store the field `name`.

## Export

15. **SQL injection via field/operator/combinator**: `formatQuery` emits operators, combinators, and unquoted field names verbatim in every format, even `parameterized`. `quoteFieldNamesWith`/`preset` escapes quoted field names (v8.25+; verbatim before). Whitelist all three before formatting user-supplied queries (see [server-usage](server-usage.md)).
16. **`(1 = 1)` returned**: the query is empty or entirely invalid, so the fallback **matches everything**. Check for this before running the query, or set `fallbackExpression`.
17. **Rules silently missing from output**: invalid (validator/field validator), placeholder (`'~'`), muted, `in` with empty list, `between` with <2 values, or the format doesn't support the rule (`valueSource: 'field'` in `prisma`/`ldap`, match modes in `sequelize`/`ldap`).
18. **ORM format returns `undefined`**: `sequelize` needs `context: { sequelizeOperators: Op }`; `tanstack_db` needs `context: { tanStackDbOperators }`. `drizzle` returns a **function**, not a SQL object.
19. **Wrong Mongo format**: `mongodb` (string) is deprecated; use `mongodb_query` (object).
20. **`natural_language` used for machine processing**: it's display text only. Persist `json_without_ids` (or the query object) instead.
21. **`parameterized` vs `parameterized_named`**: `params` is an array vs a record. Named keys omit the prefix unless `paramsKeepPrefix: true`. Postgres: `preset: 'postgresql'` (→ `$1`, quoted identifiers).
22. **Custom operators produce garbage**: exporters only know the default operator names. Provide a `ruleProcessor` that handles them and delegates to the format's `defaultRuleProcessor*`, returning the right shape (`{ sql, params }` for parameterized).
23. **Dates/expressions exported wrong**: use `@react-querybuilder/datetime` or `@react-querybuilder/expr` rule processors. The defaults treat dates as strings and ignore `rule.lhs`.

## Validation

24. **Validators "don't work" in `formatQuery`**: pass `fields` (for `field.validator`) and/or `validator`. They never apply to `json`/`json_without_ids`.
25. **`ValidationMap` ignored**: it's keyed by `id`; the query must have ids.
26. **UI doesn't block invalid input**: validation only adds `queryBuilder-invalid` classes and a `validation` prop. Enforce on submit.
27. **Diagnostics `UNDEFINED_FIELD` but rule still exported**: diagnostics don't affect other formats. `UNDEFINED_FIELD` marks the rule invalid in diagnostics output only (v8.25+; informational before), and other formats still export it. Whitelist fields yourself.

## Parsers

28. **`parseSQL` throws**; other parsers return an empty group on bad input. Handle both.
29. **Parser `fields` option leaks unknown fields (pre-v8.25)**: `parseSQL` `in`/`between`, `parseMongoDB` `between` shortcuts, and `parseJsonLogic` `in` kept them; graph parsers (`parseCypher`/`parseGQL`/`parseGremlin`/`parseSPARQL`) ignored `fields`. Fixed in v8.25. On older versions, whitelist after parsing. Graph parsers match names as emitted (`n.age`, `?age`).
30. **Constructs silently dropped**: functions/subqueries/unsupported operators vanish. Compare rule counts or use `getExpression` / `@react-querybuilder/expr`.

## Extensions

31. **Drag-and-drop does nothing**: missing `QueryBuilderDnD` wrapper or adapter library. With an existing react-dnd `DndProvider`, use `QueryBuilderDndWithoutProvider`.
32. **`@react-querybuilder/datetime` / `expr` React imports fail**: React parts are under `/ui` (`@react-querybuilder/datetime/ui`, `@react-querybuilder/expr/ui`).

## Agent-specific

33. **Invented props/options**: e.g. `onChange` (it's `onQueryChange`), `value` (it's `query`), `format: 'postgres'` (use `preset: 'postgresql'`), `parseElasticSearch` (doesn't exist), `formatQuery(q, { listsAsArrays })` (not an option). Verify against the installed `.d.ts` (`QueryBuilderProps`, `FormatQueryOptions`, `ParserCommonOptions`).
