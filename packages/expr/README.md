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

`formatQuery` needs an expression-aware rule processor to serialize the `lhs`/`rhs` nodes. The package provides a ready-to-use processor (and a `getExpressionRuleProcessor*` factory) for every export format that can represent computed operands:

```ts
import { formatQuery } from 'react-querybuilder';
import { expressionRuleProcessorSQL } from '@react-querybuilder/expr';

formatQuery(query, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL });
```

#### Supported formats

| `formatQuery` format     | Ready-to-use processor                 | Factory                                   | Extra `context` required                                                   |
| ------------------------ | -------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------- |
| `sql`                    | `expressionRuleProcessorSQL`           | `getExpressionRuleProcessorSQL`           | —                                                                          |
| `parameterized`/`_named` | `expressionRuleProcessorParameterized` | `getExpressionRuleProcessorParameterized` | —                                                                          |
| `jsonlogic`              | `expressionRuleProcessorJsonLogic`     | `getExpressionRuleProcessorJsonLogic`     | — (register operators before applying, see below)                          |
| `cel`                    | `expressionRuleProcessorCEL`           | `getExpressionRuleProcessorCEL`           | —                                                                          |
| `spel`                   | `expressionRuleProcessorSpEL`          | `getExpressionRuleProcessorSpEL`          | —                                                                          |
| `cypher`/`gql`           | `expressionRuleProcessorCypher`        | `getExpressionRuleProcessorCypher`        | —                                                                          |
| `sparql`                 | `expressionRuleProcessorSPARQL`        | `getExpressionRuleProcessorSPARQL`        | —                                                                          |
| `jsonata`                | `expressionRuleProcessorJSONata`       | `getExpressionRuleProcessorJSONata`       | —                                                                          |
| `mongodb_query`          | `expressionRuleProcessorMongoDBQuery`  | `getExpressionRuleProcessorMongoDBQuery`  | —                                                                          |
| `mongodb` _(deprecated)_ | `expressionRuleProcessorMongoDB`       | `getExpressionRuleProcessorMongoDB`       | —                                                                          |
| `elasticsearch`          | `expressionRuleProcessorElasticSearch` | `getExpressionRuleProcessorElasticSearch` | —                                                                          |
| `natural_language`       | `expressionRuleProcessorNL`            | `getExpressionRuleProcessorNL`            | —                                                                          |
| `drizzle`                | `expressionRuleProcessorDrizzle`       | `getExpressionRuleProcessorDrizzle`       | `columns`, `drizzleOperators`                                              |
| `sequelize`              | `expressionRuleProcessorSequelize`     | `getExpressionRuleProcessorSequelize`     | `sequelizeOperators`, `sequelizeWhere`, `sequelizeLiteral`, `sequelizeCol` |
| `tanstack_db`            | `expressionRuleProcessorTanStackDB`    | `getExpressionRuleProcessorTanStackDB`    | `tanStackDbOperators`, `_tanstackDbRefs`, `_tanstackDbPrimaryRef`          |

Expression rules support scalar comparisons (`=`, `!=`, `<`, `<=`, `>`, `>=`), `null`/`notNull`, and `between`/`notBetween` (with expression bounds). Rules without expressions, with an unsupported operator, or missing required `context`, fall back to the stock processor for that format.

> **Note:** string-match operators (`contains`, `beginsWith`, `endsWith`, and their negations) support expression operands—an expression RHS (search term) and/or LHS—for every export format except `tanstack_db`, each using that dialect's native construct. The `tanstack_db` format omits such rules (its `like` needs a static pattern), and `sequelize` omits a string-match rule whose search term is a bare field reference (`valueSource: 'field'`).

The library-backed formats need the same `context` helpers their stock processors need. For example, `drizzle`:

```ts
import { getOperators } from 'drizzle-orm';
import { expressionRuleProcessorDrizzle } from '@react-querybuilder/expr';

const where = formatQuery(query, {
  format: 'drizzle',
  preset: 'sqlite', // resolves min/max to MIN/MAX (else LEAST/GREATEST)
  ruleProcessor: expressionRuleProcessorDrizzle,
  context: { columns, drizzleOperators: getOperators() },
});
```

and `sequelize`:

```ts
import { col, literal, Op, where } from 'sequelize';
import { expressionRuleProcessorSequelize } from '@react-querybuilder/expr';

const whereClause = formatQuery(query, {
  format: 'sequelize',
  preset: 'sqlite',
  ruleProcessor: expressionRuleProcessorSequelize,
  context: {
    sequelizeOperators: Op,
    sequelizeWhere: where,
    sequelizeLiteral: literal,
    sequelizeCol: col,
  },
});
```

#### Custom functions

When using custom functions, pass matching serializers to each format's processor factory (a function present in the UI but missing a serializer for the export format is omitted from that format's output):

```ts
import { getExpressionRuleProcessorSQL } from '@react-querybuilder/expr';

const sqlProcessor = getExpressionRuleProcessorSQL({
  pow: (_opts, base, exp) => `POWER(${base}, ${exp})`,
});

formatQuery(query, { format: 'sql', ruleProcessor: sqlProcessor });
```

Each `getExpressionRuleProcessor*` factory takes a single serializer registry merged over that format's built-ins.

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
