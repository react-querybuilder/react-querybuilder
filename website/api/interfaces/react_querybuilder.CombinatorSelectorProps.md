---
id: "react_querybuilder.CombinatorSelectorProps"
title: "Interface: CombinatorSelectorProps"
sidebar_label: "CombinatorSelectorProps"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).CombinatorSelectorProps

## Hierarchy

- [`BaseSelectorProps`](react_querybuilder.BaseSelectorProps.md)<[`Combinator`](react_querybuilder.Combinator.md)\>

  ↳ **`CombinatorSelectorProps`**

  ↳↳ [`InlineCombinatorProps`](react_querybuilder.InlineCombinatorProps.md)

  ↳↳ [`InlineCombinatorProps`](react_querybuilder.InlineCombinatorProps.md)

## Properties

### className

 `Optional` **className**: `string`

CSS classNames to be applied

This is `string` and not `Classname` because the Rule and RuleGroup
components run clsx() to produce the className that gets passed to
each subcomponent.

#### Inherited from

[BaseSelectorProps](react_querybuilder.BaseSelectorProps.md).[className](react_querybuilder.BaseSelectorProps.md#classname)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:23](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L23)

___

### context

 `Optional` **context**: `any`

Container for custom props that are passed to all components

#### Inherited from

[BaseSelectorProps](react_querybuilder.BaseSelectorProps.md).[context](react_querybuilder.BaseSelectorProps.md#context)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:43](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L43)

___

### disabled

 `Optional` **disabled**: `boolean`

Disables the control

#### Inherited from

[BaseSelectorProps](react_querybuilder.BaseSelectorProps.md).[disabled](react_querybuilder.BaseSelectorProps.md#disabled)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:39](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L39)

___

### level

 **level**: `number`

The level of the current group

#### Inherited from

[BaseSelectorProps](react_querybuilder.BaseSelectorProps.md).[level](react_querybuilder.BaseSelectorProps.md#level)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:31](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L31)

___

### options

 **options**: [`OptionList`](../modules/react_querybuilder.md#optionlist)<[`Combinator`](react_querybuilder.Combinator.md)<`string`\>\>

#### Inherited from

[BaseSelectorProps](react_querybuilder.BaseSelectorProps.md).[options](react_querybuilder.BaseSelectorProps.md#options)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:68](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L68)

___

### path

 **path**: `number`[]

Path to this sub-component's Rule or RuleGroup

#### Inherited from

[BaseSelectorProps](react_querybuilder.BaseSelectorProps.md).[path](react_querybuilder.BaseSelectorProps.md#path)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:27](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L27)

___

### rules

 `Optional` **rules**: [`RuleOrGroupArray`](../modules/react_querybuilder.md#ruleorgrouparray)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:85](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L85)

___

### schema

 **schema**: [`Schema`](react_querybuilder.Schema.md)

All subcomponents receive the schema as a prop

#### Inherited from

[BaseSelectorProps](react_querybuilder.BaseSelectorProps.md).[schema](react_querybuilder.BaseSelectorProps.md#schema)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:55](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L55)

___

### testID

 `Optional` **testID**: `string`

Test ID for this component

#### Inherited from

[BaseSelectorProps](react_querybuilder.BaseSelectorProps.md).[testID](react_querybuilder.BaseSelectorProps.md#testid)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:51](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L51)

___

### title

 `Optional` **title**: `string`

The title for this control

#### Inherited from

[BaseSelectorProps](react_querybuilder.BaseSelectorProps.md).[title](react_querybuilder.BaseSelectorProps.md#title)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:35](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L35)

___

### validation

 `Optional` **validation**: `boolean` \| [`ValidationResult`](react_querybuilder.ValidationResult.md)

Validation result of the parent component

#### Inherited from

[BaseSelectorProps](react_querybuilder.BaseSelectorProps.md).[validation](react_querybuilder.BaseSelectorProps.md#validation)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:47](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L47)

___

### value

 `Optional` **value**: `string`

#### Inherited from

[BaseSelectorProps](react_querybuilder.BaseSelectorProps.md).[value](react_querybuilder.BaseSelectorProps.md#value)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:59](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L59)

## Methods

### handleOnChange

**handleOnChange**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `any` |

#### Returns

`void`

#### Inherited from

[BaseSelectorProps](react_querybuilder.BaseSelectorProps.md).[handleOnChange](react_querybuilder.BaseSelectorProps.md#handleonchange)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:60](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L60)
