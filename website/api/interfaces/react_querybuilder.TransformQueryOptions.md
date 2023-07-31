---
id: "react_querybuilder.TransformQueryOptions"
title: "Interface: TransformQueryOptions<RG>"
sidebar_label: "TransformQueryOptions"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).TransformQueryOptions

## Type parameters

| Name | Type |
| :------ | :------ |
| `RG` | extends [`RuleGroupTypeAny`](../modules/react_querybuilder.md#rulegrouptypeany) = [`RuleGroupType`](../modules/react_querybuilder.md#rulegrouptype) |

## Properties

### combinatorMap

 `Optional` **combinatorMap**: `Record`<`string`, `string`\>

Any combinator values (including independent combinators) will be translated
from the key in this object to the value.

**`Default Value`**

`{}`

**`Example`**

```
  transformQuery(
    { combinator: 'and', rules: [] },
    { combinatorMap: { and: '&&', or: '||' } }
  )
  // Returns: { combinator: '&&', rules: [] }
```

#### Defined in

[packages/react-querybuilder/src/utils/transformQuery.ts:75](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/transformQuery.ts#L75)

___

### deleteRemappedProperties

 `Optional` **deleteRemappedProperties**: `boolean`

Original properties remapped according to the `propertyMap` option will be removed.

**`Default Value`**

`true`

**`Example`**

```
  transformQuery(
    { combinator: 'and', rules: [] },
    { propertyMap: { combinator: 'AndOr' }, deleteRemappedProperties: false }
  )
  // Returns: { combinator: 'and', AndOr: 'and', rules: [] }
```

#### Defined in

[packages/react-querybuilder/src/utils/transformQuery.ts:109](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/transformQuery.ts#L109)

___

### operatorMap

 `Optional` **operatorMap**: `Record`<`string`, `string`\>

Any operator values will be translated from the key in this object to the value.

**`Default Value`**

`{}`

**`Example`**

```
  transformQuery(
    { combinator: 'and', rules: [{ field: 'name', operator: '=', value: 'Steve Vai' }] },
    { operatorMap: { '=': 'is' } }
  )
  // Returns:
  // {
  //   combinator: 'and',
  //   rules: [{ field: 'name', operator: 'is', value: 'Steve Vai' }]
  // }
```

#### Defined in

[packages/react-querybuilder/src/utils/transformQuery.ts:94](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/transformQuery.ts#L94)

___

### propertyMap

 `Optional` **propertyMap**: `Record`<`string`, `string`\>

For each rule and group in the query, any properties matching a key
in this object will be renamed to the corresponding value. To retain both
the new _and_ the original properties, set `deleteRemappedProperties`
to `false`.

**`Default Value`**

`{}`

**`Example`**

```
  transformQuery(
    { combinator: 'and', rules: [] },
    { propertyMap: { combinator: 'AndOr' } }
  )
  // Returns: { AndOr: 'and', rules: [] }
```

#### Defined in

[packages/react-querybuilder/src/utils/transformQuery.ts:59](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/transformQuery.ts#L59)

___

### ruleGroupProcessor

 `Optional` **ruleGroupProcessor**: (`ruleGroup`: `RG`) => `Record`<`string`, `any`\>

#### Type declaration

(`ruleGroup`): `Record`<`string`, `any`\>

When a group is encountered in the hierarchy, it will be replaced
with the result of this function. Note that the `rules` property from
the original group will be processed as normal and reapplied to the
new group object.

##### Parameters

| Name | Type |
| :------ | :------ |
| `ruleGroup` | `RG` |

##### Returns

`Record`<`string`, `any`\>

**`Default Value`**

`rg => rg`

#### Defined in

[packages/react-querybuilder/src/utils/transformQuery.ts:41](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/transformQuery.ts#L41)

___

### ruleProcessor

 `Optional` **ruleProcessor**: (`rule`: [`RuleType`](../modules/react_querybuilder.md#ruletype)) => `any`

#### Type declaration

(`rule`): `any`

When a rule is encountered in the hierarchy, it will be replaced
with the result of this function.

##### Parameters

| Name | Type |
| :------ | :------ |
| `rule` | [`RuleType`](../modules/react_querybuilder.md#ruletype) |

##### Returns

`any`

**`Default Value`**

`r => r`

#### Defined in

[packages/react-querybuilder/src/utils/transformQuery.ts:32](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/transformQuery.ts#L32)
