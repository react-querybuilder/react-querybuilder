---
id: "react_querybuilder.AddOptions"
title: "Interface: AddOptions"
sidebar_label: "AddOptions"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).AddOptions

## Properties

### combinatorPreceding

 `Optional` **combinatorPreceding**: `string`

If the query is of type `RuleGroupTypeIC` (i.e. the query builder used
`independentCombinators`), then this combinator will be inserted before
the new rule/group if the parent group is not empty. This option will
supersede `combinators`.

#### Defined in

[packages/react-querybuilder/src/utils/queryTools.ts:47](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/queryTools.ts#L47)

___

### combinators

 `Optional` **combinators**: [`OptionList`](../modules/react_querybuilder.md#optionlist)

If the query is of type `RuleGroupTypeIC` (i.e. the query builder used
`independentCombinators`), then the first combinator in this list will be
inserted before the new rule/group if the parent group is not empty. This
option is overridden by `combinatorPreceding`.

#### Defined in

[packages/react-querybuilder/src/utils/queryTools.ts:40](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/queryTools.ts#L40)

___

### idGenerator

 `Optional` **idGenerator**: () => `string`

#### Type declaration

(): `string`

ID generator.

##### Returns

`string`

#### Defined in

[packages/react-querybuilder/src/utils/queryTools.ts:51](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/utils/queryTools.ts#L51)
