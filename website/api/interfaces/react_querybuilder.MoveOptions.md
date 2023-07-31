---
id: "react_querybuilder.MoveOptions"
title: "Interface: MoveOptions"
sidebar_label: "MoveOptions"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).MoveOptions

## Properties

### clone

 `Optional` **clone**: `boolean`

When `true`, the source rule/group will not be removed from its original path.

#### Defined in

[packages/react-querybuilder/src/utils/queryTools.ts:238](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/queryTools.ts#L238)

___

### combinators

 `Optional` **combinators**: [`OptionList`](../modules/react_querybuilder.md#optionlist)

If the query is of type `RuleGroupTypeIC` (i.e. the query builder used
`independentCombinators`), then the first combinator in this list will be
inserted before the rule/group if necessary.

#### Defined in

[packages/react-querybuilder/src/utils/queryTools.ts:244](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/queryTools.ts#L244)

___

### idGenerator

 `Optional` **idGenerator**: () => `string`

#### Type declaration

(): `string`

ID generator.

##### Returns

`string`

#### Defined in

[packages/react-querybuilder/src/utils/queryTools.ts:248](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/queryTools.ts#L248)
