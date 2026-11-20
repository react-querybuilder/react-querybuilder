# Fields and operators

## Field shape

`Field` requires `name` and `label`. Common optional properties:

| Property          | Purpose                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `operators`       | Allowed operators: names (`['=', 'in']`), option objects, or option groups                                                                                         |
| `defaultOperator` | Operator selected when the field is chosen                                                                                                                         |
| `defaultValue`    | Value set when the field is chosen                                                                                                                                 |
| `valueEditorType` | `'text' \| 'select' \| 'checkbox' \| 'radio' \| 'textarea' \| 'switch' \| 'multiselect' \| null`, or `(operator) => type`                                          |
| `inputType`       | HTML input type for `text` editors (`'number'`, `'date'`, `'datetime-local'`, `'time'`, …), or `'bigint'`                                                          |
| `values`          | Options for `select`/`radio`/`multiselect` (`{ name, label }[]` or option groups)                                                                                  |
| `valueSources`    | `['value']` (default), `['value', 'field']`, … or `(operator) => sources`                                                                                          |
| `comparator`      | Limits `valueSource: 'field'` targets: a property name that must match, `(f, operator, { fieldData }) => boolean`, or `datatypeCategoryComparator`                 |
| `datatype`        | Data type: category (`string`/`number`/`bigint`/`boolean`/`date`/`datetime`/`time`/`enum`/`array`/`object`/`unknown`) or raw DB type (`'VARCHAR(50)'`, normalized) |
| `validator`       | `(rule) => boolean \| { valid, reasons? }` (see [validation](validation.md))                                                                                       |
| `placeholder`     | Text input placeholder                                                                                                                                             |
| `matchModes`      | For array-valued fields (`all`/`some`/`none`/`atLeast`/`atMost`/`exactly`), with `subproperties`                                                                   |
| `className`       | Extra class on rules using this field                                                                                                                              |

`datatype` is an official `Field` property (typed `unknown`; only strings recognized, others ignored; raw DB types normalized to categories by `getDatatypeCategory`, custom mapping via `datatypeMap` option). Used by `inferOperators`, `inferFieldDefaults`, `datatypeCategoryComparator`, `datatypeOperatorValidator`, and `@react-querybuilder/datetime`. `Field` also allows extra arbitrary properties; all show up in custom components as `fieldData`.

```ts
import type { Field } from 'react-querybuilder';

const fields: Field[] = [
  { name: 'firstName', label: 'First name', placeholder: 'Enter first name' },
  { name: 'age', label: 'Age', inputType: 'number', operators: ['=', '!=', '<', '>', 'between'] },
  {
    name: 'status',
    label: 'Status',
    valueEditorType: 'select',
    values: [
      { name: 'active', label: 'Active' },
      { name: 'inactive', label: 'Inactive' },
    ],
    defaultValue: 'active',
  },
  { name: 'isMusician', label: 'Is a musician', valueEditorType: 'checkbox', operators: ['='] },
  { name: 'tags', label: 'Tags', valueEditorType: 'multiselect', values: [/* … */] },
  // Field-to-field: `comparator: 'group'` = only fields with the same `group` value are offered
  {
    name: 'lastName',
    label: 'Last name',
    group: 'name',
    valueSources: ['value', 'field'],
    comparator: 'group',
  },
  { name: 'nickname', label: 'Nickname', group: 'name' },
];
```

## `name` vs `value`

- Options (fields, operators, combinators, values) may use `name` or `value` as the identifier. `FullField`/`FullOption` have both; RQB fills in the missing one internally (`toFullOption`).
- The rule's `field` property stores the field's `name`.

## Three accepted `fields` shapes

```ts
import type { Field, OptionGroup } from 'react-querybuilder';

// 1. Array
const a: Field[] = [{ name: 'firstName', label: 'First name' }];

// 2. Option groups (rendered as <optgroup>)
const b: OptionGroup<Field>[] = [
  { label: 'Person', options: [{ name: 'firstName', label: 'First name' }] },
  { label: 'Address', options: [{ name: 'city', label: 'City' }] },
];

// 3. Object map keyed by name (sorted by label in the UI)
const c: Record<string, Field> = { firstName: { name: 'firstName', label: 'First name' } };
```

## Operators

Default operator names (`defaultOperators`): `=`, `!=`, `<`, `>`, `<=`, `>=`, `contains`, `beginsWith`, `endsWith`, `doesNotContain`, `doesNotBeginWith`, `doesNotEndWith`, `null`, `notNull`, `in`, `notIn`, `between`, `notBetween`.

- `null`/`notNull` are unary: the value is ignored and no value editor renders.
- `in`/`notIn` take a list; `between`/`notBetween` take exactly two values.
- Customize globally with the `operators` prop, per field with `field.operators`, or dynamically with `getOperators(field, { fieldData })` (return `null` to fall back to defaults).
- Narrow operators by datatype: `getOperators={getOperatorsByDatatype()}` (or `(_f, { fieldData }) => inferOperators(fieldData, opts)`). Options: `operators`, `map` (category → op names, merged over `defaultInferOperatorsMap`), `datatypeMap`, `dropUnknownOperators`, `labels` (`true` → `defaultDatatypeOperatorLabels`, e.g. dates "before"/"after"), `warn`. Only default op names filtered; `null`/`notNull` always kept; no hints → no filtering.
- `inferFieldDefaults(field)` fills missing `inputType`/`valueEditorType` from `datatype` (number → `inputType: 'number'`, boolean → checkbox, date/datetime/time → matching `inputType`, enum w/ `values` → select).
- Exporters only know the default operator names. Custom operator names need a custom `ruleProcessor`/`operatorProcessor` in `formatQuery`.

```ts
import { defaultOperators } from 'react-querybuilder';

const operators = defaultOperators.filter(op => ['=', '!=', 'in'].includes(op.name));
```

## Combinators

- `defaultCombinators`: `and`, `or`. `defaultCombinatorsExtended` adds `xor` (only some export formats support `xor`).
- `showCombinatorsBetweenRules` changes only the display. It does **not** make the query `RuleGroupTypeIC`.

## Dynamic per-rule behavior

Prefer field properties. Use prop-level getters when logic depends on the operator or on many fields:

```tsx
<QueryBuilder
  fields={fields}
  getValueEditorType={(_field, operator) => (operator === 'in' ? 'multiselect' : 'text')}
/>
```

A field's own `valueEditorType` takes precedence; `getValueEditorType` only runs for fields that don't set it.

## Performance

- Define `fields`, `operators`, `combinators`, and `controlElements` at module scope or in `useMemo`. New array references every render force recomputation.
- Async option lists: `useAsyncOptionList` from `react-querybuilder/async`, used inside a custom selector or value editor (docs: "Async option lists" tip).
