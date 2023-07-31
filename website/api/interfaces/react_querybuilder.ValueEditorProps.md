---
id: "react_querybuilder.ValueEditorProps"
title: "Interface: ValueEditorProps<F, O>"
sidebar_label: "ValueEditorProps"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).ValueEditorProps

## Type parameters

| Name | Type |
| :------ | :------ |
| `F` | extends [`Field`](react_querybuilder.Field.md) = [`Field`](react_querybuilder.Field.md) |
| `O` | extends `string` = `string` |

## Hierarchy

- [`SelectorOrEditorProps`](react_querybuilder.SelectorOrEditorProps.md)

- [`CommonRuleSubComponentProps`](react_querybuilder.CommonRuleSubComponentProps.md)

  ↳ **`ValueEditorProps`**

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

### field

 **field**: `F`[``"name"``]

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:71](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L71)

___

### fieldData

 **fieldData**: `F`

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:75](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L75)

___

### inputType

 `Optional` **inputType**: ``null`` \| `string`

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:77](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L77)

___

### level

 **level**: `number`

The level of the current group

#### Inherited from

[SelectorOrEditorProps](react_querybuilder.SelectorOrEditorProps.md).[level](react_querybuilder.SelectorOrEditorProps.md#level)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:31](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L31)

___

### listsAsArrays

 `Optional` **listsAsArrays**: `boolean`

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:79](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L79)

___

### operator

 **operator**: `O`

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:72](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L72)

___

### parseNumbers

 `Optional` **parseNumbers**: [`ParseNumbersMethod`](../modules/react_querybuilder.md#parsenumbersmethod)

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:80](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L80)

___

### path

 **path**: `number`[]

Path to this sub-component's Rule or RuleGroup

#### Inherited from

[SelectorOrEditorProps](react_querybuilder.SelectorOrEditorProps.md).[path](react_querybuilder.SelectorOrEditorProps.md#path)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:27](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L27)

___

### rule

 **rule**: [`RuleType`](../modules/react_querybuilder.md#ruletype)

#### Inherited from

[CommonRuleSubComponentProps](react_querybuilder.CommonRuleSubComponentProps.md).[rule](react_querybuilder.CommonRuleSubComponentProps.md#rule)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:64](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L64)

___

### schema

 **schema**: [`Schema`](react_querybuilder.Schema.md)

All subcomponents receive the schema as a prop

#### Inherited from

[SelectorOrEditorProps](react_querybuilder.SelectorOrEditorProps.md).[schema](react_querybuilder.SelectorOrEditorProps.md#schema)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:55](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L55)

___

### selectorComponent

 `Optional` **selectorComponent**: `ComponentType`<[`ValueSelectorProps`](react_querybuilder.ValueSelectorProps.md)<[`Option`](react_querybuilder.Option.md)<`string`\>\>\>

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:82](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L82)

___

### separator

 `Optional` **separator**: `ReactNode`

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:81](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L81)

___

### skipHook

 `Optional` **skipHook**: `boolean`

Only pass `true` if the `useValueEditor` hook has already run
in a wrapper component. See compatibility packages.

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:87](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L87)

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

### type

 `Optional` **type**: [`ValueEditorType`](../modules/react_querybuilder.md#valueeditortype)

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:76](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L76)

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

 `Optional` **value**: `any`

#### Overrides

[SelectorOrEditorProps](react_querybuilder.SelectorOrEditorProps.md).[value](react_querybuilder.SelectorOrEditorProps.md#value)

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:73](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L73)

___

### valueSource

 **valueSource**: [`ValueSource`](../modules/react_querybuilder.md#valuesource)

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:74](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L74)

___

### values

 `Optional` **values**: `any`[]

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:78](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L78)

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
