---
name: react-querybuilder
description: Use when building query/filter UIs with react-querybuilder, or converting/validating queries with @react-querybuilder/core (formatQuery, parseSQL, etc.)
metadata:
  rqb-version: '8'
---

# React Query Builder (v8)

This skill targets **react-querybuilder v8** and its companion packages (`@react-querybuilder/*`, all released in lockstep at the same version). If the installed major version differs, verify every API here against the installed type definitions before using it.

## Check first

1. **Installed version**: read `react-querybuilder` and/or `@react-querybuilder/core` in `package.json` (or `node_modules/<pkg>/package.json`). All `@react-querybuilder/*` packages must share the same version.
2. **UI package**: look for `@react-querybuilder/{antd,bootstrap,bulma,chakra,fluent,mantine,material,native,prime,tremor}` or a shadcn/ui install (`components/query-builder`). Use its wrapper; don't hand-roll `controlElements`.
3. **Query shape**: does the app use `RuleGroupType` (`combinator` on each group) or `RuleGroupTypeIC` (combinator strings between rules, no `combinator` prop)? Search for `RuleGroupTypeIC`, `independentCombinators`, `isRuleGroupTypeIC`. Don't mix them.
4. **Runtime**: browser/React vs server. Server code must import from `@react-querybuilder/core`, never `react-querybuilder`.

Never invent props or options. Verify against the installed `.d.ts`: `QueryBuilderProps` (`react-querybuilder`), `FormatQueryOptions` and `ParserCommonOptions` (`@react-querybuilder/core`).

## MCP server

If the `rqb` MCP server (`@react-querybuilder/mcp`) is available, use its tools instead of hand-writing conversions or guessing output. They run the real library code:

| Tool               | Use for                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------- |
| `convert_query`    | One-step conversion (e.g. SQL → MongoDB); also returns the intermediate RQB query       |
| `format_query`     | RQB query → any `formatQuery` format; `natural_language` to explain a query             |
| `parse_query`      | SQL/CEL/MongoDB/JsonLogic/SpEL/JSONata/Cypher/GQL/Gremlin/SPARQL → RQB query            |
| `validate_query`   | Check a query against `fields` (shape, operators, value arity/types)                    |
| `get_query_schema` | JSON Schema for valid queries (`getQueryJsonSchema`)                                    |
| `search_docs`      | Search docs matching the server's version; follow up with `get_doc` (page or `#anchor`) |

- Pass `fields` whenever you have them; they make parsing, formatting, and validation more accurate. Only the JSON-serializable subset of `Field` works (no `validator` or other functions).
- ORM formats (`drizzle`, `prisma`, `sequelize`, `tanstack_db`) aren't available over MCP. See [export-formats](references/export-formats.md).
- Resources: `rqb://docs/{slug}`, `rqb://types/{name}` (e.g. `RuleGroupType`, `FormatQueryOptions`, `QueryBuilderProps`).
- Not configured? Suggest adding it (e.g. `claude mcp add rqb -- npx -y @react-querybuilder/mcp`). Setup for other clients: https://react-querybuilder.js.org/docs/ai

## Decision tree

| Need                                                    | Read                                                                   |
| ------------------------------------------------------- | ---------------------------------------------------------------------- |
| Render a query builder UI                               | [setup](references/setup.md), [ui-packages](references/ui-packages.md) |
| Configure fields, operators, combinators, option groups | [fields-and-operators](references/fields-and-operators.md)             |
| Custom/third-party value inputs                         | [value-editors](references/value-editors.md)                           |
| Send a query to a DB/API (SQL, Mongo, ORM, CEL, …)      | [export-formats](references/export-formats.md)                         |
| Load existing filters (SQL, Mongo, JsonLogic, …)        | [import-parsers](references/import-parsers.md)                         |
| Server-only (API route, worker, CLI)                    | [server-usage](references/server-usage.md)                             |
| JSON Schema for LLM output/tool inputs, checking it     | [server-usage](references/server-usage.md)                             |
| Validate rules / skip invalid rules on export           | [validation](references/validation.md)                                 |
| Typing fields, generics, `RuleGroupType` vs IC          | [typescript](references/typescript.md)                                 |
| Drag-and-drop, dates, expressions, rules engine         | [extensions](references/extensions.md)                                 |
| Anything misbehaving                                    | [pitfalls](references/pitfalls.md)                                     |

## Canonical example

```tsx
import { useState } from 'react';
import { QueryBuilder, formatQuery } from 'react-querybuilder';
import type { Field, RuleGroupType } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

// Module scope: stable references, no re-render churn
const fields: Field[] = [
  { name: 'firstName', label: 'First name' },
  { name: 'age', label: 'Age', inputType: 'number' },
];

export const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });
  return (
    <>
      <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
      <pre>{formatQuery(query, { format: 'parameterized', fields, parseNumbers: true }).sql}</pre>
    </>
  );
};
```

## Top pitfalls

Full list: [pitfalls](references/pitfalls.md).

1. **Server imports**: `react-querybuilder` pulls in React. On the server use `@react-querybuilder/core`, and parsers via subpaths (`@react-querybuilder/core/parseSQL`). Parsers are **not** exported from the package root.
2. **Missing CSS**: `import 'react-querybuilder/dist/query-builder.css'` (plus the UI library's own CSS/provider).
3. **Controlled vs uncontrolled**: pass `query` + `onQueryChange` (controlled) **or** `defaultQuery` (uncontrolled), never both. Once controlled, always pass `query`.
4. **Components declared inside components** (or inline arrows in `controlElements`) remount every render and lose input focus. Declare custom components at module scope and pass the reference: `controlElements={{ valueEditor: MyEditor }}`.
5. **Mixing `RuleGroupType` and `RuleGroupTypeIC`**: detect with `isRuleGroupTypeIC`, convert with `convertToIC`/`convertFromIC`/`convertQuery`.
6. **Mutating `query`**: always produce a new object. Use `add`/`update`/`remove`/`move`/`insert`/`group` from core (immutable) or `QueryManager`.
7. **ORM formats need extra context**: `sequelize` needs `context.sequelizeOperators` (`Op`), `tanstack_db` needs `context.tanStackDbOperators`; `drizzle` returns a function. Without it they return `undefined`.
8. **Validation only applies when given**: `formatQuery` skips invalid rules only if you pass `validator` and/or `fields` (with per-field `validator`). It never validates `json`/`json_without_ids` output.

## Docs

- Full docs: https://react-querybuilder.js.org/docs/intro
- LLM-friendly docs: https://react-querybuilder.js.org/llms.txt
- Exact output of every format/parser: https://react-querybuilder.js.org/docs/tips/recipes.md
- Condensed API index (every export): https://react-querybuilder.js.org/llms-api.txt
