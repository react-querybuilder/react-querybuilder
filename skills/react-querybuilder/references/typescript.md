# TypeScript

## Core types

| Type               | Shape                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| `RuleType`         | `{ field, operator, value, valueSource?, id?, path?, disabled?, muted?, match?, lhs?, meta? }`       |
| `RuleGroupType`    | `{ combinator, rules: (RuleType \| RuleGroupType)[], not?, id?, disabled?, muted? }`                 |
| `RuleGroupTypeIC`  | `{ rules: [rule/group, combinator string, rule/group, …], not?, id? }`: **no** `combinator` property |
| `RuleGroupTypeAny` | `RuleGroupType \| RuleGroupTypeIC`                                                                   |
| `Field`            | `name` + `label` required; extra properties allowed                                                  |
| `FullField`        | `Field` with both `name` and `value` set (what RQB passes to callbacks as `fieldData`)               |
| `Path`             | `number[]`: indexes from the root (`[]` = root, `[0, 2]` = 3rd item of 1st group)                    |

Import types with `import type`. Use `@react-querybuilder/core` on the server; in React code everything is re-exported from `react-querybuilder`.

```ts
import type { Field, RuleGroupType, RuleGroupTypeIC, RuleType } from 'react-querybuilder';
```

## `RuleGroupType` vs `RuleGroupTypeIC`

```ts
const standard: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'a', operator: '=', value: 1 },
    { field: 'b', operator: '=', value: 2 },
  ],
};

const ic: RuleGroupTypeIC = {
  rules: [{ field: 'a', operator: '=', value: 1 }, 'and', { field: 'b', operator: '=', value: 2 }],
};
```

- `QueryBuilder` infers IC mode from the query shape. The deprecated `independentCombinators` prop is ignored.
- Detect with `isRuleGroupTypeIC(q)` / `isRuleGroupType(q)`. Convert with `convertToIC`, `convertFromIC`, or `convertQuery` (toggles).
- Parsers return IC only with `independentCombinators: true`.
- In IC arrays, rules/groups sit at even indexes and combinator strings at odd indexes.

## Narrowing with generics

`Field<FieldName, OperatorName, ValueName>` and `RuleType<FieldName, OperatorName, Value>` accept string-literal generics:

```ts
import type { Field, RuleGroupType, RuleType } from 'react-querybuilder';

type FieldName = 'firstName' | 'age';
type Op = '=' | '!=' | '>' | '<';

const fields: Field<FieldName, Op>[] = [
  { name: 'firstName', label: 'First name', operators: ['=', '!='] },
  { name: 'age', label: 'Age', inputType: 'number', operators: ['=', '>', '<'] },
];

type MyRule = RuleType<FieldName, Op>;
type MyQuery = RuleGroupType<MyRule>;

const q: MyQuery = { combinator: 'and', rules: [{ field: 'age', operator: '>', value: 21 }] };
```

- Use `satisfies Field[]` to keep literal types while checking shape.
- `toFullOption(field)` / `toFullOptionList(fields)` fill in `value` from `name` (or the reverse), producing `FullField`s.
- Callback props (`getOperators`, `getValueEditorType`, …) receive `{ fieldData }` typed as `FullField`.

## Key types to look up (don't guess)

- `QueryBuilderProps`: every `QueryBuilder` prop.
- `ControlElementsProp`: valid `controlElements` keys.
- `ValueEditorProps`, `ValueSelectorProps`, `ActionProps`, `RuleProps`, `RuleGroupProps`: custom component props.
- `FormatQueryOptions`, `ExportFormat`: `formatQuery`.
- `ParserCommonOptions`: parsers.
- `Translations`: UI text.
