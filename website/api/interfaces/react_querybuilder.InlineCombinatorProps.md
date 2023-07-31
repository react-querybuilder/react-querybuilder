---
id: "react_querybuilder.InlineCombinatorProps"
title: "Interface: InlineCombinatorProps"
sidebar_label: "InlineCombinatorProps"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).InlineCombinatorProps

## Hierarchy

- [`CombinatorSelectorProps`](react_querybuilder.CombinatorSelectorProps.md)

  ↳ **`InlineCombinatorProps`**

## Properties

### className

 `Optional` **className**: `string`

CSS classNames to be applied

This is `string` and not `Classname` because the Rule and RuleGroup
components run clsx() to produce the className that gets passed to
each subcomponent.

#### Inherited from

[CombinatorSelectorProps](react_querybuilder.CombinatorSelectorProps.md).[className](react_querybuilder.CombinatorSelectorProps.md#classname)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:23](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L23)

___

### component

 **component**: `ComponentType`<[`CombinatorSelectorProps`](react_querybuilder.CombinatorSelectorProps.md)\>

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:64](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L64)

___

### context

 `Optional` **context**: `any`

Container for custom props that are passed to all components

#### Inherited from

[CombinatorSelectorProps](react_querybuilder.CombinatorSelectorProps.md).[context](react_querybuilder.CombinatorSelectorProps.md#context)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:43](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L43)

___

### disabled

 `Optional` **disabled**: `boolean`

Disables the control

#### Inherited from

[CombinatorSelectorProps](react_querybuilder.CombinatorSelectorProps.md).[disabled](react_querybuilder.CombinatorSelectorProps.md#disabled)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:39](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L39)

___

### independentCombinators

 `Optional` **independentCombinators**: `boolean`

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:65](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L65)

___

### level

 **level**: `number`

The level of the current group

#### Inherited from

[CombinatorSelectorProps](react_querybuilder.CombinatorSelectorProps.md).[level](react_querybuilder.CombinatorSelectorProps.md#level)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:31](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L31)

___

### options

 **options**: [`OptionList`](../modules/react_querybuilder.md#optionlist)<[`Combinator`](react_querybuilder.Combinator.md)<`string`\>\>

#### Inherited from

[CombinatorSelectorProps](react_querybuilder.CombinatorSelectorProps.md).[options](react_querybuilder.CombinatorSelectorProps.md#options)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:68](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L68)

___

### path

 **path**: `number`[]

Path to this sub-component's Rule or RuleGroup

#### Inherited from

[CombinatorSelectorProps](react_querybuilder.CombinatorSelectorProps.md).[path](react_querybuilder.CombinatorSelectorProps.md#path)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:27](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L27)

___

### rules

 `Optional` **rules**: [`RuleOrGroupArray`](../modules/react_querybuilder.md#ruleorgrouparray)

#### Inherited from

[CombinatorSelectorProps](react_querybuilder.CombinatorSelectorProps.md).[rules](react_querybuilder.CombinatorSelectorProps.md#rules)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:85](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L85)

___

### schema

 **schema**: [`Schema`](react_querybuilder.Schema.md)

All subcomponents receive the schema as a prop

#### Inherited from

[CombinatorSelectorProps](react_querybuilder.CombinatorSelectorProps.md).[schema](react_querybuilder.CombinatorSelectorProps.md#schema)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:55](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L55)

___

### testID

 `Optional` **testID**: `string`

Test ID for this component

#### Inherited from

[CombinatorSelectorProps](react_querybuilder.CombinatorSelectorProps.md).[testID](react_querybuilder.CombinatorSelectorProps.md#testid)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:51](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L51)

___

### title

 `Optional` **title**: `string`

The title for this control

#### Inherited from

[CombinatorSelectorProps](react_querybuilder.CombinatorSelectorProps.md).[title](react_querybuilder.CombinatorSelectorProps.md#title)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:35](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L35)

___

### validation

 `Optional` **validation**: `boolean` \| [`ValidationResult`](react_querybuilder.ValidationResult.md)

Validation result of the parent component

#### Inherited from

[CombinatorSelectorProps](react_querybuilder.CombinatorSelectorProps.md).[validation](react_querybuilder.CombinatorSelectorProps.md#validation)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:47](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L47)

___

### value

 `Optional` **value**: `string`

#### Inherited from

[CombinatorSelectorProps](react_querybuilder.CombinatorSelectorProps.md).[value](react_querybuilder.CombinatorSelectorProps.md#value)

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

[CombinatorSelectorProps](react_querybuilder.CombinatorSelectorProps.md).[handleOnChange](react_querybuilder.CombinatorSelectorProps.md#handleonchange)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:60](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L60)
