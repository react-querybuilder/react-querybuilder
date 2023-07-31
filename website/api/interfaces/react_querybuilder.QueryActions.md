---
id: "react_querybuilder.QueryActions"
title: "Interface: QueryActions"
sidebar_label: "QueryActions"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).QueryActions

## Methods

### moveRule

**moveRule**(`oldPath`, `newPath`, `clone?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `oldPath` | `number`[] |
| `newPath` | `number`[] |
| `clone?` | `boolean` |

#### Returns

`void`

#### Defined in

[packages/react-querybuilder/src/types/props.ts:211](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L211)

___

### onGroupAdd

**onGroupAdd**(`group`, `parentPath`, `context?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `group` | [`RuleGroupTypeAny`](../modules/react_querybuilder.md#rulegrouptypeany) |
| `parentPath` | `number`[] |
| `context?` | `any` |

#### Returns

`void`

#### Defined in

[packages/react-querybuilder/src/types/props.ts:202](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L202)

___

### onGroupRemove

**onGroupRemove**(`path`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `number`[] |

#### Returns

`void`

#### Defined in

[packages/react-querybuilder/src/types/props.ts:203](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L203)

___

### onPropChange

**onPropChange**(`prop`, `value`, `path`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `prop` | ``"value"`` \| ``"field"`` \| ``"rules"`` \| ``"disabled"`` \| ``"operator"`` \| ``"valueSource"`` \| ``"combinatorPreceding"`` \| ``"combinator"`` \| ``"not"`` |
| `value` | `any` |
| `path` | `number`[] |

#### Returns

`void`

#### Defined in

[packages/react-querybuilder/src/types/props.ts:204](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L204)

___

### onRuleAdd

**onRuleAdd**(`rule`, `parentPath`, `context?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rule` | [`RuleType`](../modules/react_querybuilder.md#ruletype) |
| `parentPath` | `number`[] |
| `context?` | `any` |

#### Returns

`void`

#### Defined in

[packages/react-querybuilder/src/types/props.ts:209](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L209)

___

### onRuleRemove

**onRuleRemove**(`path`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `number`[] |

#### Returns

`void`

#### Defined in

[packages/react-querybuilder/src/types/props.ts:210](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/types/props.ts#L210)
