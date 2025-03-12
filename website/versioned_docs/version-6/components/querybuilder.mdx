---
title: QueryBuilder
description: The root component and context provider
---

import { DemoLink } from '@site/src/components/DemoLink';
import TypeScriptAdmonition from '../_ts_admonition.md';

<TypeScriptAdmonition />

The default export of `react-querybuilder` is the `<QueryBuilder />` React component (also available as a named export).

`QueryBuilder` calls the [`useQueryBuilder`](../utils/hooks#usequerybuilder) hook to prepare the query, schema, update methods, etc., that get passed down to the subcomponents.

## Subcomponents

`QueryBuilder` renders a [`RuleGroup`](./rulegroup) representing the root of the query.

That root `RuleGroup` is nested within a `<div>` that has the [standard `queryBuilder` class](../styling/classnames), any classes added by [`controlClassnames.queryBuilder`](#controlclassnames), and `data-` properties with "enabled"/"disabled" values indicating whether [drag-and-drop](#enabledraganddrop) or inline combinators ([`showCombinatorsBetweenRules`](#showcombinatorsbetweenrules) or [`independentCombinators`](#independentcombinators)) are enabled.

Finally, everything is wrapped in `<QueryBuilderContext.Provider>` which inherits any values from ancestor context providers and propogates them down to subcomponents (props will supersede context values).

## Props

All `QueryBuilder` props are optional, but as stated in the [getting started guide](../intro), the query builder is really only useful when, at a minimum, the `fields` prop is defined.

:::note

When you see `RuleGroupTypeAny` below (e.g. for [query](#query), [defaultQuery](#defaultquery), and [onQueryChange](#onquerychange)), that means the type must either be `RuleGroupType` or `RuleGroupTypeIC`. However, if the type is `RuleGroupTypeIC`, then the [`independentCombinators` prop](#independentcombinators) must be set to `true`. Likewise, if the type is `RuleGroupType` then `independentCombinators` must be `false` or `undefined`.

:::

### `fields`

`OptionList<Field> | Record<string, Field>`

The array of [fields](../typescript#fields) that should be used or an array of [option groups](../typescript#miscellaneous) containing arrays of fields. (Alternatively, `fields` can be an object where the keys correspond to each field `name` and the values are the field definitions. If `fields` is an object, then the `options` array passed to the [`fieldSelector` component](#fieldselector) will be sorted alphabetically by the `label` property.)

:::tip

Field objects can also contain custom properties. Each field object will be passed in its entirety to the appropriate `OperatorSelector` and `ValueEditor` components as the `fieldData` prop (see the section on [`controlElements`](#controlelements)).

:::

### `onQueryChange`

`(query: RuleGroupTypeAny) => void`

This function is invoked whenever the query is updated from within the component. The `query` is provided as an object of type `RuleGroupType` by default. For example:

```json
{
  "combinator": "and",
  "not": false,
  "rules": [
    {
      "field": "firstName",
      "operator": "=",
      "value": "Steve"
    },
    {
      "field": "lastName",
      "operator": "=",
      "value": "Vai"
    },
    {
      "combinator": "and",
      "rules": [
        {
          "field": "age",
          "operator": ">",
          "value": "30"
        }
      ]
    }
  ]
}
```

If the `independentCombinators` prop is provided, then the `query` argument will be of type `RuleGroupTypeIC`. The "IC" version of the example above would look like this:

```json
{
  "not": false,
  "rules": [
    {
      "field": "firstName",
      "operator": "=",
      "value": "Steve"
    },
    "and",
    {
      "field": "lastName",
      "operator": "=",
      "value": "Vai"
    },
    "and",
    {
      "rules": [
        {
          "field": "age",
          "operator": ">",
          "value": "30"
        }
      ]
    }
  ]
}
```

### `query`

`RuleGroupTypeAny`

The query is an object of type `RuleGroupType` (or `RuleGroupTypeIC`, if [`independentCombinators`](#independentcombinators) is `true`). If this prop is provided, `<QueryBuilder />` will be a [controlled component](https://reactjs.org/docs/forms.html#controlled-components).

The `query` prop follows the same format as the parameter passed to the [`onQueryChange`](#onquerychange) callback since they are meant to be used together to control the component. See [examples](https://github.com/react-querybuilder/react-querybuilder/blob/main/examples).

### `defaultQuery`

`RuleGroupTypeAny`

The initial query when `<QueryBuilder />` is uncontrolled.

:::caution

Do not provide both `query` and `defaultQuery` props. To use `<QueryBuilder />` as a controlled component, provide and manage the `query` prop in combination with the `onQueryChange` callback. Use `defaultQuery` (or neither query prop) to render an uncontrolled component.

If both props are defined, TypeScript will throw an error during compilation and an error will be logged to the console during runtime (in "development" mode only). Errors will also be logged to the console if the `query` prop is defined during one render and undefined in the next, or vice versa.

:::

### `context`

`any`

A "bucket" for passing arbitrary props down to custom components (default components will ignore this prop). The `context` prop is passed to each and every component, so it's accessible anywhere in the `QueryBuilder` component tree.

### `operators`

`OptionList<Operator>`

The array of operators that should be used. Custom operators must define a `name` and `label` property. An `arity` property, which can be "unary", "binary", or a number, may also be defined for each operator. If `arity` is either "unary" or a number less than 2, the [value editor component](./valueeditor) will not be rendered when that operator is selected.

To build the operator list dynamically depending on a rule's `field` property, use [`getOperators`](#getoperators). The result of `getOperators`, if not `null`, will supersede the `operators` prop.

The default operator list is below.

```ts
[
  { name: '=', label: '=' },
  { name: '!=', label: '!=' },
  { name: '<', label: '<' },
  { name: '>', label: '>' },
  { name: '<=', label: '<=' },
  { name: '>=', label: '>=' },
  { name: 'contains', label: 'contains' },
  { name: 'beginsWith', label: 'begins with' },
  { name: 'endsWith', label: 'ends with' },
  { name: 'doesNotContain', label: 'does not contain' },
  { name: 'doesNotBeginWith', label: 'does not begin with' },
  { name: 'doesNotEndWith', label: 'does not end with' },
  { name: 'null', label: 'is null' },
  { name: 'notNull', label: 'is not null' },
  { name: 'in', label: 'in' },
  { name: 'notIn', label: 'not in' },
  { name: 'between', label: 'between' },
  { name: 'notBetween', label: 'not between' },
];
```

### `combinators`

`OptionList`

The array of combinators that should be used for RuleGroups. The default combinator list is below.

```ts
[
  { name: 'and', label: 'AND' },
  { name: 'or', label: 'OR' },
];
```

### `controlClassnames`

`Partial<Classnames>`

This prop can be used to assign custom CSS classes to the various controls rendered by the `<QueryBuilder />` component. Each attribute is a `Classname` which can be a `string`, `string[]`, or `Record<string, any>` (see documentation for [`clsx`](https://www.npmjs.com/package/clsx)):

#### Usage example

In the example below, any "+Rule" buttons in the query builder will have the "bold" class which might have the associated CSS rule `.bold { font-weight: bold; }`.

```tsx
function App() {
  return (
    <QueryBuilder controlClassnames={{ addRule: 'bold' }}>
  )
}
```

| Property       | Classes are applied to...                                                              |
| -------------- | -------------------------------------------------------------------------------------- |
| `queryBuilder` | ...the outermost <code>&lt;div&gt;</code> element                                      |
| `ruleGroup`    | ...each <code>&lt;div&gt;</code> wrapping a group                                      |
| `header`       | ...each <code>&lt;div&gt;</code> wrapping a group's header controls                    |
| `body`         | ...each <code>&lt;div&gt;</code> wrapping a group's body elements (child rules/groups) |
| `combinators`  | ...each <code>&lt;select&gt;</code> control for combinators                            |
| `addRule`      | ...each <code>&lt;button&gt;</code> that adds a rule                                   |
| `addGroup`     | ...each <code>&lt;button&gt;</code> that adds a group                                  |
| `cloneRule`    | ...each <code>&lt;button&gt;</code> that clones a rule                                 |
| `cloneGroup`   | ...each <code>&lt;button&gt;</code> that clones a group                                |
| `removeGroup`  | ...each <code>&lt;button&gt;</code> that removes a group                               |
| `lockRule`     | ...each <code>&lt;button&gt;</code> that locks/disables a rule                         |
| `lockGroup`    | ...each <code>&lt;button&gt;</code> that locks/disables a group                        |
| `notToggle`    | ...each <code>&lt;label&gt;</code> on a "not" (aka "inversion") toggle                 |
| `rule`         | ...each <code>&lt;div&gt;</code> containing a rule                                     |
| `fields`       | ...each <code>&lt;select&gt;</code> control for selecting a field                      |
| `operators`    | ...each <code>&lt;select&gt;</code> control for selecting an operator                  |
| `value`        | ...each <code>&lt;input&gt;</code> for entering a value                                |
| `removeRule`   | ...each <code>&lt;button&gt;</code> that removes a rule                                |
| `dragHandle`   | ...each <code>&lt;span&gt;</code> acting as a drag handle                              |
| `valueSource`  | ...each <code>&lt;select&gt;</code> control for selecting a value source               |

### `controlElements`

`Partial<Controls>`

This object allows you to override the default components.

#### Usage example

```tsx
function App() {
  return (
    <QueryBuilder controlElements={{ valueEditor: CustomValueEditor }}>
  )
}
```

The following control overrides are supported per the `Controls` interface:

| Property                                      | Type                                                                                                             |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [`addGroupAction`](#addgroupaction)           | <code>React.ComponentType&lt;ActionWithRulesAndAddersProps&gt;</code>                                            |
| [`addRuleAction`](#addruleaction)             | <code>React.ComponentType&lt;ActionWithRulesAndAddersProps&gt;</code>                                            |
| [`cloneGroupAction`](#clonegroupaction)       | <code>React.ComponentType&lt;ActionWithRulesProps&gt;</code>                                                     |
| [`cloneRuleAction`](#cloneruleaction)         | <code>React.ComponentType&lt;ActionProps&gt;</code>                                                              |
| [`combinatorSelector`](#combinatorselector)   | <code>React.ComponentType&lt;CombinatorSelectorProps&gt;</code>                                                  |
| [`dragHandle`](#draghandle)                   | <code>React.ForwardRefExoticComponent&lt;DragHandleProps & React.RefAttributes&lt;HTMLSpanElement&gt;&gt;</code> |
| [`fieldSelector`](#fieldselector)             | <code>React.ComponentType&lt;FieldSelectorProps&gt;</code>                                                       |
| [`inlineCombinator`](#inlinecombinator)       | <code>React.ComponentType&lt;InlineCombinatorProps&gt;</code>                                                    |
| [`lockGroupAction`](#lockgroupaction)         | <code>React.ComponentType&lt;ActionWithRulesProps&gt;</code>                                                     |
| [`lockRuleAction`](#lockruleaction)           | <code>React.ComponentType&lt;ActionProps&gt;</code>                                                              |
| [`notToggle`](#nottoggle)                     | <code>React.ComponentType&lt;NotToggleProps&gt;</code>                                                           |
| [`operatorSelector`](#operatorselector)       | <code>React.ComponentType&lt;OperatorSelectorProps&gt;</code>                                                    |
| [`removeGroupAction`](#removegroupaction)     | <code>React.ComponentType&lt;ActionWithRulesProps&gt;</code>                                                     |
| [`removeRuleAction`](#removeruleaction)       | <code>React.ComponentType&lt;ActionProps&gt;</code>                                                              |
| [`rule`](#rule)                               | <code>React.ComponentType&lt;RuleProps&gt;</code>                                                                |
| [`ruleGroup`](#rulegroup)                     | <code>React.ComponentType&lt;RuleGroupProps&gt;</code>                                                           |
| [`valueEditor`](#valueeditor)                 | <code>React.ComponentType&lt;ValueEditorProps&gt;</code>                                                         |
| [`valueSourceSelector`](#valuesourceselector) | <code>React.ComponentType&lt;ValueSourceSelectorProps&gt;</code>                                                 |

#### `addGroupAction`

Default is [`ActionElement`](./actionelement). Receives the following props per the `ActionWithRulesAndAddersProps` interface:

| Prop            | Type                                           | Description                                                  |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| `label`         | `string`                                       | `translations.addGroup.label`, e.g. "+Group"                 |
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

#### `addRuleAction`

Default is [`ActionElement`](./actionelement). Receives the following props per the `ActionWithRulesAndAddersProps` interface:

| Prop            | Type                                           | Description                                                  |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| `label`         | `string`                                       | `translations.addRule.label`, e.g. "+Rule"                   |
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

#### `cloneGroupAction`

Default is [`ActionElement`](./actionelement). Receives the following props per the `ActionWithRulesProps` interface:

| Prop            | Type                                     | Description                                                  |
| --------------- | ---------------------------------------- | ------------------------------------------------------------ |
| `label`         | `string`                                 | `translations.cloneRuleGroup.label`, e.g. "⧉"                |
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

#### `cloneRuleAction`

Default is [`ActionElement`](./actionelement). Receives the following props per the `ActionProps` interface:

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

#### `combinatorSelector`

Default is [`ValueSelector`](./valueselector). Receives the following props per the `CombinatorSelectorProps` interface:

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

#### `dragHandle`

Default is [`DragHandle`](./draghandle). Only rendered if [drag-and-drop is enabled](#enabledraganddrop). Note that this component must be based on `React.forwardRef`. Receives the forwarded `ref` and the following props per the `DragHandleProps` interface:

| Prop          | Type                                      | Description                                                  |
| ------------- | ----------------------------------------- | ------------------------------------------------------------ |
| `label`       | `string`                                  | `translations.dragHandle.label`, e.g. "⁞⁞"                   |
| `title`       | `string`                                  | `translations.dragHandle.title`, e.g. "Drag handle"          |
| `className`   | `string`                                  | CSS `classNames` to be applied                               |
| `level`       | `number`                                  | The `level` of this rule/group                               |
| `context`     | `any`                                     | Container for custom props that are passed to all components |
| `validation`  | <code>boolean \| ValidationResult</code>  | Validation result of this rule/group                         |
| `disabled`    | `boolean`                                 | Whether this rule/group is disabled/locked                   |
| `path`        | `Path`                                    | [Path](../tips/path) of this rule/group                      |
| `schema`      | `Schema`                                  | Query [schema](../typescript#miscellaneous)                  |
| `ruleOrGroup` | <code>RuleGroupTypeAny \| RuleType</code> | This group or rule, depending on the parent component        |

#### `fieldSelector`

Default is [`ValueSelector`](./valueselector). Receives the following props per the `FieldSelectorProps` interface:

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

#### `inlineCombinator`

A small wrapper around the [`combinatorSelector`](#combinatorselector) component. Receives the following props per the `InlineCombinatorProps` interface (which extends `CombinatorSelectorProps`):

| Prop                     | Type                                       | Description                                                       |
| ------------------------ | ------------------------------------------ | ----------------------------------------------------------------- |
| `component`              | `Schema['controls']['combinatorSelector']` | Same as the `combinatorSelector` component                        |
| `independentCombinators` | <code>boolean \| undefined</code>          | Same as `independentCombinators` prop passed in to `QueryBuilder` |

#### `lockGroupAction`

Default is [`ActionElement`](./actionelement). Receives the following props per the `ActionWithRulesProps` interface:

| Prop                  | Type                                     | Description                                                                                                            |
| --------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `label`               | `string`                                 | `translations.lockGroup.label` or `translations.lockGroupDisabled.label`, e.g. "🔓" when unlocked and "🔒" when locked |
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

#### `lockRuleAction`

Default is [`ActionElement`](./actionelement). Receives the following props per the `ActionWithRulesProps` interface:

| Prop                  | Type                                     | Description                                                                                                          |
| --------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `label`               | `string`                                 | `translations.lockRule.label` or `translations.lockRuleDisabled.label`, e.g. "🔓" when unlocked and "🔒" when locked |
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

#### `notToggle`

Default is [`NotToggle`](./nottoggle). Receives the following props per the `NotToggleProps` interface:

| Prop             | Type                                     | Description                                                  |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------ |
| `label`          | `string`                                 | `translations.notToggle.label`, e.g. "Not"                   |
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

#### `operatorSelector`

Default is [`ValueSelector`](./valueselector). Receives the following props per the `OperatorSelectorProps` interface:

| Prop             | Type                                     | Description                                                      |
| ---------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| `field`          | `string`                                 | Field name corresponding to this rule                            |
| `fieldData`      | `Field`                                  | The entire object from the fields array for this field           |
| `options`        | <code>OptionList&lt;Operator&gt;</code>  | Return value of getOperators(field)                              |
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

#### `removeGroupAction`

Default is [`ActionElement`](./actionelement). Receives the following props per the `ActionWithRulesProps` interface:

| Prop            | Type                                     | Description                                                  |
| --------------- | ---------------------------------------- | ------------------------------------------------------------ |
| `label`         | `string`                                 | `translations.removeGroup.label`, e.g. "x"                   |
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

#### `removeRuleAction`

Default is [`ActionElement`](./actionelement). Receives the following props per the `ActionProps` interface:

| Prop            | Type                                     | Description                                                  |
| --------------- | ---------------------------------------- | ------------------------------------------------------------ |
| `label`         | `string`                                 | `translations.removeRule.label`, e.g. "x"                    |
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

#### `rule`

Default is [`Rule`](./rule). Receives the following props per the `RuleProps` interface:

| Prop             | Type           | Description                                                  |
| ---------------- | -------------- | ------------------------------------------------------------ |
| `id`             | `string`       | Unique identifier for this rule                              |
| `path`           | `Path`         | [Path](../tips/path) of this rule                            |
| `rule`           | `RuleType`     | The rule object                                              |
| `translations`   | `Translations` | The default translations merged with the `translations` prop |
| `schema`         | `Schema`       | Query [schema](../typescript#miscellaneous)                  |
| `actions`        | `QueryActions` | Query [update functions](../typescript#miscellaneous)        |
| `context`        | `any`          | Container for custom props that are passed to all components |
| `disabled`       | `boolean`      | Whether the rule itself is disabled                          |
| `parentDisabled` | `boolean`      | Whether the parent group of this rule is disabled            |

:::tip

If you [enable drag-and-drop](#enabledraganddrop) and want to use a custom `Rule` component, use the `controlElements` prop on the `QueryBuilderDnD` context provider instead of `QueryBuilder`.

:::

#### `ruleGroup`

Default is [`RuleGroup`](./rulegroup). Receives the following props per the `RuleGroupProps` interface:

| Prop             | Type               | Description                                                  |
| ---------------- | ------------------ | ------------------------------------------------------------ |
| `id`             | `string`           | Unique identifier for this group                             |
| `path`           | `Path`             | [Path](../tips/path) of this group                           |
| `ruleGroup`      | `RuleGroupTypeAny` | The group object                                             |
| `translations`   | `Translations`     | The default translations merged with the `translations` prop |
| `schema`         | `Schema`           | Query [schema](../typescript#miscellaneous)                  |
| `actions`        | `QueryActions`     | Query [update functions](../typescript#miscellaneous)        |
| `context`        | `any`              | Container for custom props that are passed to all components |
| `disabled`       | `boolean`          | Whether the group itself is disabled                         |
| `parentDisabled` | `boolean`          | Whether the parent group of this group is disabled           |

:::tip

If you [enable drag-and-drop](#enabledraganddrop) and want to use a custom `RuleGroup` component, use the `controlElements` prop on the `QueryBuilderDnD` context provider instead of `QueryBuilder`.

:::

#### `valueEditor`

Default is [`ValueEditor`](./valueeditor). Receives the following props per the `ValueEditorProps` interface:

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
| `parseNumbers`   | `boolean`                                | Whether to parse real numbers from strings                              |
| `separator`      | `ReactNode`                              | Separator element for series of editors (i.e. "between" operator)       |
| `level`          | `number`                                 | The `level` of this rule                                                |
| `context`        | `any`                                    | Container for custom props that are passed to all components            |
| `validation`     | <code>boolean \| ValidationResult</code> | Validation result of this rule                                          |
| `disabled`       | `boolean`                                | Whether this rule is disabled/locked                                    |
| `path`           | `Path`                                   | [Path](../tips/path) of this rule                                       |
| `schema`         | `Schema`                                 | Query [schema](../typescript#miscellaneous)                             |
| `rule`           | `RuleType`                               | This rule                                                               |

#### `valueSourceSelector`

Default is [`ValueSelector`](./valueselector). Receives the following props per the `ValueSourceSelectorProps` interface:

| Prop             | Type                                             | Description                                                      |
| ---------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| `field`          | `string`                                         | Field `name` corresponding to this rule                          |
| `fieldData`      | `Field`                                          | The entire object from the `fields` array for the selected field |
| `options`        | <code>OptionList&lt;ValueSourceOption&gt;</code> | Return value of `getValueSources(field, operator)`               |
| `value`          | `ValueSource`                                    | Selected value source for this rule, if any                      |
| `title`          | `string`                                         | `translations.valueSourceSelector.title`, e.g. "Value source"    |
| `className`      | `string`                                         | CSS `classNames` to be applied                                   |
| `handleOnChange` | `(value: any) => void`                           | Updates the rule's `valueSource`                                 |
| `level`          | `number`                                         | The `level` of this rule                                         |
| `context`        | `any`                                            | Container for custom props that are passed to all components     |
| `validation`     | <code>boolean \| ValidationResult</code>         | Validation result of this rule                                   |
| `disabled`       | `boolean`                                        | Whether this rule is disabled/locked                             |
| `path`           | `Path`                                           | [Path](../tips/path) of this rule                                |
| `schema`         | `Schema`                                         | Query [schema](../typescript#miscellaneous)                      |
| `rule`           | `RuleType`                                       | This rule                                                        |

### `getOperators`

`(field: string) => OptionList<Operator> | null`

This function is invoked to get the list of allowed operators for the given `field`. If `null` is returned, the [operators](#operators) prop is used (or the default operators if the `operators` prop is not defined).

### `getValueEditorType`

`(field: string, operator: string) => ValueEditorType`

This function is invoked to get the type of [`ValueEditor`](./valueeditor) for the given `field` and `operator`. Allowed values are `"text"` (the default if the function is not provided or if `null` is returned), `"select"`, `"multiselect"`, `"checkbox"`, `"radio"`, `"textarea"`, and `"switch"`.

### `getValueSources`

`(field: string, operator: string) => ValueSources`;

This function is invoked to get the list of allowed value sources for a given `field` and `operator`. The return value must be an array with one or two elements: `"value"`, `"field"`, or both (in either order). If the prop is not defined, `() => ["value"]` is used. The first element in the array will be the initial selection.

### `getValueEditorSeparator`

`(field: string, operator: string) => ReactNode`;

This function should return the separator element for a given `field` and `operator`. It will be placed in between value editors when multiple are rendered, e.g. when the operator is "between". The element can be any valid React element, including a plain string (e.g. "and" or "to") or an HTML element like `<span />`.

### `getInputType`

`(field: string, operator: string) => string`

This function is invoked to get the `type` attribute which will be applied to the rendered `<input />` for the given `field` and `operator`. This prop is only applicable when [`getValueEditorType`](#getvalueeditortype) returns `"text"` or a falsy value. If no function is provided, `"text"` is used.

### `getValues`

`(field: string, operator: string) => OptionList`

This function is invoked to get the list of allowed values for the given `field` and `operator`. This prop is only applicable when [`getValueEditorType`](#getvalueeditortype) returns `"select"`, `"multiselect"`, or `"radio"`. If no function is provided, an empty array is used.

### `getDefaultField`

`string | ((fieldsData: OptionList<Field>) => string)`

The default `field` for new rules. This can be a field `name` or a function that returns a field `name` based on the `fields` prop.

### `getDefaultOperator`

`string | ((field: string) => string)`

The default `operator` for new rules. This can be an operator `name` or a function that returns an operator `name`.

### `getDefaultValue`

`(rule: RuleType) => any`

This function returns the default `value` for new rules based on the existing rule properties.

### `getRuleClassname`

`(rule: RuleType) => Classname`

Generate custom classes which will be added to the outer `div` of a rule based on the rule properties.

### `getRuleGroupClassname`

`(ruleGroup: RuleGroupTypeAny) => Classname`

Generate custom classes which will be added to the outer `div` of a group based on the group properties.

### `onAddRule`

`(rule: RuleType, parentPath: Path, query: RuleGroupTypeAny, context?: any) => RuleType | false`

This callback is invoked immediately before a new rule is added. The function should either manipulate the rule and return it as an object of type `RuleType` or return `false` to cancel the addition of the rule. You can use [`findPath`](../utils/misc#findpath) to locate the parent group to which the new rule will be added within the query hierarchy. The `context` parameter (fourth argument) can be passed from a custom [`addRuleAction`](#addruleaction) component to its `onHandleClick` prop, which will in turn pass it to `onAddRule`. This allows one to change the rule that gets added (or avoid the action completely) based on arbitrary data.

If [`independentCombinators`](#independentcombinators) is enabled, you can specify the combinator inserted immediately before the new rule (if the parent group is not empty) by adding a `combinatorPreceding` property (with a combinator `name` as the value) to the rule before returning it. Otherwise the combinator preceding the last rule, or the first combinator in the default list if the parent group has only one rule, will be used.

:::tip

To completely [prevent the addition of new rules](../tips/limit-groups), pass `controlElements={{ addRuleAction: () => null }}` which will prevent the "+Rule" button from rendering.

:::

### `onAddGroup`

`<RG extends RuleGroupTypeAny>(ruleGroup: RG, parentPath: Path, query: RG, context?: any) => RG | false`

This callback is invoked before a new group is added. The function should either manipulate the group and return it as an object of the same type (either `RuleGroupType` or `RuleGroupTypeIC`), or return `false` to cancel the addition of the group. You can use [`findPath`](../utils/misc#findpath) to locate the parent group to which the new group will be added within the query hierarchy. The `context` parameter (fourth argument) can be passed from a custom [`addGroupAction`](#addgroupaction) component to its `onHandleClick` prop, which will in turn pass it to `onAddGroup`. This allows one to change the group that gets added (or avoid the action completely) based on arbitrary data.

If [`independentCombinators`](#independentcombinators) is enabled, you can specify the combinator inserted immediately before the new group (if the parent group is not empty) by adding a `combinatorPreceding` property (with a combinator `name` as the value) to the group before returning it. Otherwise the combinator preceding the last rule, or the first combinator in the default list if the parent group has only one rule, will be used.

:::tip

To completely [prevent the addition of new groups](../tips/limit-groups), pass `controlElements={{ addGroupAction: () => null }}` which will prevent the "+Group" button from rendering.

:::

### `onRemove`

`<RG extends RuleGroupTypeAny>(ruleOrGroup: RG | RuleType, path: Path, query: RG, context?: any) => boolean`

This callback is invoked before a rule or group is removed. The function should return `true` if the removal should proceed as normal, or `false` if the removal should be aborted.

### `translations`

`Partial<Translations>`

This prop provides basic internationalization (i18n) support. It can be used to override translatable texts applied to the various controls created by the `<QueryBuilder />` component for a specific locale.

All keys in the object and all properties within each key are optional. The `translations` prop object will be deep-merged with the default object below.

```json
{
  "fields": {
    "title": "Fields",
    "placeholderName": "~",
    "placeholderLabel": "------",
    "placeholderGroupLabel": "------"
  },
  "operators": {
    "title": "Operators",
    "placeholderName": "~",
    "placeholderLabel": "------",
    "placeholderGroupLabel": "------"
  },
  "value": {
    "title": "Value"
  },
  "removeRule": {
    "label": "x",
    "title": "Remove rule"
  },
  "removeGroup": {
    "label": "x",
    "title": "Remove group"
  },
  "addRule": {
    "label": "+Rule",
    "title": "Add rule"
  },
  "addGroup": {
    "label": "+Group",
    "title": "Add group"
  },
  "combinators": {
    "title": "Combinators"
  },
  "notToggle": {
    "label": "Not",
    "title": "Invert this group"
  },
  "cloneRule": {
    "label": "⧉",
    "title": "Clone rule"
  },
  "cloneRuleGroup": {
    "label": "⧉",
    "title": "Clone group"
  },
  "dragHandle": {
    "label": "⁞⁞",
    "title": "Drag handle"
  },
  "lockRule": {
    "label": "🔓",
    "title": "Lock rule"
  },
  "lockGroup": {
    "label": "🔓",
    "title": "Lock group"
  },
  "lockRuleDisabled": {
    "label": "🔒",
    "title": "Unlock rule"
  },
  "lockGroupDisabled": {
    "label": "🔒",
    "title": "Unlock group"
  }
}
```

### `showCombinatorsBetweenRules`

`boolean` (default `false`) _<DemoLink option="showCombinatorsBetweenRules" />_

Pass `true` to render the combinator selector between each child rule/group in the group body instead of in the group header. This can make some queries easier to understand as it encourages a more natural style of reading.

Note that when this option is enabled, the `combinator` property is still managed at the group level even though selectors are displayed among the rules. Selecting a new combinator with one of the inline selectors will update all combinator selectors within the same group since they all use the same value. To display inline combinator selectors that are managed independently, use the [`independentCombinators`](#independentcombinators) prop.

### `showNotToggle`

`boolean` (default `false`) _<DemoLink option="showNotToggle" />_

Pass `true` to display the "Not" (aka inversion) toggle switch for each rule group.

### `showCloneButtons`

`boolean` (default `false`) _<DemoLink option="showCloneButtons" />_

Pass `true` to display a "clone" button on each group header and rule. Clicking a "clone" button will create an exact duplicate (with new `id`/`id`s) of the rule or group, positioned immediately after the original, within the same `rules` array.

### `showLockButtons`

`boolean` (default `false`) _<DemoLink option="showLockButtons" />_

Pass `true` to display the "Lock rule" and "Lock group" buttons. When a rule is locked, all elements within the rule will be disabled except for the lock button itself (so the user can unlock the rule). When a group is locked, all elements within the group header (except the lock button itself), as well as all child rule/group elements (including their lock buttons), will be disabled.

### `resetOnFieldChange`

`boolean` (default `true`) _<DemoLink option="resetOnFieldChange" disabled />_

Pass `false` to avoid resetting the `operator` and `value` when the `field` is updated.

### `resetOnOperatorChange`

`boolean` (default `false`) _<DemoLink option="resetOnOperatorChange" />_

Pass `true` to reset the `value` when the `operator` is updated.

### `enableMountQueryChange`

`boolean` (default `true`)

Pass `false` to disable the `onQueryChange` call on initial mount of the component. This is enabled by default because the `query`/`defaultQuery` prop is processed during the first render and may be slightly different than the object passed in (`id`s would have been generated if they were missing, for example).

### `autoSelectField`

`boolean` (default `true`) _<DemoLink option="autoSelectField" disabled />_

Pass `false` to automatically add an "empty" option (value `"~"` and label `"------"`; see [`translations.fields.placeholder*` to customize](#translations)) to the `fields` array as the first element. The "empty" option will be the initial field selection for all new rules. When the empty `field` option is selected, the operator selector and value components will not be rendered for that rule.

### `autoSelectOperator`

`boolean` (default `true`) _<DemoLink option="autoSelectOperator" disabled />_

Pass `false` to automatically add an "empty" option (value `"~"` and label `"------"`; see [`translations.operators.placeholder*` to customize](#translations)) to the `operators` array as the first element. The "empty" option will be the initial operator selection for all new rules. When the empty `operator` option is selected, the value components will not be rendered for that rule.

### `addRuleToNewGroups`

`boolean` (default `false`) _<DemoLink option="addRuleToNewGroups" />_

Pass `true` to automatically add a rule to new groups. If neither a `query` nor `defaultQuery` prop is not passed in, a rule will be added to the root group when the component is mounted. If a `query`/`defaultQuery` prop is passed in with an empty `rules` array, no rule will be added automatically.

### `listsAsArrays`

`boolean` (default `false`) _<DemoLink option="listsAsArrays" />_

Pass `true` to update rule values that represent lists with proper arrays instead of comma-separated strings. This prop applies when `valueEditorType` is `"multiselect"` and when a rule's `operator` is `"between"`, `"notBetween"`, `"in"`, or `"notIn"`.

For example, the default behavior for the "between" operator might produce this rule:

```json {4}
{
  "field": "f1",
  "operator": "between",
  "value": "f2,f3",
  "valueSource": "field"
}
```

When `listsAsArrays` is true, the rule's `value` will be an array:

```json {4}
{
  "field": "f1",
  "operator": "between",
  "value": ["f2", "f3"],
  "valueSource": "field"
}
```

### `parseNumbers`

`boolean | "strict" | "native"` (default `false`) _<DemoLink option="parseNumbers" />_

Pass `true`, `"strict"`, or `"native"` to store `value` as a `number` instead of a string (when possible). Passing `"native"` will use `parseFloat` to determine if a value is numeric, while `true` or `"strict"` will use a more strict algorithm that requires the value to be numeric in its entirety (not just _start_ with a number as `parseFloat` requires). See more information in the [note about the corresponding `formatQuery` option](../utils/export#parse-numbers).

### `independentCombinators`

`boolean` (default `false`) _<DemoLink option="independentCombinators" />_

Pass `true` to insert an independent combinator selector between each child rule/group within the body of a group. A combinator selector will not be rendered in group headers.

Visually, this option has a similar effect as the [`showCombinatorsBetweenRules`](#showcombinatorsbetweenrules) option, except that each combinator selector is independently controlled. You may find that users take to this configuration more easily, as it can allow them to express queries more like they would in natural language.

:::caution

When the `independentCombinators` option is enabled, the `query` (or `defaultQuery`) prop _must_ be of type `RuleGroupTypeIC` instead of the default `RuleGroupType`. See [`onQueryChange`](#onquerychange) above, or the [Rules and groups section](../typescript#rules-and-groups) of the TypeScript documentation for more information.

:::

### `enableDragAndDrop`

`boolean` (default `false`) _<DemoLink option="enableDragAndDrop" />_

:::caution

This prop does not need to be set directly on the `<QueryBuilder />` component. It has no effect unless the following conditions are met:

1. A `QueryBuilderDnD` context provider from the companion package [`@react-querybuilder/dnd`](https://www.npmjs.com/package/@react-querybuilder/dnd) is rendered higher up in the component tree.
2. [`react-dnd`](https://www.npmjs.com/package/react-dnd) and [`react-dnd-html5-backend`](https://www.npmjs.com/package/react-dnd-html5-backend) are installed/imported.

If those conditions are met, and `enableDragAndDrop` is not explicitly set to `false` on the `<QueryBuilder />` component, then `enableDragAndDrop` is implicitly `true`.

:::

When `true` (under the conditions detailed above), a [drag handle](./draghandle) is displayed on the left-hand side of each group header and each rule. Clicking and dragging the handle element allows users to visually reorder the rules and groups.

#### Recommended usage

```bash
npm i react-querybuilder @react-querybuilder/dnd react-dnd react-dnd-html5-backend
# OR yarn add / pnpm add / bun add
```

```tsx
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import * as ReactDnD from 'react-dnd';
import * as ReactDndHtml5Backend from 'react-dnd-html5-backend';
import { QueryBuilder } from 'react-querybuilder';

const App = () => (
  <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDndHtml5Backend }}>
    <QueryBuilder />
  </QueryBuilderDnD>
);
```

:::tip

If your application already uses [`react-dnd`](https://react-dnd.github.io/react-dnd/), use `QueryBuilderDndWithoutProvider` instead of `QueryBuilderDnD`. They are functionally equivalent, but the former assumes a `<DndProvider />` already exists higher up in the component tree. The latter renders its own `DndProvider` which will conflict with any pre-existing ones. (If you use the wrong component, you will probably see the error message "Cannot have two HTML5 backends at the same time" in the console.)

:::

### `disabled`

:::caution[Deprecated]

Use the `disabled` property on rules and groups within the query object instead.

:::

`boolean | Path[]` (default `false`) _<DemoLink option="disabled" />_

Pass `true` to disable all subcomponents and prevent changes to the query. Pass an array of paths to disable specific rules and/or groups. For example, `disabled={[[0]]}` will disable the top-most rule/group and its subcomponents, but nothing else.

### `debugMode`

`boolean` (default `false`) _<DemoLink option="debugMode" />_

Pass `true` to enabled logging debug information with the [`onLog` function](#onlog).

### `onLog`

`(message: any) => void` (default `console.log`)

Receives logging messages when [`debugMode`](#debugmode) is `true`.

### `idGenerator`

`() => string` (default `generateID`)

Used to generate `id`s for rules and groups without them (or clones that need a new `id`). By default, `QueryBuilder` generates valid v4 UUIDs per [RFC 4122](https://www.rfc-editor.org/rfc/rfc4122), using the `crypto` package if available or a `Math.random()`-based method otherwise.

### `validator`

`QueryValidator` _<DemoLink option="validateQuery" />_

This function is executed each time `QueryBuilder` renders. The return value should be a boolean (`true` for valid queries, `false` for invalid) or an object whose keys are the `id`s of each validated rule and group in the query tree. If an object is returned, the values associated to each key should be a boolean (`true` for valid rules/groups, `false` for invalid) or an object with a `valid` boolean property and an optional `reasons` array. The full object will be passed to each rule and group component, and all sub-components of each rule/group will receive the value associated with the `id` of its rule or group. See the [validation documentation](../utils/validation) for more information.
