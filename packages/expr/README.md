## @react-querybuilder/expr

Augments [react-querybuilder](https://npmjs.com/package/react-querybuilder) with arithmetic and function expression support, letting _either side_ of a rule be a computed operand built from fields, literals, and functions—e.g. `(price * quantity) > 100` or `ABS(discount) >= 5`.

To see this in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/demo#enableExpressions=true) with the "expressions" option enabled.

**[Full documentation](https://react-querybuilder.js.org/docs/expr)**

## Installation

```bash
npm i react-querybuilder @react-querybuilder/expr
# OR yarn add / pnpm add / bun add
```

## Usage

All React exports live in the `/ui` entry point (`@react-querybuilder/expr/ui`); the root entry is framework-agnostic, exporting only rule processors, the validator, the function registry helpers, and types (so it can run server-side).

### Components

Wrap your `QueryBuilder` in the `QueryBuilderExpressions` context provider. It overrides the field selector, value-source selector, and value editor to host expressions. Rules without expressions render exactly as before.

```tsx
import { QueryBuilder } from 'react-querybuilder';
import { QueryBuilderExpressions } from '@react-querybuilder/expr/ui';

const App = () => (
  <QueryBuilderExpressions allowFunctionsOnLHS>
    <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
  </QueryBuilderExpressions>
);
```

- **Right-hand side** — add `"expression"` to a field's `valueSources` to offer it in that rule's value-source selector. The expression is stored in `rule.value` (with `valueSource: "expression"`).
- **Left-hand side** — set `allowFunctionsOnLHS` to wrap the rule's `field` in a unary function, stored on `rule.lhs`.

Pass custom functions via the `functions` prop; they are merged over the built-in `defaultFunctions` (the four arithmetic operators plus `abs`).

### Export

`formatQuery` needs an expression-aware rule processor to serialize the `lhs`/`rhs` nodes. The package provides ready-to-use processors bound to `defaultFunctions`:

```ts
import { formatQuery } from 'react-querybuilder';
import {
  expressionRuleProcessorSQL,
  expressionRuleProcessorParameterized,
  expressionRuleProcessorJsonLogic,
} from '@react-querybuilder/expr';

formatQuery(query, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL });
formatQuery(query, {
  format: 'parameterized',
  ruleProcessor: expressionRuleProcessorParameterized,
});
formatQuery(query, { format: 'jsonlogic', ruleProcessor: expressionRuleProcessorJsonLogic });
```

When using custom functions, build matching processors with `createExpressionProcessors`, passing the **same** registry you gave the UI (a function registered only for the UI silently drops out of the export):

```ts
import { createExpressionProcessors } from '@react-querybuilder/expr';

const processors = createExpressionProcessors(functions);

formatQuery(query, { format: 'sql', ruleProcessor: processors.sql });
```

### Validation

`createExpressionValidator` returns a `QueryValidator` that flags rules with invalid expressions (unknown function, arity mismatch, empty field reference). Use it as `formatQuery`'s `validator` option or as a `<QueryBuilder validator>` prop:

```ts
import { createExpressionValidator } from '@react-querybuilder/expr';

const validator = createExpressionValidator(functions);
```
