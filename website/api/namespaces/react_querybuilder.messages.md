---
id: "react_querybuilder.messages"
title: "Namespace: messages"
sidebar_label: "messages"
custom_edit_url: null
---

[react-querybuilder](../modules/react_querybuilder.md).messages

## Variables

### errorBothQueryDefaultQuery

 `Const` **errorBothQueryDefaultQuery**: ``"QueryBuilder was rendered with both query and defaultQuery props. QueryBuilder must be either controlled or uncontrolled (specify either the query prop, or the defaultQuery prop, but not both). Decide between using a controlled or uncontrolled query builder and remove one of these props. More info: https://reactjs.org/link/controlled-components"``

#### Defined in

[packages/react-querybuilder/src/messages.ts:7](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/messages.ts#L7)

___

### errorControlledToUncontrolled

 `Const` **errorControlledToUncontrolled**: ``"QueryBuilder is changing from a controlled component to be uncontrolled. This is likely caused by the query changing from defined to undefined, which should not happen. Decide between using a controlled or uncontrolled query builder for the lifetime of the component. More info: https://reactjs.org/link/controlled-components"``

#### Defined in

[packages/react-querybuilder/src/messages.ts:13](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/messages.ts#L13)

___

### errorDeprecatedRuleGroupProps

 `Const` **errorDeprecatedRuleGroupProps**: ``"A custom RuleGroup component has rendered a standard RuleGroup component with deprecated props. The combinator, not, and rules props should not be used. Instead, the full group object should be passed as the ruleGroup prop."``

#### Defined in

[packages/react-querybuilder/src/messages.ts:1](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/messages.ts#L1)

___

### errorDeprecatedRuleProps

 `Const` **errorDeprecatedRuleProps**: ``"A custom RuleGroup component has rendered a standard Rule component with deprecated props. The field, operator, value, and valueSource props should not be used. Instead, the full rule object should be passed as the rule prop."``

#### Defined in

[packages/react-querybuilder/src/messages.ts:4](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/messages.ts#L4)

___

### errorEnabledDndWithoutReactDnD

 `Const` **errorEnabledDndWithoutReactDnD**: ``"QueryBuilder was rendered with the enableDragAndDrop prop set to true, but either react-dnd or react-dnd-html5-backend (or both) was not installed. To enable drag-and-drop functionality, install both packages and wrap QueryBuilder in QueryBuilderDnD from @react-querybuilder/dnd."``

#### Defined in

[packages/react-querybuilder/src/messages.ts:16](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/messages.ts#L16)

___

### errorUncontrolledToControlled

 `Const` **errorUncontrolledToControlled**: ``"QueryBuilder is changing from an uncontrolled component to be controlled. This is likely caused by the query changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled query builder for the lifetime of the component. More info: https://reactjs.org/link/controlled-components"``

#### Defined in

[packages/react-querybuilder/src/messages.ts:10](https://github.com/react-querybuilder/react-querybuilder/blob/55590db8/packages/react-querybuilder/src/messages.ts#L10)
