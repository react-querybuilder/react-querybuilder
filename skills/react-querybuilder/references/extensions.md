# Extensions

All extensions share the `react-querybuilder` version. Nest their providers **inside** any UI-package wrapper.

## `@react-querybuilder/dnd`: drag-and-drop

Wrap with `QueryBuilderDnD` and pass an adapter. Install only the adapter's library.

```tsx
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import { createPragmaticDndAdapter } from '@react-querybuilder/dnd/pragmatic-dnd';

// Module scope
const dnd = createPragmaticDndAdapter({
  draggable,
  dropTargetForElements,
  monitorForElements,
  combine,
});

<QueryBuilderDnD dnd={dnd}>
  <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
</QueryBuilderDnD>;
```

| Adapter               | Install                                                                   | Create                                                                                                           |
| --------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Pragmatic (Atlassian) | `@atlaskit/pragmatic-drag-and-drop`                                       | `createPragmaticDndAdapter({...})` from `@react-querybuilder/dnd/pragmatic-dnd`                                  |
| dnd-kit               | `@dnd-kit/core`                                                           | `createDndKitAdapter(DndKit)` from `@react-querybuilder/dnd/dnd-kit` (`import * as DndKit from '@dnd-kit/core'`) |
| react-dnd             | `react-dnd`, `react-dnd-html5-backend` (and/or `react-dnd-touch-backend`) | `createReactDnDAdapter({ ...ReactDnD, ...ReactDndHtml5Backend })` from `@react-querybuilder/dnd/react-dnd`       |

- No `dnd` prop: react-dnd + backends are lazy-loaded (they must be installed).
- `QueryBuilderDnD` sets `enableDragAndDrop` implicitly.
- The app already has a react-dnd `DndProvider`: use `QueryBuilderDndWithoutProvider` (otherwise you get the "Cannot have two HTML5 backends" error).
- Custom `dragHandle` with dnd-kit: spread `dragHandleAttributes` onto the ref'd element.
- Modifier keys: Alt = clone, Ctrl = group.

## `@react-querybuilder/datetime`: date-aware export and editors

Pick **one** date library subpath: `/dayjs`, `/date-fns`, `/luxon` (`/jsdate` = native `Date`, discouraged). React components come from `/ui`.

```ts
import { formatQuery } from '@react-querybuilder/core';
import { datetimeRuleProcessorSQL } from '@react-querybuilder/datetime/dayjs';

formatQuery(query, {
  format: 'sql',
  preset: 'postgresql',
  fields,
  ruleProcessor: datetimeRuleProcessorSQL,
});
```

- Rule processors: `datetimeRuleProcessor{SQL, Parameterized, MongoDBQuery, MongoDB, CEL, SpEL, JSONata, NL, Cypher, SPARQL, LDAP, Gremlin, Prisma, Sequelize, Drizzle, ElasticSearch, TanStackDB}`. JsonLogic uses `jsonLogicDateTimeOperations` instead.
- A field is treated as a date if its `datatype` starts with `date`/`datetime`/`datetimeoffset`/`timestamp`. Override with `context.isDateField` (boolean, `(rule, opts) => boolean`, a property-match object, or an array of them).
- Non-date rules fall through to the default processor.
- UI: `QueryBuilderDateTime` from `@react-querybuilder/datetime/ui` enables date pickers and relative dates ("3 months ago") for fields with `inputType: 'date' | 'datetime-local'` or a date-like `datatype`. Relative values are stored as objects, so export them with the datetime processors.

## `@react-querybuilder/expr`: expressions/functions in rules

- Data: `rule.lhs` holds a function-wrapped field (e.g. `lower(firstName)`). `valueSource: 'expression'` makes `value` an expression node. Queries remain `RuleGroupType`.
- UI: `QueryBuilderExpressions` from `@react-querybuilder/expr/ui` (`allowFunctionsOnLHS` prop). Add `'expression'` to a field's `valueSources` (list ≥2 sources so the selector shows).
- Export: **must** use expression-aware processors, e.g. `formatQuery(q, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })`. Default processors ignore `lhs`.
- Parse: `getExpressionParser{SQL, JsonLogic, JSONata, MongoDB, CEL, SpEL}` used with the core parsers' `getExpression` option.
- Root entry (`@react-querybuilder/expr`) is server-safe; React parts are only in `/ui`.

## `@react-querybuilder/rules-engine`: if/else-if/else rule sets

- Each condition = a query + a consequent; `defaultConsequent` = else.
- UI: `<RulesEngineBuilder rulesEngine={re} onRulesEngineChange={setRE} consequentTypes={[...]} queryBuilderProps={{ fields }} />` (or `defaultRulesEngine` for uncontrolled).
- Export: `formatRulesEngine(re, format)` with `'json-rules-engine' | 'node-rules' | 'rulepilot' | 'native'`. `'native'` returns `(facts) => Consequent[]`. Install the target engine package as needed (optional peers).
- Verify prop and type names against the installed package; this package is newer and evolving.
