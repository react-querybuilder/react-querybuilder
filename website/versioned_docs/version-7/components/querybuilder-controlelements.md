---
title: QueryBuilder controlElements prop
description: Prop to override default components
---

%importmd ../\_ts_admonition.md

The `controlElements` prop allows you to override default components with custom implementations.

## Usage example

```tsx
function App() {
  return (
    <QueryBuilder controlElements={{ valueEditor: CustomValueEditor }}>
  )
}
```

## Properties

The following control overrides are supported via the `Controls` interface. Setting any control to `null` hides the element by rendering it as `() => null`.

| Property                                              | Type                                                                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [`actionElement`](#actionelement)                     | <code>React.ComponentType&lt;ActionProps&gt;</code>                                                                      |
| [`addGroupAction`](#addgroupaction)                   | <code>React.ComponentType&lt;ActionProps&gt; \| null</code>                                                              |
| [`addRuleAction`](#addruleaction)                     | <code>React.ComponentType&lt;ActionProps&gt; \| null</code>                                                              |
| [`cloneGroupAction`](#clonegroupaction)               | <code>React.ComponentType&lt;ActionProps&gt; \| null</code>                                                              |
| [`cloneRuleAction`](#cloneruleaction)                 | <code>React.ComponentType&lt;ActionProps&gt; \| null</code>                                                              |
| [`combinatorSelector`](#combinatorselector)           | <code>React.ComponentType&lt;CombinatorSelectorProps&gt; \| null</code>                                                  |
| [`dragHandle`](#draghandle)                           | <code>React.ForwardRefExoticComponent&lt;DragHandleProps & React.RefAttributes&lt;HTMLSpanElement&gt;&gt; \| null</code> |
| [`fieldSelector`](#fieldselector)                     | <code>React.ComponentType&lt;FieldSelectorProps&gt; \| null</code>                                                       |
| [`inlineCombinator`](#inlinecombinator)               | <code>React.ComponentType&lt;InlineCombinatorProps&gt; \| null</code>                                                    |
| [`lockGroupAction`](#lockgroupaction)                 | <code>React.ComponentType&lt;ActionProps&gt; \| null</code>                                                              |
| [`lockRuleAction`](#lockruleaction)                   | <code>React.ComponentType&lt;ActionProps&gt; \| null</code>                                                              |
| [`matchModeEditor`](#matchmodeeditor)                 | <code>React.ComponentType&lt;MatchModeEditorProps&gt; \| null</code>                                                     |
| [`notToggle`](#nottoggle)                             | <code>React.ComponentType&lt;NotToggleProps&gt; \| null</code>                                                           |
| [`operatorSelector`](#operatorselector)               | <code>React.ComponentType&lt;OperatorSelectorProps&gt; \| null</code>                                                    |
| [`removeGroupAction`](#removegroupaction)             | <code>React.ComponentType&lt;ActionProps&gt; \| null</code>                                                              |
| [`removeRuleAction`](#removeruleaction)               | <code>React.ComponentType&lt;ActionProps&gt; \| null</code>                                                              |
| [`rule`](#rule)                                       | <code>React.ComponentType&lt;RuleProps&gt;</code>                                                                        |
| [`ruleGroup`](#rulegroup)                             | <code>React.ComponentType&lt;RuleGroupProps&gt;</code>                                                                   |
| [`ruleGroupBodyElements`](#rulegroupbodyelements)     | <code>React.ComponentType&lt;RuleGroupProps &amp; ReturnType&lt;typeof useRuleGroup&gt;&gt;</code>                       |
| [`ruleGroupHeaderElements`](#rulegroupheaderelements) | <code>React.ComponentType&lt;RuleGroupProps &amp; ReturnType&lt;typeof useRuleGroup&gt;&gt;</code>                       |
| [`shiftActions`](#shiftactions)                       | <code>React.ComponentType&lt;ShiftActionsProps&gt; \| null</code>                                                        |
| [`valueEditor`](#valueeditor)                         | <code>React.ComponentType&lt;ValueEditorProps&gt; \| null</code>                                                         |
| [`valueSelector`](#valueselector)                     | <code>React.ComponentType&lt;ValueSelectorProps&gt;</code>                                                               |
| [`valueSourceSelector`](#valuesourceselector)         | <code>React.ComponentType&lt;ValueSourceSelectorProps&gt; \| null</code>                                                 |

### `actionElement`

The base component for all button-type controls. Defaults to [`ActionElement`](./actionelement). Receives props per the `ActionProps` interface and can be any of the following controls:

- [Usage example](#usage-example)
- [Properties](#properties)
  - [`actionElement`](#actionelement)
  - [`addGroupAction`](#addgroupaction)
  - [`addRuleAction`](#addruleaction)
  - [`cloneGroupAction`](#clonegroupaction)
  - [`cloneRuleAction`](#cloneruleaction)
  - [`combinatorSelector`](#combinatorselector)
  - [`dragHandle`](#draghandle)
  - [`fieldSelector`](#fieldselector)
  - [`inlineCombinator`](#inlinecombinator)
  - [`lockGroupAction`](#lockgroupaction)
  - [`lockRuleAction`](#lockruleaction)
  - [`matchModeEditor`](#matchmodeeditor)
  - [`notToggle`](#nottoggle)
  - [`operatorSelector`](#operatorselector)
  - [`removeGroupAction`](#removegroupaction)
  - [`removeRuleAction`](#removeruleaction)
  - [`rule`](#rule)
  - [`ruleGroup`](#rulegroup)
  - [`ruleGroupBodyElements`](#rulegroupbodyelements)
  - [`ruleGroupHeaderElements`](#rulegroupheaderelements)
  - [`shiftActions`](#shiftactions)
  - [`valueEditor`](#valueeditor)
  - [`valueSelector`](#valueselector)
  - [`valueSourceSelector`](#valuesourceselector)

For example, this:

```tsx
<QueryBuilder controlElements={{ actionElement: MyAwesomeButton }} />
```

...is equivalent to this:

```tsx
<QueryBuilder
  controlElements={{
    addGroupAction: MyAwesomeButton
    addRuleAction: MyAwesomeButton
    cloneGroupAction: MyAwesomeButton
    cloneRuleAction: MyAwesomeButton
    lockGroupAction: MyAwesomeButton
    lockRuleAction: MyAwesomeButton
    removeGroupAction: MyAwesomeButton
    removeRuleAction: MyAwesomeButton
  }}
/>
```

### `addGroupAction`

Adds a sub-group to the current group. Defaults to [`ActionElement`](./actionelement).

<details>
<summary>Props for `addGroupAction`</summary>

Per the `ActionProps` interface:

| Prop            | Type                                           | Description                                                  |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| `label`         | `ReactNode`                                    | `translations.addGroup.label`, e.g. "+ Group"                |
| `title`         | `string`                                       | `translations.addGroup.title`, e.g. "Add group"              |
| `className`     | `string`                                       | CSS `classNames` to be applied                               |
| `handleOnClick` | `(e: React.MouseEvent, context?: any) => void` | Adds a new sub-group to this group                           |
| `rules`         | `RuleOrGroupArray`                             | The `rules` array for this group                             |
| `ruleOrGroup`   | `RuleGroupTypeAny`                             | This group                                                   |
| `level`         | `number`                                       | The `level` of this group                                    |
| `context`       | `any`                                          | Container for custom props that are passed to all components |
| `validation`    | <code>boolean \| ValidationResult</code>       | Validation result of this group                              |
| `disabled`      | `boolean`                                      | Whether this group is disabled/locked                        |
| `path`          | `Path`                                         | [Path](../tips/path) of this group                           |
| `schema`        | `Schema`                                       | Query [schema](../typescript#miscellaneous)                  |

</details>

### `addRuleAction`

Adds a rule to the current group. Defaults to [`ActionElement`](./actionelement).

<details>
<summary>Props for `addRuleAction`</summary>

Per the `ActionProps` interface:

| Prop            | Type                                           | Description                                                  |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| `label`         | `ReactNode`                                    | `translations.addRule.label`, e.g. "+ Rule"                  |
| `title`         | `string`                                       | `translations.addRule.title`, e.g. "Add rule"                |
| `className`     | `string`                                       | CSS `classNames` to be applied                               |
| `handleOnClick` | `(e: React.MouseEvent, context?: any) => void` | Adds a new rule to this rule                                 |
| `rules`         | `RuleOrGroupArray`                             | The `rules` array for this rule                              |
| `ruleOrGroup`   | `RuleGroupTypeAny`                             | This rule                                                    |
| `level`         | `number`                                       | The `level` of this rule                                     |
| `context`       | `any`                                          | Container for custom props that are passed to all components |
| `validation`    | <code>boolean \| ValidationResult</code>       | Validation result of this rule                               |
| `disabled`      | `boolean`                                      | Whether this rule is disabled/locked                         |
| `path`          | `Path`                                         | [Path](../tips/path) of this rule                            |
| `schema`        | `Schema`                                       | Query [schema](../typescript#miscellaneous)                  |

</details>

### `cloneGroupAction`

Clones the current group. Defaults to [`ActionElement`](./actionelement).

<details>
<summary>Props for `cloneGroupAction`</summary>

Per the `ActionProps` interface:

| Prop            | Type                                     | Description                                                  |
| --------------- | ---------------------------------------- | ------------------------------------------------------------ |
| `label`         | `ReactNode`                              | `translations.cloneRuleGroup.label`, e.g. "⧉"                |
| `title`         | `string`                                 | `translations.cloneRuleGroup.title`, e.g. "Clone group"      |
| `className`     | `string`                                 | CSS `classNames` to be applied                               |
| `handleOnClick` | `(e: React.MouseEvent) => void`          | Clones this group                                            |
| `rules`         | `RuleOrGroupArray`                       | The `rules` array for this group                             |
| `ruleOrGroup`   | `RuleGroupTypeAny`                       | This group                                                   |
| `level`         | `number`                                 | The `level` of this group                                    |
| `context`       | `any`                                    | Container for custom props that are passed to all components |
| `validation`    | <code>boolean \| ValidationResult</code> | Validation result of this group                              |
| `disabled`      | `boolean`                                | Whether this group is disabled/locked                        |
| `path`          | `Path`                                   | [Path](../tips/path) of this group                           |
| `schema`        | `Schema`                                 | Query [schema](../typescript#miscellaneous)                  |

</details>

### `cloneRuleAction`

Clones the current rule. Defaults to [`ActionElement`](./actionelement).

<details>
<summary>Props for `cloneRuleAction`</summary>

Per the `ActionProps` interface:

| Prop            | Type                                     | Description                                                  |
| --------------- | ---------------------------------------- | ------------------------------------------------------------ |
| `label`         | `string`                                 | `translations.cloneRule.label`, e.g. "⧉"                     |
| `title`         | `string`                                 | `translations.cloneRule.title`, e.g. "Clone rule"            |
| `className`     | `string`                                 | CSS `classNames` to be applied                               |
| `handleOnClick` | `(e: React.MouseEvent) => void`          | Clones the rule                                              |
| `ruleOrGroup`   | `RuleType`                               | This rule                                                    |
| `level`         | `number`                                 | The `level` of this rule                                     |
| `context`       | `any`                                    | Container for custom props that are passed to all components |
| `validation`    | <code>boolean \| ValidationResult</code> | Validation result of this rule                               |
| `disabled`      | `boolean`                                | Whether this rule is disabled/locked                         |
| `path`          | `Path`                                   | [Path](../tips/path) of this rule                            |
| `schema`        | `Schema`                                 | Query [schema](../typescript#miscellaneous)                  |

</details>

### `combinatorSelector`

Selects the `combinator` property for the current group or the current independent combinator value. Defaults to [`ValueSelector`](./valueselector).

<details>
<summary>Props for `combinatorSelector`</summary>

Per the `CombinatorSelectorProps` interface:

| Prop             | Type                                     | Description                                                          |
| ---------------- | ---------------------------------------- | -------------------------------------------------------------------- |
| `options`        | `OptionList`                             | Same as `combinators` prop passed into `QueryBuilder`                |
| `value`          | `string`                                 | Selected `combinator` from the existing query representation, if any |
| `className`      | `string`                                 | CSS `classNames` to be applied                                       |
| `handleOnChange` | `(value: any) => void`                   | Updates the group's `combinator`                                     |
| `rules`          | `RuleOrGroupArray`                       | The `rules` array for this group                                     |
| `title`          | `string`                                 | `translations.combinators.title`, e.g. "Combinators"                 |
| `level`          | `number`                                 | The `level` of this group                                            |
| `context`        | `any`                                    | Container for custom props that are passed to all components         |
| `validation`     | <code>boolean \| ValidationResult</code> | Validation result of this group                                      |
| `disabled`       | `boolean`                                | Whether this group is disabled/locked                                |
| `path`           | `Path`                                   | [Path](../tips/path) of this group                                   |
| `schema`         | `Schema`                                 | Query [schema](../typescript#miscellaneous)                          |

</details>

### `dragHandle`

Provides a draggable handle for reordering rules and groups. Defaults to [`DragHandle`](./draghandle). Only rendered when [drag-and-drop is enabled](./querybuilder#enabledraganddrop). This component must use `React.forwardRef`.

<details>
<summary>Props for `dragHandle`</summary>

Receives the forwarded `ref` and the following props per the `DragHandleProps` interface:

| Prop          | Type                                      | Description                                                  |
| ------------- | ----------------------------------------- | ------------------------------------------------------------ |
| `label`       | `ReactNode`                               | `translations.dragHandle.label`, e.g. "⁞⁞"                   |
| `title`       | `string`                                  | `translations.dragHandle.title`, e.g. "Drag handle"          |
| `className`   | `string`                                  | CSS `classNames` to be applied                               |
| `level`       | `number`                                  | The `level` of this rule/group                               |
| `context`     | `any`                                     | Container for custom props that are passed to all components |
| `validation`  | <code>boolean \| ValidationResult</code>  | Validation result of this rule/group                         |
| `disabled`    | `boolean`                                 | Whether this rule/group is disabled/locked                   |
| `path`        | `Path`                                    | [Path](../tips/path) of this rule/group                      |
| `schema`      | `Schema`                                  | Query [schema](../typescript#miscellaneous)                  |
| `ruleOrGroup` | <code>RuleGroupTypeAny \| RuleType</code> | This group or rule, depending on the parent component        |

</details>

### `fieldSelector`

Selects the `field` property for the current rule. Defaults to [`ValueSelector`](./valueselector).

<details>
<summary>Props for `fieldSelector`</summary>

Per the `FieldSelectorProps` interface:

| Prop             | Type                                     | Description                                                        |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| `options`        | <code>OptionList&lt;Field&gt;</code>     | Same as `fields` prop passed into `QueryBuilder`                   |
| `value`          | `string`                                 | Selected `field` from the existing query representation, if any    |
| `title`          | `string`                                 | `translations.fields.title`, e.g. "Fields"                         |
| `operator`       | `string`                                 | Selected `operator` from the existing query representation, if any |
| `className`      | `string`                                 | CSS `classNames` to be applied                                     |
| `handleOnChange` | `(value: any) => void`                   | Updates the rule's field                                           |
| `level`          | `number`                                 | The `level` of this rule                                           |
| `context`        | `any`                                    | Container for custom props that are passed to all components       |
| `validation`     | <code>boolean \| ValidationResult</code> | Validation result of this rule                                     |
| `disabled`       | `boolean`                                | Whether this rule is disabled/locked                               |
| `path`           | `Path`                                   | [Path](../tips/path) of this rule                                  |
| `schema`         | `Schema`                                 | Query [schema](../typescript#miscellaneous)                        |
| `rule`           | `RuleType`                               | This rule                                                          |

</details>

### `inlineCombinator`

Wraps the [`combinatorSelector`](#combinatorselector) component for inline display. Defaults to [`InlineCombinator`](./inlinecombinator).

<details>
<summary>Props for `inlineCombinator`</summary>

Per the `InlineCombinatorProps` interface, which extends `CombinatorSelectorProps`:

| Prop        | Type                                       | Description                                |
| ----------- | ------------------------------------------ | ------------------------------------------ |
| `component` | `Schema['controls']['combinatorSelector']` | Same as the `combinatorSelector` component |

</details>

### `lockGroupAction`

Locks the current group (sets the `disabled` property to `true`). Defaults to [`ActionElement`](./actionelement).

<details>
<summary>Props for `lockGroupAction`</summary>

Per the `ActionProps` interface:

| Prop                  | Type                                     | Description                                                                                                            |
| --------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `label`               | `ReactNode`                              | `translations.lockGroup.label` or `translations.lockGroupDisabled.label`, e.g. "🔓" when unlocked and "🔒" when locked |
| `title`               | `string`                                 | `translations.lockGroup.title` or `translations.lockGroupDisabled.title`, e.g. "Lock group" or "Unlock group"          |
| `className`           | `string`                                 | CSS `classNames` to be applied                                                                                         |
| `handleOnClick`       | `(e: React.MouseEvent) => void`          | Locks the group                                                                                                        |
| `rules`               | `RuleOrGroupArray`                       | The rules present for this group                                                                                       |
| `ruleOrGroup`         | `RuleGroupTypeAny`                       | This group                                                                                                             |
| `level`               | `number`                                 | The `level` of this group                                                                                              |
| `context`             | `any`                                    | Container for custom props that are passed to all components                                                           |
| `validation`          | <code>boolean \| ValidationResult</code> | Validation result of this group                                                                                        |
| `disabled`            | `boolean`                                | Whether this group is disabled/locked                                                                                  |
| `disabledTranslation` | `string`                                 | `translations.lockGroupDisabled` if parent group is not disabled, otherwise `undefined`                                |
| `path`                | `Path`                                   | [Path](../tips/path) of this group                                                                                     |
| `schema`              | `Schema`                                 | Query [schema](../typescript#miscellaneous)                                                                            |

</details>

### `lockRuleAction`

Locks the current rule (sets the `disabled` property to `true`). Defaults to [`ActionElement`](./actionelement).

<details>
<summary>Props for `lockRuleAction`</summary>

Per the `ActionProps` interface:

| Prop                  | Type                                     | Description                                                                                                          |
| --------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `label`               | `ReactNode`                              | `translations.lockRule.label` or `translations.lockRuleDisabled.label`, e.g. "🔓" when unlocked and "🔒" when locked |
| `title`               | `string`                                 | `translations.lockRule.title` or `translations.lockRuleDisabled.title`, e.g. "Lock rule" or "Unlock rule"            |
| `className`           | `string`                                 | CSS `classNames` to be applied                                                                                       |
| `handleOnClick`       | `(e: React.MouseEvent) => void`          | Locks the rule                                                                                                       |
| `ruleOrGroup`         | `RuleType`                               | This rule                                                                                                            |
| `level`               | `number`                                 | The `level` of this rule                                                                                             |
| `context`             | `any`                                    | Container for custom props that are passed to all components                                                         |
| `validation`          | <code>boolean \| ValidationResult</code> | Validation result of this rule                                                                                       |
| `disabled`            | `boolean`                                | Whether this rule is disabled/locked                                                                                 |
| `disabledTranslation` | `string`                                 | `translations.lockRuleDisabled` if parent group is not disabled, otherwise `undefined`                               |
| `path`                | `Path`                                   | [Path](../tips/path) of this rule                                                                                    |
| `schema`              | `Schema`                                 | Query [schema](../typescript#miscellaneous)                                                                          |

</details>

### `matchModeEditor`

Manages the `match` property for the current rule, including the `mode` and `threshold` (see [Subqueries](../tips/subqueries)). Defaults to [`MatchModeEditor`](./matchmodeeditor).

<details>
<summary>Props for `matchModeEditor`</summary>

Per the `MatchModeEditorProps` interface:

| Prop                     | Type                                            | Description                                                  |
| ------------------------ | ----------------------------------------------- | ------------------------------------------------------------ |
| `match`                  | `MatchConfig`                                   | Current match configuration for this rule                    |
| `options`                | <code>OptionList&lt;MatchMode&gt;</code>        | Available match modes for the current field                  |
| `field`                  | `string`                                        | Field name corresponding to this rule                        |
| `fieldData`              | `FullField`                                     | The entire object from the fields array for this field       |
| `rule`                   | `RuleType`                                      | This rule                                                    |
| `selectorComponent`      | `ComponentType<ValueSelectorProps>`             | Component to use for the match mode selector                 |
| `numericEditorComponent` | `ComponentType<ValueEditorProps>`               | Component to use for the match threshold editor              |
| `classNames`             | `{ matchMode: string; matchThreshold: string }` | CSS classNames for sub-components                            |
| `value`                  | `string`                                        | Current match mode value                                     |
| `className`              | `string`                                        | CSS `classNames` to be applied                               |
| `handleOnChange`         | `(value: any) => void`                          | Updates the rule's match configuration                       |
| `level`                  | `number`                                        | The `level` of this rule                                     |
| `context`                | `any`                                           | Container for custom props that are passed to all components |
| `validation`             | <code>boolean \| ValidationResult</code>        | Validation result of this rule                               |
| `disabled`               | `boolean`                                       | Whether this rule is disabled/locked                         |
| `path`                   | `Path`                                          | [Path](../tips/path) of this rule                            |
| `schema`                 | `Schema`                                        | Query [schema](../typescript#miscellaneous)                  |

</details>

### `notToggle`

Toggles the `not` property of the current group between `true` and `false`. Defaults to [`NotToggle`](./nottoggle).

<details>
<summary>Props for `notToggle`</summary>

Per the `NotToggleProps` interface:

| Prop             | Type                                     | Description                                                  |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------ |
| `label`          | `ReactNode`                              | `translations.notToggle.label`, e.g. "Not"                   |
| `title`          | `string`                                 | `translations.notToggle.title`, e.g. "Invert this group"     |
| `className`      | `string`                                 | CSS `classNames` to be applied                               |
| `handleOnChange` | `(checked: boolean) => void`             | Updates the group's `not` property                           |
| `checked`        | `boolean`                                | Whether the input should be checked or not                   |
| `level`          | `number`                                 | The `level` of this group                                    |
| `context`        | `any`                                    | Container for custom props that are passed to all components |
| `validation`     | <code>boolean \| ValidationResult</code> | Validation result of this group                              |
| `disabled`       | `boolean`                                | Whether this group is disabled/locked                        |
| `path`           | `Path`                                   | [Path](../tips/path) of this group                           |
| `schema`         | `Schema`                                 | Query [schema](../typescript#miscellaneous)                  |
| `ruleGroup`      | `RuleGroupTypeAny`                       | This group                                                   |

</details>

### `operatorSelector`

Selects the `operator` property for the current rule. Defaults to [`ValueSelector`](./valueselector).

<details>
<summary>Props for `operatorSelector`</summary>

Per the `OperatorSelectorProps` interface:

| Prop             | Type                                     | Description                                                      |
| ---------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| `field`          | `string`                                 | Field name corresponding to this rule                            |
| `fieldData`      | `Field`                                  | The entire object from the fields array for this field           |
| `options`        | <code>OptionList&lt;Operator&gt;</code>  | Return value of `getOperators(field, { fieldData })`             |
| `value`          | `string`                                 | Selected operator from the existing query representation, if any |
| `title`          | `string`                                 | `translations.operators.title`, e.g. "Operators"                 |
| `className`      | `string`                                 | CSS `classNames` to be applied                                   |
| `handleOnChange` | `(value: any) => void`                   | Updates the rule's operator                                      |
| `level`          | `number`                                 | The `level` of this rule                                         |
| `context`        | `any`                                    | Container for custom props that are passed to all components     |
| `validation`     | <code>boolean \| ValidationResult</code> | Validation result of this rule                                   |
| `disabled`       | `boolean`                                | Whether this rule is disabled/locked                             |
| `path`           | `Path`                                   | [Path](../tips/path) of this rule                                |
| `schema`         | `Schema`                                 | Query [schema](../typescript#miscellaneous)                      |
| `rule`           | `RuleType`                               | This rule                                                        |

</details>

### `removeGroupAction`

Removes the current group from its parent group's `rules` array. Defaults to [`ActionElement`](./actionelement).

<details>
<summary>Props for `removeGroupAction`</summary>

Per the `ActionProps` interface:

| Prop            | Type                                     | Description                                                  |
| --------------- | ---------------------------------------- | ------------------------------------------------------------ |
| `label`         | `ReactNode`                              | `translations.removeGroup.label`, e.g. "⨯"                   |
| `title`         | `string`                                 | `translations.removeGroup.title`, e.g. "Remove group"        |
| `className`     | `string`                                 | CSS `classNames` to be applied                               |
| `handleOnClick` | `(e: React.MouseEvent) => void`          | Removes the group                                            |
| `rules`         | `RuleOrGroupArray`                       | The `rules` array for this group                             |
| `ruleOrGroup`   | `RuleGroupTypeAny`                       | This group                                                   |
| `level`         | `number`                                 | The `level` of this group                                    |
| `context`       | `any`                                    | Container for custom props that are passed to all components |
| `validation`    | <code>boolean \| ValidationResult</code> | Validation result of this group                              |
| `disabled`      | `boolean`                                | Whether this group is disabled/locked                        |
| `path`          | `Path`                                   | [Path](../tips/path) of this group                           |
| `schema`        | `Schema`                                 | Query [schema](../typescript#miscellaneous)                  |

</details>

### `removeRuleAction`

Removes the current rule from its parent group's `rules` array. Defaults to [`ActionElement`](./actionelement).

<details>
<summary>Props for `removeRuleAction`</summary>

Per the `ActionProps` interface:

| Prop            | Type                                     | Description                                                  |
| --------------- | ---------------------------------------- | ------------------------------------------------------------ |
| `label`         | `ReactNode`                              | `translations.removeRule.label`, e.g. "⨯"                    |
| `title`         | `string`                                 | `translations.removeRule.title`, e.g. "Remove rule"          |
| `className`     | `string`                                 | CSS `classNames` to be applied                               |
| `handleOnClick` | `(e: React.MouseEvent) => void`          | Removes the rule                                             |
| `ruleOrGroup`   | `RuleType`                               | This rule                                                    |
| `level`         | `number`                                 | The `level` of this rule                                     |
| `context`       | `any`                                    | Container for custom props that are passed to all components |
| `validation`    | <code>boolean \| ValidationResult</code> | Validation result of this rule                               |
| `disabled`      | `boolean`                                | Whether this rule is disabled/locked                         |
| `path`          | `Path`                                   | [Path](../tips/path) of this rule                            |
| `schema`        | `Schema`                                 | Query [schema](../typescript#miscellaneous)                  |

</details>

### `rule`

Rule layout component. Defaults to [`Rule`](./rule).

<details>
<summary>Props for `rule`</summary>

Per the `RuleProps` interface:

| Prop                | Type           | Description                                                  |
| ------------------- | -------------- | ------------------------------------------------------------ |
| `id`                | `string`       | Unique identifier for this rule                              |
| `path`              | `Path`         | [Path](../tips/path) of this rule                            |
| `rule`              | `RuleType`     | The rule object                                              |
| `translations`      | `Translations` | The default translations merged with the `translations` prop |
| `schema`            | `Schema`       | Query [schema](../typescript#miscellaneous)                  |
| `actions`           | `QueryActions` | Query [update functions](../typescript#miscellaneous)        |
| `context`           | `any`          | Container for custom props that are passed to all components |
| `disabled`          | `boolean`      | Whether the rule itself is disabled                          |
| `shiftUpDisabled`   | `boolean`      | Whether shifting the rule up is disallowed                   |
| `shiftDownDisabled` | `boolean`      | Whether shifting the rule down is disallowed                 |
| `parentDisabled`    | `boolean`      | Whether the parent group of this rule is disabled            |

</details>

:::tip

When using a custom `Rule` component with [drag-and-drop enabled](./querybuilder#enabledraganddrop), set the `controlElements` prop on the `QueryBuilderDnD` context provider instead of `QueryBuilder`.

:::

### `ruleGroup`

Rule group layout component. Defaults to [`RuleGroup`](./rulegroup).

<details>
<summary>Props for `ruleGroup`</summary>

Per the `RuleGroupProps` interface:

| Prop                | Type               | Description                                                  |
| ------------------- | ------------------ | ------------------------------------------------------------ |
| `id`                | `string`           | Unique identifier for this group                             |
| `path`              | `Path`             | [Path](../tips/path) of this group                           |
| `ruleGroup`         | `RuleGroupTypeAny` | The group object                                             |
| `translations`      | `Translations`     | The default translations merged with the `translations` prop |
| `schema`            | `Schema`           | Query [schema](../typescript#miscellaneous)                  |
| `actions`           | `QueryActions`     | Query [update functions](../typescript#miscellaneous)        |
| `context`           | `any`              | Container for custom props that are passed to all components |
| `disabled`          | `boolean`          | Whether the group itself is disabled                         |
| `shiftUpDisabled`   | `boolean`          | Whether shifting the group up is disallowed                  |
| `shiftDownDisabled` | `boolean`          | Whether shifting the group down is disallowed                |
| `parentDisabled`    | `boolean`          | Whether the parent group of this group is disabled           |

</details>

:::tip

When using a custom `RuleGroup` component with [drag-and-drop enabled](./querybuilder#enabledraganddrop), set the `controlElements` prop on the `QueryBuilderDnD` context provider instead of `QueryBuilder`.

:::

### `ruleGroupBodyElements`

Rule group body elements. Defaults to [`RuleGroupBodyComponents`](./rulegroup#rulegroupbodycomponents), which returns an array containing only the elements (no HTML or React Native wrapper). Receives the same props as [`ruleGroup`](#rulegroup) plus the return value of the [`useRuleGroup`](../utils/hooks#userulegroup) hook.

### `ruleGroupHeaderElements`

Rule group header elements. Defaults to [`RuleGroupHeaderComponents`](./rulegroup#rulegroupheadercomponents), which returns a React `Fragment` containing only the elements (no HTML or React Native wrapper). Receives the same props as [`ruleGroup`](#rulegroup) plus the return value of the [`useRuleGroup`](../utils/hooks#userulegroup) hook.

### `shiftActions`

Shifts the current rule/group up or down in the query hierarchy. Defaults to [`ShiftActions`](./shiftactions).

<details>
<summary>Props for `shiftActions`</summary>

Per the `ShiftActionsProps` interface:

| Prop                | Type                                            | Description                                                                                                   |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `labels`            | `{ shiftUp: ReactNode; shiftDown: ReactNode; }` | `translations.shiftActionUp.label` and `translations.shiftActionDown.label`, e.g. "˄" and "˅"                 |
| `titles`            | `{ shiftUp: string; shiftDown: string; }`       | `translations.shiftActionUp.title` and `translations.shiftActionDown.title`, e.g. "Shift up" and "Shift down" |
| `className`         | `string`                                        | CSS `classNames` to be applied                                                                                |
| `ruleOrGroup`       | `RuleGroupTypeAny`                              | This rule/group                                                                                               |
| `level`             | `number`                                        | The `level` of this rule/group                                                                                |
| `context`           | `any`                                           | Container for custom props that are passed to all components                                                  |
| `validation`        | <code>boolean \| ValidationResult</code>        | Validation result of this rule/group                                                                          |
| `disabled`          | `boolean`                                       | Whether this rule/group is disabled/locked                                                                    |
| `path`              | `Path`                                          | [Path](../tips/path) of this rule/group                                                                       |
| `schema`            | `Schema`                                        | Query [schema](../typescript#miscellaneous)                                                                   |
| `shiftUp`           | `() => void`                                    | Method to shift the rule/group up one place                                                                   |
| `shiftDown`         | `() => void`                                    | Method to shift the rule/group down one place                                                                 |
| `shiftUpDisabled`   | `boolean`                                       | Whether shifting the rule/group up is disallowed                                                              |
| `shiftDownDisabled` | `boolean`                                       | Whether shifting the rule/group down is disallowed                                                            |

</details>

### `valueEditor`

Updates the `value` property for the current rule. Defaults to [`ValueEditor`](./valueeditor).

<details>
<summary>Props for `valueEditor`</summary>

Per the `ValueEditorProps` interface:

| Prop             | Type                                     | Description                                                             |
| ---------------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| `field`          | `string`                                 | Field `name` corresponding to this rule                                 |
| `fieldData`      | `Field`                                  | The entire object from the fields array for this field                  |
| `operator`       | `string`                                 | Operator `name` corresponding to this rule                              |
| `value`          | `string`                                 | `value` from the existing query representation, if any                  |
| `title`          | `string`                                 | `translations.value.title`, e.g. "Value"                                |
| `handleOnChange` | `(value: any) => void`                   | Updates the rule's `value`                                              |
| `type`           | `ValueEditorType`                        | Type of editor to be displayed                                          |
| `inputType`      | `string`                                 | Intended `@type` attribute of the `<input>`, if `type` prop is "text"   |
| `values`         | `any[]`                                  | List of available values for this rule                                  |
| `className`      | `string`                                 | CSS `classNames` to be applied                                          |
| `valueSource`    | `ValueSource`                            | Value source for this rule                                              |
| `listsAsArrays`  | `boolean`                                | Whether to manage value lists (i.e. "between"/"in" operators) as arrays |
| `parseNumbers`   | `ParseNumberMethod`                      | Whether to parse real numbers from strings                              |
| `separator`      | `ReactNode`                              | Separator element for series of editors (i.e. "between" operator)       |
| `level`          | `number`                                 | The `level` of this rule                                                |
| `context`        | `any`                                    | Container for custom props that are passed to all components            |
| `validation`     | <code>boolean \| ValidationResult</code> | Validation result of this rule                                          |
| `disabled`       | `boolean`                                | Whether this rule is disabled/locked                                    |
| `path`           | `Path`                                   | [Path](../tips/path) of this rule                                       |
| `schema`         | `Schema`                                 | Query [schema](../typescript#miscellaneous)                             |
| `rule`           | `RuleType`                               | This rule                                                               |

</details>

### `valueSelector`

The base component for all value selector controls. Defaults to [`ValueSelector`](./valueselector). Receives props per various interfaces depending on the specific control type:

- [`combinatorSelector`](#combinatorselector)
- [`fieldSelector`](#fieldselector)
- [`operatorSelector`](#operatorselector)
- [`valueSourceSelector`](#valuesourceselector)

For example, this:

```tsx
<QueryBuilder controlElements={{ valueSelector: MyAwesomeSelector }} />
```

...is equivalent to this:

```tsx
<QueryBuilder
  controlElements={{
    combinatorSelector: MyAwesomeSelector
    fieldSelector: MyAwesomeSelector
    operatorSelector: MyAwesomeSelector
    valueSourceSelector: MyAwesomeSelector
  }}
/>
```

### `valueSourceSelector`

Selects the `valueSource` property for the current rule. Defaults to [`ValueSelector`](./valueselector).

<details>
<summary>Props for `valueSourceSelector`</summary>

Per the `ValueSourceSelectorProps` interface:

| Prop             | Type                                             | Description                                                       |
| ---------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| `field`          | `string`                                         | Field `name` corresponding to this rule                           |
| `fieldData`      | `Field`                                          | The entire object from the `fields` array for the selected field  |
| `options`        | <code>OptionList&lt;ValueSourceOption&gt;</code> | Return value of `getValueSources(field, operator, { fieldData })` |
| `value`          | `ValueSource`                                    | Selected value source for this rule, if any                       |
| `title`          | `string`                                         | `translations.valueSourceSelector.title`, e.g. "Value source"     |
| `className`      | `string`                                         | CSS `classNames` to be applied                                    |
| `handleOnChange` | `(value: any) => void`                           | Updates the rule's `valueSource`                                  |
| `level`          | `number`                                         | The `level` of this rule                                          |
| `context`        | `any`                                            | Container for custom props that are passed to all components      |
| `validation`     | <code>boolean \| ValidationResult</code>         | Validation result of this rule                                    |
| `disabled`       | `boolean`                                        | Whether this rule is disabled/locked                              |
| `path`           | `Path`                                           | [Path](../tips/path) of this rule                                 |
| `schema`         | `Schema`                                         | Query [schema](../typescript#miscellaneous)                       |
| `rule`           | `RuleType`                                       | This rule                                                         |

</details>
