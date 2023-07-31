---
id: "react_querybuilder.SelectorOrEditorProps"
title: "Interface: SelectorOrEditorProps"
sidebar_label: "SelectorOrEditorProps"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).SelectorOrEditorProps

## Hierarchy

- [`CommonSubComponentProps`](react_querybuilder.CommonSubComponentProps.md)

  ↳ **`SelectorOrEditorProps`**

  ↳↳ [`BaseSelectorProps`](react_querybuilder.BaseSelectorProps.md)

  ↳↳ [`ValueEditorProps`](react_querybuilder.ValueEditorProps.md)

  ↳↳ [`BaseSelectorProps`](react_querybuilder.BaseSelectorProps.md)

  ↳↳ [`ValueEditorProps`](react_querybuilder.ValueEditorProps.md)

## Properties

### className

 `Optional` **className**: `string`

CSS classNames to be applied

This is `string` and not `Classname` because the Rule and RuleGroup
components run clsx() to produce the className that gets passed to
each subcomponent.

#### Inherited from

[CommonSubComponentProps](react_querybuilder.CommonSubComponentProps.md).[className](react_querybuilder.CommonSubComponentProps.md#classname)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:23](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L23)

___

### context

 `Optional` **context**: `any`

Container for custom props that are passed to all components

#### Inherited from

[CommonSubComponentProps](react_querybuilder.CommonSubComponentProps.md).[context](react_querybuilder.CommonSubComponentProps.md#context)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:43](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L43)

___

### disabled

 `Optional` **disabled**: `boolean`

Disables the control

#### Inherited from

[CommonSubComponentProps](react_querybuilder.CommonSubComponentProps.md).[disabled](react_querybuilder.CommonSubComponentProps.md#disabled)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:39](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L39)

___

### level

 **level**: `number`

The level of the current group

#### Inherited from

[CommonSubComponentProps](react_querybuilder.CommonSubComponentProps.md).[level](react_querybuilder.CommonSubComponentProps.md#level)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:31](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L31)

___

### path

 **path**: `number`[]

Path to this sub-component's Rule or RuleGroup

#### Inherited from

[CommonSubComponentProps](react_querybuilder.CommonSubComponentProps.md).[path](react_querybuilder.CommonSubComponentProps.md#path)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:27](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L27)

___

### schema

 **schema**: [`Schema`](react_querybuilder.Schema.md)

All subcomponents receive the schema as a prop

#### Inherited from

[CommonSubComponentProps](react_querybuilder.CommonSubComponentProps.md).[schema](react_querybuilder.CommonSubComponentProps.md#schema)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:55](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L55)

___

### testID

 `Optional` **testID**: `string`

Test ID for this component

#### Inherited from

[CommonSubComponentProps](react_querybuilder.CommonSubComponentProps.md).[testID](react_querybuilder.CommonSubComponentProps.md#testid)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:51](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L51)

___

### title

 `Optional` **title**: `string`

The title for this control

#### Inherited from

[CommonSubComponentProps](react_querybuilder.CommonSubComponentProps.md).[title](react_querybuilder.CommonSubComponentProps.md#title)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:35](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L35)

___

### validation

 `Optional` **validation**: `boolean` \| [`ValidationResult`](react_querybuilder.ValidationResult.md)

Validation result of the parent component

#### Inherited from

[CommonSubComponentProps](react_querybuilder.CommonSubComponentProps.md).[validation](react_querybuilder.CommonSubComponentProps.md#validation)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:47](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L47)

___

### value

 `Optional` **value**: `string`

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

#### Defined in

[packages/react-querybuilder/src/types/props.ts:60](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L60)
