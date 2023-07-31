---
id: "react_querybuilder.CommonSubComponentProps"
title: "Interface: CommonSubComponentProps"
sidebar_label: "CommonSubComponentProps"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).CommonSubComponentProps

## Hierarchy

- **`CommonSubComponentProps`**

  ↳ [`SelectorOrEditorProps`](react_querybuilder.SelectorOrEditorProps.md)

  ↳ [`NotToggleProps`](react_querybuilder.NotToggleProps.md)

  ↳ [`DragHandleProps`](react_querybuilder.DragHandleProps.md)

  ↳ [`ActionProps`](react_querybuilder.ActionProps.md)

  ↳ [`ActionProps`](react_querybuilder.ActionProps.md)

  ↳ [`DragHandleProps`](react_querybuilder.DragHandleProps.md)

  ↳ [`NotToggleProps`](react_querybuilder.NotToggleProps.md)

  ↳ [`SelectorOrEditorProps`](react_querybuilder.SelectorOrEditorProps.md)

## Properties

### className

 `Optional` **className**: `string`

CSS classNames to be applied

This is `string` and not `Classname` because the Rule and RuleGroup
components run clsx() to produce the className that gets passed to
each subcomponent.

#### Defined in

[packages/react-querybuilder/src/types/props.ts:23](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L23)

___

### context

 `Optional` **context**: `any`

Container for custom props that are passed to all components

#### Defined in

[packages/react-querybuilder/src/types/props.ts:43](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L43)

___

### disabled

 `Optional` **disabled**: `boolean`

Disables the control

#### Defined in

[packages/react-querybuilder/src/types/props.ts:39](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L39)

___

### level

 **level**: `number`

The level of the current group

#### Defined in

[packages/react-querybuilder/src/types/props.ts:31](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L31)

___

### path

 **path**: `number`[]

Path to this sub-component's Rule or RuleGroup

#### Defined in

[packages/react-querybuilder/src/types/props.ts:27](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L27)

___

### schema

 **schema**: [`Schema`](react_querybuilder.Schema.md)

All subcomponents receive the schema as a prop

#### Defined in

[packages/react-querybuilder/src/types/props.ts:55](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L55)

___

### testID

 `Optional` **testID**: `string`

Test ID for this component

#### Defined in

[packages/react-querybuilder/src/types/props.ts:51](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L51)

___

### title

 `Optional` **title**: `string`

The title for this control

#### Defined in

[packages/react-querybuilder/src/types/props.ts:35](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L35)

___

### validation

 `Optional` **validation**: `boolean` \| [`ValidationResult`](react_querybuilder.ValidationResult.md)

Validation result of the parent component

#### Defined in

[packages/react-querybuilder/src/types/props.ts:47](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L47)
