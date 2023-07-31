---
id: "react_querybuilder.FormatQueryOptions"
title: "Interface: FormatQueryOptions"
sidebar_label: "FormatQueryOptions"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).FormatQueryOptions

## Properties

### fallbackExpression

 `Optional` **fallbackExpression**: `string`

This string will be inserted in place of invalid groups for non-JSON formats.
Defaults to '(1 = 1)' for "sql"/"parameterized"/"parameterized_named",
'$and:[{$expr:true}]' for "mongodb".

#### Defined in

[packages/react-querybuilder/src/types/importExport.ts:64](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/importExport.ts#L64)

___

### fields

 `Optional` **fields**: `Pick`<[`Field`](react_querybuilder.Field.md)<`string`, `string`, `string`, [`Option`](react_querybuilder.Option.md)<`string`\>, [`Option`](react_querybuilder.Option.md)<`string`\>\>, ``"name"`` \| ``"validator"``\> & `Record`<`string`, `any`\>[]

This can be the same Field[] passed to <QueryBuilder />, but really
all you need to provide is the name and validator for each field.

#### Defined in

[packages/react-querybuilder/src/types/importExport.ts:58](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/importExport.ts#L58)

___

### format

 `Optional` **format**: [`ExportFormat`](../modules/react_querybuilder.md#exportformat)

The export format.

#### Defined in

[packages/react-querybuilder/src/types/importExport.ts:22](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/importExport.ts#L22)

___

### paramPrefix

 `Optional` **paramPrefix**: `string`

This string will be placed in front of named parameters (aka bind variables)
when using the "parameterized_named" export format. Default is ":".

#### Defined in

[packages/react-querybuilder/src/types/importExport.ts:69](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/importExport.ts#L69)

___

### parseNumbers

 `Optional` **parseNumbers**: `boolean`

Renders values as either `number`-types or unquoted strings, as
appropriate and when possible. Each `string`-type value is passed
to `parseFloat` to determine if it can be represented as a plain
numeric value.

#### Defined in

[packages/react-querybuilder/src/types/importExport.ts:76](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/importExport.ts#L76)

___

### placeholderFieldName

 `Optional` **placeholderFieldName**: `string`

Any rules where the field is equal to this value will be ignored.

**`Default`**

```ts
'~'
```

#### Defined in

[packages/react-querybuilder/src/types/importExport.ts:82](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/importExport.ts#L82)

___

### placeholderOperatorName

 `Optional` **placeholderOperatorName**: `string`

Any rules where the operator is equal to this value will be ignored.

**`Default`**

```ts
'~'
```

#### Defined in

[packages/react-querybuilder/src/types/importExport.ts:88](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/importExport.ts#L88)

___

### quoteFieldNamesWith

 `Optional` **quoteFieldNamesWith**: `string` \| [`string`, `string`]

In the "sql"/"parameterized"/"parameterized_named" export formats,
field names will be bracketed by this string. If an array of strings
is passed, field names will be preceded by the first element and
succeeded by the second element. A common value for this option is
the backtick ('`').

@default '' // the empty string

@example
formatQuery(query, { format: 'sql', quoteFieldNamesWith: ['[', ']'] })
// `[First name] = 'Steve'`

#### Defined in

[packages/react-querybuilder/src/types/importExport.ts:48](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/importExport.ts#L48)

___

### ruleProcessor

 `Optional` **ruleProcessor**: [`RuleProcessor`](../modules/react_querybuilder.md#ruleprocessor)

This function will be used to process each rule for query language
formats. If not defined, the appropriate `defaultRuleProcessor`
for the format will be used.

#### Defined in

[packages/react-querybuilder/src/types/importExport.ts:34](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/importExport.ts#L34)

___

### validator

 `Optional` **validator**: [`QueryValidator`](../modules/react_querybuilder.md#queryvalidator)

Validator function for the entire query. Can be the same function passed
as `validator` prop to `<QueryBuilder />`.

#### Defined in

[packages/react-querybuilder/src/types/importExport.ts:53](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/importExport.ts#L53)

___

### valueProcessor

 `Optional` **valueProcessor**: [`ValueProcessorLegacy`](../modules/react_querybuilder.md#valueprocessorlegacy) \| [`ValueProcessorByRule`](../modules/react_querybuilder.md#valueprocessorbyrule)

This function will be used to process the `value` from each rule
for query language formats. If not defined, the appropriate
`defaultValueProcessor` for the format will be used.

#### Defined in

[packages/react-querybuilder/src/types/importExport.ts:28](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/importExport.ts#L28)
