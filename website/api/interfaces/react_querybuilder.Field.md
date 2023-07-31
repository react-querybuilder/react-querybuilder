---
id: "react_querybuilder.Field"
title: "Interface: Field<FieldName, OperatorName, ValueName, OperatorObj, ValueObj>"
sidebar_label: "Field"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).Field

## Type parameters

| Name | Type |
| :------ | :------ |
| `FieldName` | extends `string` = `string` |
| `OperatorName` | extends `string` = `string` |
| `ValueName` | extends `string` = `string` |
| `OperatorObj` | extends [`Option`](react_querybuilder.Option.md) = [`Option`](react_querybuilder.Option.md)<`OperatorName`\> |
| `ValueObj` | extends [`Option`](react_querybuilder.Option.md) = [`Option`](react_querybuilder.Option.md)<`ValueName`\> |

## Hierarchy

- [`Option`](react_querybuilder.Option.md)<`FieldName`\>

- `HasOptionalClassName`

  ↳ **`Field`**

## Properties

### className

 `Optional` **className**: [`Classname`](../modules/react_querybuilder.md#classname)

#### Inherited from

HasOptionalClassName.className

#### Defined in

[packages/react-querybuilder/src/types/basic.ts:38](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/basic.ts#L38)

___

### comparator

 `Optional` **comparator**: `string` \| (`f`: [`Field`](react_querybuilder.Field.md)<`string`, `string`, `string`, [`Option`](react_querybuilder.Option.md)<`string`\>, [`Option`](react_querybuilder.Option.md)<`string`\>\>, `operator`: `string`) => `boolean`

#### Defined in

[packages/react-querybuilder/src/types/basic.ts:59](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/basic.ts#L59)

___

### defaultOperator

 `Optional` **defaultOperator**: `string`

#### Defined in

[packages/react-querybuilder/src/types/basic.ts:55](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/basic.ts#L55)

___

### defaultValue

 `Optional` **defaultValue**: `any`

#### Defined in

[packages/react-querybuilder/src/types/basic.ts:56](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/basic.ts#L56)

___

### id

 `Optional` **id**: `string`

#### Defined in

[packages/react-querybuilder/src/types/basic.ts:49](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/basic.ts#L49)

___

### inputType

 `Optional` **inputType**: ``null`` \| `string`

#### Defined in

[packages/react-querybuilder/src/types/basic.ts:53](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/basic.ts#L53)

___

### label

 **label**: `string`

#### Inherited from

[Option](react_querybuilder.Option.md).[label](react_querybuilder.Option.md#label)

#### Defined in

[packages/react-querybuilder/src/types/basic.ts:21](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/basic.ts#L21)

___

### name

 **name**: `FieldName`

#### Inherited from

[Option](react_querybuilder.Option.md).[name](react_querybuilder.Option.md#name)

#### Defined in

[packages/react-querybuilder/src/types/basic.ts:20](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/basic.ts#L20)

___

### operators

 `Optional` **operators**: [`OptionList`](../modules/react_querybuilder.md#optionlist)<`OperatorObj`\>

#### Defined in

[packages/react-querybuilder/src/types/basic.ts:50](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/basic.ts#L50)

___

### placeholder

 `Optional` **placeholder**: `string`

#### Defined in

[packages/react-querybuilder/src/types/basic.ts:57](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/basic.ts#L57)

___

### validator

 `Optional` **validator**: [`RuleValidator`](../modules/react_querybuilder.md#rulevalidator)

#### Defined in

[packages/react-querybuilder/src/types/basic.ts:58](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/basic.ts#L58)

___

### valueEditorType

 `Optional` **valueEditorType**: [`ValueEditorType`](../modules/react_querybuilder.md#valueeditortype) \| (`operator`: `string`) => [`ValueEditorType`](../modules/react_querybuilder.md#valueeditortype)

#### Defined in

[packages/react-querybuilder/src/types/basic.ts:51](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/basic.ts#L51)

___

### valueSources

 `Optional` **valueSources**: [`ValueSources`](../modules/react_querybuilder.md#valuesources) \| (`operator`: `string`) => [`ValueSources`](../modules/react_querybuilder.md#valuesources)

#### Defined in

[packages/react-querybuilder/src/types/basic.ts:52](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/basic.ts#L52)

___

### values

 `Optional` **values**: [`OptionList`](../modules/react_querybuilder.md#optionlist)<`ValueObj`\>

#### Defined in

[packages/react-querybuilder/src/types/basic.ts:54](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/basic.ts#L54)
