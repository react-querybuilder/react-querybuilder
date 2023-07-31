---
id: "react_querybuilder.UpdateOptions"
title: "Interface: UpdateOptions"
sidebar_label: "UpdateOptions"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).UpdateOptions

## Properties

### getRuleDefaultOperator

 `Optional` **getRuleDefaultOperator**: (`field`: `string`) => `string`

#### Type declaration

(`field`): `string`

Determines the default operator name for a given field.

##### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `string` |

##### Returns

`string`

#### Defined in

[packages/react-querybuilder/src/utils/queryTools.ts:104](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/queryTools.ts#L104)

___

### getRuleDefaultValue

 `Optional` **getRuleDefaultValue**: (`rule`: [`RuleType`](../modules/react_querybuilder.md#ruletype)) => `any`

#### Type declaration

(`rule`): `any`

Gets the default value for a given rule, in case the value needs to be reset.

##### Parameters

| Name | Type |
| :------ | :------ |
| `rule` | [`RuleType`](../modules/react_querybuilder.md#ruletype) |

##### Returns

`any`

#### Defined in

[packages/react-querybuilder/src/utils/queryTools.ts:112](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/queryTools.ts#L112)

___

### getValueSources

 `Optional` **getValueSources**: (`field`: `string`, `operator`: `string`) => [`ValueSources`](../modules/react_querybuilder.md#valuesources)

#### Type declaration

(`field`, `operator`): [`ValueSources`](../modules/react_querybuilder.md#valuesources)

Determines the valid value sources for a given field and operator.

##### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `string` |
| `operator` | `string` |

##### Returns

[`ValueSources`](../modules/react_querybuilder.md#valuesources)

#### Defined in

[packages/react-querybuilder/src/utils/queryTools.ts:108](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/queryTools.ts#L108)

___

### resetOnFieldChange

 `Optional` **resetOnFieldChange**: `boolean`

When updating the `field` of a rule, the rule's `operator`, `value`, and `valueSource`
will be reset to their respective defaults. Defaults to `true`.

#### Defined in

[packages/react-querybuilder/src/utils/queryTools.ts:95](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/queryTools.ts#L95)

___

### resetOnOperatorChange

 `Optional` **resetOnOperatorChange**: `boolean`

When updating the `operator` of a rule, the rule's `value` and `valueSource`
will be reset to their respective defaults. Defaults to `false`.

#### Defined in

[packages/react-querybuilder/src/utils/queryTools.ts:100](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/queryTools.ts#L100)
