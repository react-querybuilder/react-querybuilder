---
id: "react_querybuilder_native"
title: "Module: @react-querybuilder/native"
sidebar_label: "@react-querybuilder/native"
sidebar_position: 0
custom_edit_url: null
---

## Namespaces

- [NativeActionElement](../namespaces/react_querybuilder_native.NativeActionElement.md)
- [NativeInlineCombinator](../namespaces/react_querybuilder_native.NativeInlineCombinator.md)
- [NativeNotToggle](../namespaces/react_querybuilder_native.NativeNotToggle.md)
- [NativeValueEditor](../namespaces/react_querybuilder_native.NativeValueEditor.md)
- [NativeValueSelector](../namespaces/react_querybuilder_native.NativeValueSelector.md)
- [NativeValueSelectorWeb](../namespaces/react_querybuilder_native.NativeValueSelectorWeb.md)
- [QueryBuilderNative](../namespaces/react_querybuilder_native.QueryBuilderNative.md)
- [RuleGroupNative](../namespaces/react_querybuilder_native.RuleGroupNative.md)
- [RuleNative](../namespaces/react_querybuilder_native.RuleNative.md)

## Interfaces

- [QueryBuilderNativeStyles](../interfaces/react_querybuilder_native.QueryBuilderNativeStyles.md)
- [SchemaNative](../interfaces/react_querybuilder_native.SchemaNative.md)
- [WithSchemaNative](../interfaces/react_querybuilder_native.WithSchemaNative.md)

## Type Aliases

### ActionNativeProps

 **ActionNativeProps**: `ActionProps` & [`WithSchemaNative`](../interfaces/react_querybuilder_native.WithSchemaNative.md)

#### Defined in

