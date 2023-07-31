---
id: "react_querybuilder.BaseSelectorProps"
title: "Interface: BaseSelectorProps<OptType>"
sidebar_label: "BaseSelectorProps"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).BaseSelectorProps

## Type parameters

| Name | Type |
| :------ | :------ |
| `OptType` | extends [`Option`](react_querybuilder.Option.md) = [`Option`](react_querybuilder.Option.md) |

## Hierarchy

- [`SelectorOrEditorProps`](react_querybuilder.SelectorOrEditorProps.md)

  ↳ **`BaseSelectorProps`**

  ↳↳ [`ValueSelectorProps`](react_querybuilder.ValueSelectorProps.md)

  ↳↳ [`CombinatorSelectorProps`](react_querybuilder.CombinatorSelectorProps.md)

  ↳↳ [`FieldSelectorProps`](react_querybuilder.FieldSelectorProps.md)

  ↳↳ [`OperatorSelectorProps`](react_querybuilder.OperatorSelectorProps.md)

  ↳↳ [`ValueSourceSelectorProps`](react_querybuilder.ValueSourceSelectorProps.md)

  ↳↳ [`CombinatorSelectorProps`](react_querybuilder.CombinatorSelectorProps.md)

  ↳↳ [`FieldSelectorProps`](react_querybuilder.FieldSelectorProps.md)

  ↳↳ [`OperatorSelectorProps`](react_querybuilder.OperatorSelectorProps.md)

  ↳↳ [`ValueSelectorProps`](react_querybuilder.ValueSelectorProps.md)

  ↳↳ [`ValueSourceSelectorProps`](react_querybuilder.ValueSourceSelectorProps.md)

## Properties

### className

 `Optional` **className**: `string`

CSS classNames to be applied

This is `string` and not `Classname` because the Rule and RuleGroup
components run clsx() to produce the className that gets passed to
each subcomponent.

#### Inherited from

[SelectorOrEditorProps](react_querybuilder.SelectorOrEditorProps.md).[className](react_querybuilder.SelectorOrEditorProps.md#classname)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:23](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L23)

___

### context

 `Optional` **context**: `any`

Container for custom props that are passed to all components

#### Inherited from

[SelectorOrEditorProps](react_querybuilder.SelectorOrEditorProps.md).[context](react_querybuilder.SelectorOrEditorProps.md#context)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:43](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L43)

___

### disabled

 `Optional` **disabled**: `boolean`

Disables the control

#### Inherited from

[SelectorOrEditorProps](react_querybuilder.SelectorOrEditorProps.md).[disabled](react_querybuilder.SelectorOrEditorProps.md#disabled)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:39](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L39)

___

### level

 **level**: `number`

The level of the current group

#### Inherited from

[SelectorOrEditorProps](react_querybuilder.SelectorOrEditorProps.md).[level](react_querybuilder.SelectorOrEditorProps.md#level)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:31](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L31)

___

### options

 **options**: [`OptionList`](../modules/react_querybuilder.md#optionlist)<`OptType`\>

#### Defined in

[packages/react-querybuilder/src/types/props.ts:68](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L68)

___

### path

 **path**: `number`[]

Path to this sub-component's Rule or RuleGroup

#### Inherited from

[SelectorOrEditorProps](react_querybuilder.SelectorOrEditorProps.md).[path](react_querybuilder.SelectorOrEditorProps.md#path)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:27](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L27)

___

### schema

 **schema**: [`Schema`](react_querybuilder.Schema.md)

All subcomponents receive the schema as a prop

#### Inherited from

[SelectorOrEditorProps](react_querybuilder.SelectorOrEditorProps.md).[schema](react_querybuilder.SelectorOrEditorProps.md#schema)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:55](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L55)

___

### testID

 `Optional` **testID**: `string`

Test ID for this component

#### Inherited from

[SelectorOrEditorProps](react_querybuilder.SelectorOrEditorProps.md).[testID](react_querybuilder.SelectorOrEditorProps.md#testid)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:51](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L51)

___

### title

 `Optional` **title**: `string`

The title for this control

#### Inherited from

[SelectorOrEditorProps](react_querybuilder.SelectorOrEditorProps.md).[title](react_querybuilder.SelectorOrEditorProps.md#title)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:35](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L35)

___

### validation

 `Optional` **validation**: `boolean` \| [`ValidationResult`](react_querybuilder.ValidationResult.md)

Validation result of the parent component

#### Inherited from

[SelectorOrEditorProps](react_querybuilder.SelectorOrEditorProps.md).[validation](react_querybuilder.SelectorOrEditorProps.md#validation)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:47](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L47)

___

### value

 `Optional` **value**: `string`

#### Inherited from

[SelectorOrEditorProps](react_querybuilder.SelectorOrEditorProps.md).[value](react_querybuilder.SelectorOrEditorProps.md#value)

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

[SelectorOrEditorProps](react_querybuilder.SelectorOrEditorProps.md).[handleOnChange](react_querybuilder.SelectorOrEditorProps.md#handleonchange)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:60](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L60)
