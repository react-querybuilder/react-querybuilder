---
id: "react_querybuilder_native.SchemaNative"
title: "Interface: SchemaNative"
sidebar_label: "SchemaNative"
custom_edit_url: null
---

[@react-querybuilder/native](../modules/react_querybuilder_native.md).SchemaNative

## Hierarchy

- `Schema`

- `WithOptionalStyleSheets`

  ↳ **`SchemaNative`**

## Properties

### addRuleToNewGroups

 **addRuleToNewGroups**: `boolean`

#### Inherited from

Schema.addRuleToNewGroups

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:437

___

### autoSelectField

 **autoSelectField**: `boolean`

#### Inherited from

Schema.autoSelectField

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:435

___

### autoSelectOperator

 **autoSelectOperator**: `boolean`

#### Inherited from

Schema.autoSelectOperator

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:436

___

### classNames

 **classNames**: `Classnames`

#### Inherited from

Schema.classNames

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:416

___

### combinators

 **combinators**: `OptionList`<`Combinator`<`string`\>\>

#### Inherited from

Schema.combinators

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:417

___

### controls

 **controls**: `Controls`

#### Inherited from

Schema.controls

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:418

___

### disabledPaths

 **disabledPaths**: `number`[][]

#### Inherited from

Schema.disabledPaths

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:443

___

### enableDragAndDrop

 **enableDragAndDrop**: `boolean`

#### Inherited from

Schema.enableDragAndDrop

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:438

___

### fieldMap

 **fieldMap**: `Record`<`string`, `Field`<`string`, `string`, `string`, `Option`<`string`\>, `Option`<`string`\>\>\>

#### Inherited from

Schema.fieldMap

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:415

___

### fields

 **fields**: `OptionList`<`Field`<`string`, `string`, `string`, `Option`<`string`\>, `Option`<`string`\>\>\>

#### Inherited from

Schema.fields

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:414

___

### independentCombinators

 **independentCombinators**: `boolean`

#### Inherited from

Schema.independentCombinators

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:440

___

### listsAsArrays

 **listsAsArrays**: `boolean`

#### Inherited from

Schema.listsAsArrays

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:441

___

### parseNumbers

 **parseNumbers**: `ParseNumbersMethod`

#### Inherited from

Schema.parseNumbers

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:442

___

### qbId

 **qbId**: `string`

#### Inherited from

Schema.qbId

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:413

___

### showCloneButtons

 **showCloneButtons**: `boolean`

#### Inherited from

Schema.showCloneButtons

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:433

___

### showCombinatorsBetweenRules

 **showCombinatorsBetweenRules**: `boolean`

#### Inherited from

Schema.showCombinatorsBetweenRules

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:431

___

### showLockButtons

 **showLockButtons**: `boolean`

#### Inherited from

Schema.showLockButtons

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:434

___

### showNotToggle

 **showNotToggle**: `boolean`

#### Inherited from

Schema.showNotToggle

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:432

___

### styles

 `Optional` **styles**: [`WrapEachPropertyInStyleProp`](../modules/react_querybuilder_native.md#wrapeachpropertyinstyleprop)<[`QueryBuilderNativeStyles`](react_querybuilder_native.QueryBuilderNativeStyles.md)\>

#### Inherited from

WithOptionalStyleSheets.styles

#### Defined in

[native/src/types.ts:24](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/native/src/types.ts#L24)

___

### validationMap

 **validationMap**: `ValidationMap`

#### Inherited from

Schema.validationMap

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:439

## Methods

### createRule

**createRule**(): `RuleType`<`string`, `string`, `any`, `string`\>

#### Returns

`RuleType`<`string`, `string`, `any`, `string`\>

#### Inherited from

Schema.createRule

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:419

___

### createRuleGroup

**createRuleGroup**(): `RuleGroupTypeAny`

#### Returns

`RuleGroupTypeAny`

#### Inherited from

Schema.createRuleGroup

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:420

___

### dispatchQuery

**dispatchQuery**(`query`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `RuleGroupTypeAny` |

#### Returns

`void`

#### Inherited from

Schema.dispatchQuery

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:421

___

### getInputType

**getInputType**(`field`, `operator`): ``null`` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `string` |
| `operator` | `string` |

#### Returns

``null`` \| `string`

#### Inherited from

Schema.getInputType

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:427

___

### getOperators

**getOperators**(`field`): `OptionList`<`Operator`<`string`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `string` |

#### Returns

`OptionList`<`Operator`<`string`\>\>

#### Inherited from

Schema.getOperators

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:423

___

### getQuery

**getQuery**(): `undefined` \| `RuleGroupTypeAny`

#### Returns

`undefined` \| `RuleGroupTypeAny`

#### Inherited from

Schema.getQuery

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:422

___

### getRuleClassname

**getRuleClassname**(`rule`): `Classname`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rule` | `RuleType`<`string`, `string`, `any`, `string`\> |

#### Returns

`Classname`

#### Inherited from

Schema.getRuleClassname

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:429

___

### getRuleGroupClassname

**getRuleGroupClassname**(`ruleGroup`): `Classname`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ruleGroup` | `RuleGroupTypeAny` |

#### Returns

`Classname`

#### Inherited from

Schema.getRuleGroupClassname

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:430

___

### getValueEditorSeparator

**getValueEditorSeparator**(`field`, `operator`): `ReactNode`

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `string` |
| `operator` | `string` |

#### Returns

`ReactNode`

#### Inherited from

Schema.getValueEditorSeparator

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:425

___

### getValueEditorType

**getValueEditorType**(`field`, `operator`): `ValueEditorType`

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `string` |
| `operator` | `string` |

#### Returns

`ValueEditorType`

#### Inherited from

Schema.getValueEditorType

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:424

___

### getValueSources

**getValueSources**(`field`, `operator`): `ValueSources`

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `string` |
| `operator` | `string` |

#### Returns

`ValueSources`

#### Inherited from

Schema.getValueSources

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:426

___

### getValues

**getValues**(`field`, `operator`): `OptionList`<`Option`<`string`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `string` |
| `operator` | `string` |

#### Returns

`OptionList`<`Option`<`string`\>\>

#### Inherited from

Schema.getValues

#### Defined in

react-querybuilder/dist/react-querybuilder.d.mts:428
