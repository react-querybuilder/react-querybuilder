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

All React exports live in the `/ui` entry point (`@react-querybuilder/expr/ui`); the root entry is framework-agnostic, exporting only rule processors, the validator, the function-metadata and serializer helpers, and types (so it can run server-side).

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

Pass custom function metadata (UI label + arity) via the `functions` prop; it is merged over the built-in `defaultFunctionMeta` (arithmetic `+` `-` `*` `/`, plus `min`, `max`, `mod`, `abs`, `upper`, and `lower`). Serialization for each export format is registered separately on the [export processors](#export).

### Export

`formatQuery` needs an expression-aware rule processor to serialize the `lhs`/`rhs` nodes. The package provides ready-to-use processors bound to the built-in serializers:

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

When using custom functions, pass matching serializers to each format's processor factory (a function present in the UI but missing a serializer for the export format is omitted from that format's output):

```ts
import { getExpressionRuleProcessorSQL } from '@react-querybuilder/expr';

const sqlProcessor = getExpressionRuleProcessorSQL({
  pow: (_opts, base, exp) => `POWER(${base}, ${exp})`,
});

formatQuery(query, { format: 'sql', ruleProcessor: sqlProcessor });
```

`getExpressionRuleProcessorParameterized` and `getExpressionRuleProcessorJsonLogic` cover the other formats; each takes a single serializer registry merged over that format's built-ins.

#### Applying JsonLogic output

Before applying the `jsonlogic` output, register the operators the expressions emit. JsonLogic ships `+` `-` `*` `/` `%`, `min`, and `max` as built-ins, but others like `abs`, `upper`, and `lower` are not. Add them to your JsonLogic instance like so:

```ts
import { add_operation, apply } from 'json-logic-js';
import { jsonLogicExpressionOperators } from '@react-querybuilder/expr';

for (const [op, func] of Object.entries(jsonLogicExpressionOperators)) {
  add_operation(op, func);
}

const logic = formatQuery(query, {
  format: 'jsonlogic',
  ruleProcessor: expressionRuleProcessorJsonLogic,
});
apply(logic, data);
```

### Validation

`createExpressionValidator` returns a `QueryValidator` that flags rules with invalid expressions (unknown function, arity mismatch, empty field reference). Use it as `formatQuery`'s `validator` option or as a `<QueryBuilder validator>` prop:

```ts
import { createExpressionValidator } from '@react-querybuilder/expr';

const validator = createExpressionValidator(functions);
```
