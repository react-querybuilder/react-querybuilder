---
id: "react_querybuilder.ActionWithRulesProps"
title: "Interface: ActionWithRulesProps"
sidebar_label: "ActionWithRulesProps"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).ActionWithRulesProps

## Hierarchy

- [`ActionProps`](react_querybuilder.ActionProps.md)

  ↳ **`ActionWithRulesProps`**

  ↳↳ [`ActionWithRulesAndAddersProps`](react_querybuilder.ActionWithRulesAndAddersProps.md)

  ↳↳ [`ActionWithRulesAndAddersProps`](react_querybuilder.ActionWithRulesAndAddersProps.md)

## Properties

### className

 `Optional` **className**: `string`

CSS classNames to be applied

This is `string` and not `Classname` because the Rule and RuleGroup
components run clsx() to produce the className that gets passed to
each subcomponent.

#### Inherited from

[ActionProps](react_querybuilder.ActionProps.md).[className](react_querybuilder.ActionProps.md#classname)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:23](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L23)

___

### context

 `Optional` **context**: `any`

Container for custom props that are passed to all components

#### Inherited from

[ActionProps](react_querybuilder.ActionProps.md).[context](react_querybuilder.ActionProps.md#context)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:43](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L43)

___

### disabled

 `Optional` **disabled**: `boolean`

Disables the control

#### Inherited from

[ActionProps](react_querybuilder.ActionProps.md).[disabled](react_querybuilder.ActionProps.md#disabled)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:39](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L39)

___

### disabledTranslation

 `Optional` **disabledTranslation**: [`TranslationWithLabel`](react_querybuilder.TranslationWithLabel.md)

#### Inherited from

[ActionProps](react_querybuilder.ActionProps.md).[disabledTranslation](react_querybuilder.ActionProps.md#disabledtranslation)

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:44](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L44)

___

### label

 `Optional` **label**: `string`

#### Inherited from

[ActionProps](react_querybuilder.ActionProps.md).[label](react_querybuilder.ActionProps.md#label)

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:42](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L42)

___

### level

 **level**: `number`

The level of the current group

#### Inherited from

[ActionProps](react_querybuilder.ActionProps.md).[level](react_querybuilder.ActionProps.md#level)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:31](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L31)

___

### path

 **path**: `number`[]

Path to this sub-component's Rule or RuleGroup

#### Inherited from

[ActionProps](react_querybuilder.ActionProps.md).[path](react_querybuilder.ActionProps.md#path)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:27](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L27)

___

### ruleOrGroup

 **ruleOrGroup**: [`RuleType`](../modules/react_querybuilder.md#ruletype) \| [`RuleGroupTypeAny`](../modules/react_querybuilder.md#rulegrouptypeany)

#### Inherited from

[ActionProps](react_querybuilder.ActionProps.md).[ruleOrGroup](react_querybuilder.ActionProps.md#ruleorgroup)

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:45](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L45)

___

### rules

 `Optional` **rules**: [`RuleOrGroupArray`](../modules/react_querybuilder.md#ruleorgrouparray)

Rules already present for this group

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:52](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L52)

___

### schema

 **schema**: [`Schema`](react_querybuilder.Schema.md)

All subcomponents receive the schema as a prop

#### Inherited from

[ActionProps](react_querybuilder.ActionProps.md).[schema](react_querybuilder.ActionProps.md#schema)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:55](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L55)

___

### testID

 `Optional` **testID**: `string`

Test ID for this component

#### Inherited from

[ActionProps](react_querybuilder.ActionProps.md).[testID](react_querybuilder.ActionProps.md#testid)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:51](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L51)

___

### title

 `Optional` **title**: `string`

The title for this control

#### Inherited from

[ActionProps](react_querybuilder.ActionProps.md).[title](react_querybuilder.ActionProps.md#title)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:35](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L35)

___

### validation

 `Optional` **validation**: `boolean` \| [`ValidationResult`](react_querybuilder.ValidationResult.md)

Validation result of the parent component

#### Inherited from

[ActionProps](react_querybuilder.ActionProps.md).[validation](react_querybuilder.ActionProps.md#validation)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:47](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L47)

## Methods

### handleOnClick

**handleOnClick**(`e`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `e` | `MouseEvent`<`Element`, `MouseEvent`\> |

#### Returns

`void`

#### Inherited from

[ActionProps](react_querybuilder.ActionProps.md).[handleOnClick](react_querybuilder.ActionProps.md#handleonclick)

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:43](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L43)