[native/src/types.ts:68](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/types.ts#L68)

___

### InlineCombinatorNativeProps

 **InlineCombinatorNativeProps**: `InlineCombinatorProps` & [`WithSchemaNative`](../interfaces/react_querybuilder_native.WithSchemaNative.md)

#### Defined in

[native/src/types.ts:66](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/types.ts#L66)

___

### NotToggleNativeProps

 **NotToggleNativeProps**: `NotToggleProps` & [`WithSchemaNative`](../interfaces/react_querybuilder_native.WithSchemaNative.md)

#### Defined in

[native/src/types.ts:64](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/types.ts#L64)

___

### QueryBuilderNativeProps

 **QueryBuilderNativeProps**<`RG`\>: `QueryBuilderProps`<`RG`\> & `WithOptionalStyles`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RG` | extends `RuleGroupType` \| `RuleGroupTypeIC` = `RuleGroupType` |

#### Defined in

[native/src/types.ts:77](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/types.ts#L77)

___

### QueryBuilderNativeStyleSheets

 **QueryBuilderNativeStyleSheets**: [`WrapEachPropertyInStyleProp`](react_querybuilder_native.md#wrapeachpropertyinstyleprop)<[`QueryBuilderNativeStyles`](../interfaces/react_querybuilder_native.QueryBuilderNativeStyles.md)\>

#### Defined in

[native/src/types.ts:58](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/types.ts#L58)

___

### RuleGroupNativeProps

 **RuleGroupNativeProps**: `RuleGroupProps` & [`WithSchemaNative`](../interfaces/react_querybuilder_native.WithSchemaNative.md)

#### Defined in

[native/src/types.ts:60](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/types.ts#L60)

___

### RuleNativeProps

 **RuleNativeProps**: `RuleProps` & [`WithSchemaNative`](../interfaces/react_querybuilder_native.WithSchemaNative.md)

#### Defined in

[native/src/types.ts:62](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/types.ts#L62)

___

### ValueEditorNativeProps

 **ValueEditorNativeProps**: `ValueEditorProps` & [`WithSchemaNative`](../interfaces/react_querybuilder_native.WithSchemaNative.md) & { `selectorComponent?`: `ComponentType`<[`ValueSelectorNativeProps`](react_querybuilder_native.md#valueselectornativeprops)\>  }

#### Defined in

[native/src/types.ts:72](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/types.ts#L72)

___

### ValueSelectorNativeProps

 **ValueSelectorNativeProps**: `ValueSelectorProps` & [`WithSchemaNative`](../interfaces/react_querybuilder_native.WithSchemaNative.md)

#### Defined in

[native/src/types.ts:70](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/types.ts#L70)

___

### WrapEachPropertyInStyleProp

 **WrapEachPropertyInStyleProp**<`K`\>: { [P in keyof K]?: StyleProp<Required<K\>[P]\> }

#### Type parameters

| Name |
| :------ |
| `K` |

#### Defined in

[native/src/types.ts:17](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/types.ts#L17)

## Variables

### defaultNativeControlElements

 `Const` **defaultNativeControlElements**: `Controls`

#### Defined in

[native/src/components/defaults.ts:13](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/components/defaults.ts#L13)

___

### defaultNativeSelectStyles

 `Const` **defaultNativeSelectStyles**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `option` | `TextStyle` |
| `selector` | `TextStyle` |

#### Defined in

[native/src/styles.ts:5](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/styles.ts#L5)

___

### defaultNativeStyles

 `Const` **defaultNativeStyles**: [`QueryBuilderNativeStyles`](../interfaces/react_querybuilder_native.QueryBuilderNativeStyles.md)

#### Defined in

[native/src/styles.ts:47](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/styles.ts#L47)

___

### defaultNativeWebControlElements

 `Const` **defaultNativeWebControlElements**: `Controls`

#### Defined in

[native/src/components/defaults.ts:35](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/components/defaults.ts#L35)

## Functions

### NativeActionElement

**NativeActionElement**(`«destructured»`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`ActionNativeProps`](react_querybuilder_native.md#actionnativeprops) |

#### Returns

`Element`

#### Defined in

[native/src/components/NativeActionElement.tsx:5](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/components/NativeActionElement.tsx#L5)

___

### NativeInlineCombinator

**NativeInlineCombinator**(`«destructured»`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`InlineCombinatorNativeProps`](react_querybuilder_native.md#inlinecombinatornativeprops) |

#### Returns

`Element`

#### Defined in

[native/src/components/NativeInlineCombinator.tsx:8](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/components/NativeInlineCombinator.tsx#L8)

___

### NativeNotToggle

**NativeNotToggle**(`«destructured»`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`NotToggleNativeProps`](react_querybuilder_native.md#nottogglenativeprops) |

#### Returns

`Element`

#### Defined in

[native/src/components/NativeNotToggle.tsx:7](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/components/NativeNotToggle.tsx#L7)

___

### NativeValueEditor

**NativeValueEditor**(`«destructured»`): ``null`` \| `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`ValueEditorNativeProps`](react_querybuilder_native.md#valueeditornativeprops) |

#### Returns

``null`` \| `Element`

#### Defined in

[native/src/components/NativeValueEditor.tsx:10](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/components/NativeValueEditor.tsx#L10)

___

### NativeValueEditorWeb

**NativeValueEditorWeb**(`props`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`ValueEditorNativeProps`](react_querybuilder_native.md#valueeditornativeprops) |

#### Returns

`Element`

#### Defined in

[native/src/components/NativeValueEditorWeb.tsx:6](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/components/NativeValueEditorWeb.tsx#L6)

___

### NativeValueSelector

**NativeValueSelector**(`«destructured»`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`ValueSelectorNativeProps`](react_querybuilder_native.md#valueselectornativeprops) |

#### Returns

`Element`

#### Defined in

[native/src/components/NativeValueSelector.tsx:8](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/components/NativeValueSelector.tsx#L8)

___

### NativeValueSelectorWeb

**NativeValueSelectorWeb**(`props`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`ValueSelectorNativeProps`](react_querybuilder_native.md#valueselectornativeprops) |

#### Returns

`Element`

#### Defined in

[native/src/components/NativeValueSelectorWeb.tsx:5](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/components/NativeValueSelectorWeb.tsx#L5)

___

### QueryBuilderNative

**QueryBuilderNative**<`RG`\>(`props`): `Element`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `RG` | extends `RuleGroupType` \| `RuleGroupTypeIC` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`QueryBuilderNativeProps`](react_querybuilder_native.md#querybuildernativeprops)<`RG`\> |

#### Returns

`Element`

#### Defined in

[native/src/components/QueryBuilderNative.tsx:17](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/components/QueryBuilderNative.tsx#L17)

___

### RuleGroupNative

**RuleGroupNative**(`props`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`RuleGroupNativeProps`](react_querybuilder_native.md#rulegroupnativeprops) |

#### Returns

`Element`

#### Defined in

[native/src/components/RuleGroupNative.tsx:13](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/components/RuleGroupNative.tsx#L13)

___

### RuleNative

**RuleNative**(`props`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`RuleNativeProps`](react_querybuilder_native.md#rulenativeprops) |

#### Returns

`Element`

#### Defined in

[native/src/components/RuleNative.tsx:8](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/components/RuleNative.tsx#L8)
