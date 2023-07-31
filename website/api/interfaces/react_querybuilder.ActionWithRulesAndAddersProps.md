---
id: "react_querybuilder.ActionWithRulesAndAddersProps"
title: "Interface: ActionWithRulesAndAddersProps"
sidebar_label: "ActionWithRulesAndAddersProps"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).ActionWithRulesAndAddersProps

## Hierarchy

- [`ActionWithRulesProps`](react_querybuilder.ActionWithRulesProps.md)

  ↳ **`ActionWithRulesAndAddersProps`**

## Properties

### className

 `Optional` **className**: `string`

CSS classNames to be applied

This is `string` and not `Classname` because the Rule and RuleGroup
components run clsx() to produce the className that gets passed to
each subcomponent.

#### Inherited from

[ActionWithRulesProps](react_querybuilder.ActionWithRulesProps.md).[className](react_querybuilder.ActionWithRulesProps.md#classname)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:23](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L23)

___

### context

 `Optional` **context**: `any`

Container for custom props that are passed to all components

#### Inherited from

[ActionWithRulesProps](react_querybuilder.ActionWithRulesProps.md).[context](react_querybuilder.ActionWithRulesProps.md#context)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:43](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L43)

___

### disabled

 `Optional` **disabled**: `boolean`

Disables the control

#### Inherited from

[ActionWithRulesProps](react_querybuilder.ActionWithRulesProps.md).[disabled](react_querybuilder.ActionWithRulesProps.md#disabled)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:39](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L39)

___

### disabledTranslation

 `Optional` **disabledTranslation**: [`TranslationWithLabel`](react_querybuilder.TranslationWithLabel.md)

#### Inherited from

[ActionWithRulesProps](react_querybuilder.ActionWithRulesProps.md).[disabledTranslation](react_querybuilder.ActionWithRulesProps.md#disabledtranslation)

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:44](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L44)

___

### label

 `Optional` **label**: `string`

#### Inherited from

[ActionWithRulesProps](react_querybuilder.ActionWithRulesProps.md).[label](react_querybuilder.ActionWithRulesProps.md#label)

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:42](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L42)

___

### level

 **level**: `number`

The level of the current group

#### Inherited from

[ActionWithRulesProps](react_querybuilder.ActionWithRulesProps.md).[level](react_querybuilder.ActionWithRulesProps.md#level)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:31](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L31)

___

### path

 **path**: `number`[]

Path to this sub-component's Rule or RuleGroup

#### Inherited from

[ActionWithRulesProps](react_querybuilder.ActionWithRulesProps.md).[path](react_querybuilder.ActionWithRulesProps.md#path)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:27](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L27)

___

### ruleOrGroup

 **ruleOrGroup**: [`RuleType`](../modules/react_querybuilder.md#ruletype) \| [`RuleGroupTypeAny`](../modules/react_querybuilder.md#rulegrouptypeany)

#### Inherited from

[ActionWithRulesProps](react_querybuilder.ActionWithRulesProps.md).[ruleOrGroup](react_querybuilder.ActionWithRulesProps.md#ruleorgroup)

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:45](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L45)

___

### rules

 `Optional` **rules**: [`RuleOrGroupArray`](../modules/react_querybuilder.md#ruleorgrouparray)

Rules already present for this group

#### Inherited from

[ActionWithRulesProps](react_querybuilder.ActionWithRulesProps.md).[rules](react_querybuilder.ActionWithRulesProps.md#rules)

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:52](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L52)

___

### schema

 **schema**: [`Schema`](react_querybuilder.Schema.md)

All subcomponents receive the schema as a prop

#### Inherited from

[ActionWithRulesProps](react_querybuilder.ActionWithRulesProps.md).[schema](react_querybuilder.ActionWithRulesProps.md#schema)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:55](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L55)

___

### testID

 `Optional` **testID**: `string`

Test ID for this component

#### Inherited from

[ActionWithRulesProps](react_querybuilder.ActionWithRulesProps.md).[testID](react_querybuilder.ActionWithRulesProps.md#testid)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:51](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L51)

___

### title

 `Optional` **title**: `string`

The title for this control

#### Inherited from

[ActionWithRulesProps](react_querybuilder.ActionWithRulesProps.md).[title](react_querybuilder.ActionWithRulesProps.md#title)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:35](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L35)

___

### validation

 `Optional` **validation**: `boolean` \| [`ValidationResult`](react_querybuilder.ValidationResult.md)

Validation result of the parent component

#### Inherited from

[ActionWithRulesProps](react_querybuilder.ActionWithRulesProps.md).[validation](react_querybuilder.ActionWithRulesProps.md#validation)

#### Defined in

[packages/react-querybuilder/src/types/props.ts:47](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L47)

## Methods

### handleOnClick

**handleOnClick**(`e`, `context?`): `void`

Triggers the addition of a new rule or group. The second parameter will
be forwarded to the `onAddRule` or `onAddGroup` callback, appropriately.

#### Parameters

| Name | Type |
| :------ | :------ |
| `e` | `MouseEvent`<`Element`, `MouseEvent`\> |
| `context?` | `any` |

#### Returns

`void`

#### Overrides

[ActionWithRulesProps](react_querybuilder.ActionWithRulesProps.md).[handleOnClick](react_querybuilder.ActionWithRulesProps.md#handleonclick)

#### Defined in

[packages/react-querybuilder/src/types/propsUsingReact.ts:60](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/propsUsingReact.ts#L60)
