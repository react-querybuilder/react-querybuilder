---
id: "react_querybuilder.ParseJsonLogicOptions"
title: "Interface: ParseJsonLogicOptions"
sidebar_label: "ParseJsonLogicOptions"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).ParseJsonLogicOptions

## Hierarchy

- `ParserCommonOptions`

  ↳ **`ParseJsonLogicOptions`**

## Properties

### fields

 `Optional` **fields**: [`OptionList`](../modules/react_querybuilder.md#optionlist)<[`Field`](react_querybuilder.Field.md)<`string`, `string`, `string`, [`Option`](react_querybuilder.Option.md)<`string`\>, [`Option`](react_querybuilder.Option.md)<`string`\>\>\> \| `Record`<`string`, [`Field`](react_querybuilder.Field.md)<`string`, `string`, `string`, [`Option`](react_querybuilder.Option.md)<`string`\>, [`Option`](react_querybuilder.Option.md)<`string`\>\>\>

#### Inherited from

ParserCommonOptions.fields

#### Defined in

[packages/react-querybuilder/src/types/importExport.ts:132](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/importExport.ts#L132)

___

### getValueSources

 `Optional` **getValueSources**: (`field`: `string`, `operator`: `string`) => [`ValueSources`](../modules/react_querybuilder.md#valuesources)

#### Type declaration

(`field`, `operator`): [`ValueSources`](../modules/react_querybuilder.md#valuesources)

##### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `string` |
| `operator` | `string` |

##### Returns

[`ValueSources`](../modules/react_querybuilder.md#valuesources)

#### Inherited from

ParserCommonOptions.getValueSources

#### Defined in

[packages/react-querybuilder/src/types/importExport.ts:133](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/importExport.ts#L133)

___

### independentCombinators

 `Optional` **independentCombinators**: `boolean`

#### Inherited from

ParserCommonOptions.independentCombinators

#### Defined in

[packages/react-querybuilder/src/types/importExport.ts:135](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/importExport.ts#L135)

___

### jsonLogicOperations

 `Optional` **jsonLogicOperations**: `Record`<`string`, (`value`: `any`) => [`RuleType`](../modules/react_querybuilder.md#ruletype) \| [`RuleGroupTypeAny`](../modules/react_querybuilder.md#rulegrouptypeany)\>

#### Defined in

[packages/react-querybuilder/src/types/importExport.ts:146](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/importExport.ts#L146)

___

### listsAsArrays

 `Optional` **listsAsArrays**: `boolean`

#### Inherited from

ParserCommonOptions.listsAsArrays

#### Defined in

[packages/react-querybuilder/src/types/importExport.ts:134](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/importExport.ts#L134)
