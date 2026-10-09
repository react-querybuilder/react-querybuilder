# Validation

## Types

```ts
type ValidationResult = { valid: boolean; reasons?: unknown[] };
type ValidationMap = Record<string /* rule/group id */, boolean | ValidationResult>;
type QueryValidator = (query: RuleGroupTypeAny) => boolean | ValidationMap;
type RuleValidator = (rule: RuleType) => boolean | ValidationResult;
```

## Two levels

| Level | Where                                                                    | Signature        |
| ----- | ------------------------------------------------------------------------ | ---------------- |
| Field | `fields[i].validator`                                                    | `RuleValidator`  |
| Query | `validator` prop on `QueryBuilder` / `validator` option on `formatQuery` | `QueryValidator` |

- A query validator returning `false` means the whole query is invalid. Returning a `ValidationMap` marks individual rules/groups **by `id`**, so the query needs ids (`prepareRuleGroup`/`generateIDs`).
- Precedence per rule: muted → invalid; else a `ValidationMap` entry for the id wins; else the field's `validator`; else valid.
- `defaultValidator` (exported) checks **groups only**: empty groups, IC alternation, and invalid combinators. Use it as a query validator or a starting point.

```ts
import type { Field } from 'react-querybuilder';

const fields: Field[] = [
  {
    name: 'age',
    label: 'Age',
    inputType: 'number',
    validator: ({ value }) => Number.isInteger(Number(value)) && Number(value) >= 0,
  },
  {
    name: 'email',
    label: 'Email',
    validator: r => ({ valid: /\S+@\S+/.test(r.value), reasons: ['Invalid email'] }),
  },
];
```

## In the UI

- Results add `queryBuilder-valid` / `queryBuilder-invalid` classes to rules/groups and pass a `validation` prop to subcomponents. They **do not block** edits.
- Style `.queryBuilder-invalid` or read `props.validation` in custom components to show errors.

## In `formatQuery`

```ts
formatQuery(query, { format: 'parameterized', fields, validator: defaultValidator });
```

- Validation only runs if you pass `fields` (for field validators) and/or `validator`. Without them, only automatic checks apply.
- Automatic checks (all formats except `json`/`json_without_ids`): `in`/`notIn` need a non-empty list; `between`/`notBetween` need 2 values; placeholder field/operator (`'~'`) rules are dropped; muted rules/groups are dropped.
- Invalid rules/groups are **dropped**; a validator returning `false` yields the format's fallback (e.g. `(1 = 1)` for SQL, which **matches everything**). On a server, check validity explicitly and reject instead of trusting the fallback.
- `fields` does not reject unknown field names in `formatQuery`. See [server-usage](server-usage.md).

## Diagnostics

`formatQuery(query, { format: 'diagnostics', fields, validator })` returns `{ query, diagnostics, stats, fieldSummary }`:

- `diagnostics`: `{ id, path, code, message, source }[]`. Codes: `MUTED`, `PLACEHOLDER_FIELD`, `PLACEHOLDER_OPERATOR`, `PLACEHOLDER_VALUE`, `CUSTOM_VALIDATOR`, `UNDEFINED_FIELD`, `UNREFERENCED_FIELD`, `VALUE_TYPE_MISMATCH`.
- `stats`: rule/group counts, valid/invalid.
- `UNDEFINED_FIELD` (only with `fields`) marks the rule invalid (`valid: false`, counted in `stats.invalidRules`, invalidates ancestor groups) as of v8.25; before that it was informational. `VALUE_TYPE_MISMATCH` is informational and is skipped for `valueSource: 'field'` rules (v8.25+).
- Diagnostics never change other formats' output: an unknown field still exports. Check codes yourself.

```ts
const { diagnostics } = formatQuery(query, { format: 'diagnostics', fields });
const unknown = diagnostics.filter(d => d.code === 'UNDEFINED_FIELD');
```
