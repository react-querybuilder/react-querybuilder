---
title: API
---

The default export of `react-querybuilder` is the `<QueryBuilder />` React component.

## `<QueryBuilder />` props

### `fields`

`Field[]` **-- REQUIRED**

The array of fields that should be used. Each field should be an object with the following signature:

```ts
interface Field {
  id?: string; // The field identifier (if not provided, then `name` will be used)
  name: string; // REQUIRED - the field name
  label: string; // REQUIRED - the field label
  operators?: { name: string; label: string }[]; // Array of operators (if not provided, then `getOperators()` will be used)
  valueEditorType?: 'text' | 'select' | 'checkbox' | 'radio' | null; // Value editor type for this field (if not provided, then `getValueEditorType()` will be used)
  inputType?: string | null; // Input type for text box inputs, e.g. 'text', 'number', or 'date' (if not provided, then `getInputType()` will be used)
  values?: { name: string; label: string }[]; // Array of values, applicable when valueEditorType is 'select' or 'radio' (if not provided, then `getValues()` will be used)
  defaultOperator?: string; // Default operator for this field (if not provided, then `getDefaultOperator()` will be used)
  defaultValue?: any; // Default value for this field (if not provided, then `getDefaultValue()` will be used)
  placeholder?: string; // Value to be displayed in the placeholder of the text field
  validator?(): boolean | ValidationResult; // Called when a rule specifies this field (see the [main validator prop](#validator) for more information)
}
```

Field objects can also contain other data. Each field object will be passed to the appropriate `OperatorSelector` and `ValueEditor` components as `fieldData` (see the section on [`controlElements`](#controlelements)).

### `query`

`{ id?: string; combinator: string; rules: ({ field: string; operator: string; value: any; } | { combinator: string; rules: ...[]; })[]; }`

The initial query, in JSON form (follows the same format as the parameter passed to the [`onQueryChange`](#onquerychange) callback). `id` is optional. See [the demo source](https://github.com/react-querybuilder/react-querybuilder/blob/master/demo/main.tsx) for examples.

### `context`

`any`

A "bucket" for passing arbitrary props down to custom components. The `context` prop is passed to each and every component, so it's accessible anywhere in the `QueryBuilder` component tree.

### `operators`

`{ name: string; label: string; }[]`

The array of operators that should be used. The default operators include:

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
  { name: 'notBetween', label: 'not between' }
];
```

### `combinators`

`{ name: string, label: string; }[]`

The array of combinators that should be used for RuleGroups. The default set includes:

```ts
[
  { name: 'and', label: 'AND' },
  { name: 'or', label: 'OR' }
];
```

### `controlElements`

```ts
interface Controls {
  addGroupAction?: React.ComponentType<ActionWithRulesProps>;
  addRuleAction?: React.ComponentType<ActionWithRulesProps>;
  cloneGroupAction?: React.ComponentType<ActionWithRulesProps>;
  cloneRuleAction?: React.ComponentType<ActionProps>;
  combinatorSelector?: React.ComponentType<CombinatorSelectorProps>;
  fieldSelector?: React.ComponentType<FieldSelectorProps>;
  notToggle?: React.ComponentType<NotToggleProps>;
  operatorSelector?: React.ComponentType<OperatorSelectorProps>;
  removeGroupAction?: React.ComponentType<ActionWithRulesProps>;
  removeRuleAction?: React.ComponentType<ActionProps>;
  rule?: React.ComponentType<RuleProps>;
  ruleGroup?: React.ComponentType<RuleGroupProps>;
  valueEditor?: React.ComponentType<ValueEditorProps>;
}
```

This is a custom controls object that allows you to override the control elements used. The following control overrides are supported:

- `addGroupAction`: By default a `<button />` is used. The following props are passed:

```ts
interface ActionWithRulesProps {
  label: string; // translations.addGroup.label, e.g. "+Group"
  title: string; // translations.addGroup.title, e.g. "Add group"
  className: string; // CSS classNames to be applied
  handleOnClick: (e: React.MouseEvent) => void; // Callback function to invoke adding a <RuleGroup />
  rules: (RuleGroupType | RuleType)[]; // Provides the number of rules already present for this group
  level: number; // The level of the current group
  context: any; // Container for custom props that are passed to all components
  validation: boolean | ValidationResult; // validation result of this group
}
```

- `cloneGroupAction`: By default a `<button />` is used. The following props are passed:

```ts
interface ActionWithRulesProps {
  label: string; // translations.addGroup.label, e.g. "+Group"
  title: string; // translations.addGroup.title, e.g. "Add group"
  className: string; // CSS classNames to be applied
  handleOnClick: (e: React.MouseEvent) => void; // Callback function to invoke adding a <RuleGroup />
  rules: (RuleGroupType | RuleType)[]; // Provides the number of rules already present for this group
  level: number; // The level of the current group
  context: any; // Container for custom props that are passed to all components
  validation: boolean | ValidationResult; // validation result of this group
}
```

- `removeGroupAction`: By default a `<button />` is used. The following props are passed:

```ts
interface ActionWithRulesProps {
  label: string; // translations.removeGroup.label, e.g. "x"
  title: string; // translations.removeGroup.title, e.g. "Remove group"
  className: string; // CSS classNames to be applied
  handleOnClick: (e: React.MouseEvent) => void; // Callback function to invoke adding a <RuleGroup />
  rules: (RuleGroupType | RuleType)[]; // Provides the number of rules already present for this group
  level: number; // The level of the current group
  context: any; // Container for custom props that are passed to all components
  validation: boolean | ValidationResult; // validation result of this group
}
```

- `addRuleAction`: By default a `<button />` is used. The following props are passed:

```ts
interface ActionWithRulesProps {
  label: string; // translations.addGroup.label, e.g. "+Rule"
  title: string; // translations.addGroup.title, e.g. "Add rule"
  className: string; // CSS classNames to be applied
  handleOnClick: (e: React.MouseEvent) => void; // Callback function to invoke adding a <RuleGroup />
  rules: (RuleGroupType | RuleType)[]; // Provides the number of rules already present for this group
  level: number; // The level of the current group
  context: any; // Container for custom props that are passed to all components
  validation: boolean | ValidationResult; // validation result of this group
}
```

- `cloneRuleAction`: By default a `<button />` is used. The following props are passed:

```ts
interface ActionProps {
  label: string; // translations.addGroup.label, e.g. "+Rule"
  title: string; // translations.addGroup.title, e.g. "Add rule"
  className: string; // CSS classNames to be applied
  handleOnClick: (e: React.MouseEvent) => void; // Callback function to invoke adding a <RuleGroup />
  level: number; // The level of the current group
  context: any; // Container for custom props that are passed to all components
  validation: boolean | ValidationResult; // validation result of this rule
}
```

- `removeRuleAction`: By default a `<button />` is used. The following props are passed:

```ts
interface ActionProps {
  label: string; // translations.removeRule.label, e.g. "x"
  title: string; // translations.removeRule.title, e.g. "Remove rule"
  className: string; // CSS classNames to be applied
  handleOnClick: (e: React.MouseEvent) => void; // Callback function to invoke adding a <RuleGroup />
  level: number; // The level of the current group
  context: any; // Container for custom props that are passed to all components
  validation: boolean | ValidationResult; // validation result of this rule
}
```

- `combinatorSelector`: By default a `<select />` is used. The following props are passed:

```ts
interface CombinatorSelectorProps {
  options: { name: string; label: string }[]; // Same as 'combinators' passed into QueryBuilder
  value: string; // Selected combinator from the existing query representation, if any
  className: string; // CSS classNames to be applied
  handleOnChange: (value: any) => void; // Callback function to update query representation
  rules: (RuleGroupType | RuleType)[]; // Provides the number of rules already present for this group
  level: number; // The level of the current group
  context: any; // Container for custom props that are passed to all components
  validation: boolean | ValidationResult; // validation result of this group
}
```

- `fieldSelector`: By default a `<select />` is used. The following props are passed:

```ts
interface FieldSelectorProps {
  options: Field[]; // Same as 'fields' passed into QueryBuilder
  value: string; // Selected field from the existing query representation, if any
  title: string; // translations.fields.title, e.g. "Fields"
  operator: string; // Selected operator from the existing query representation, if any
  className: string; // CSS classNames to be applied
  handleOnChange: (value: any) => void; // Callback function to update query representation
  level: number; // The level the group this rule belongs to
  context: any; // Container for custom props that are passed to all components
  validation: boolean | ValidationResult; // validation result of this rule
}
```

- `operatorSelector`: By default a `<select />` is used. The following props are passed:

```ts
interface OperatorSelectorProps {
  field: string; // Field name corresponding to this rule
  fieldData: Field; // The entire object from the fields array for this field
  options: { name: string; label: string }[]; // Return value of getOperators(field)
  value: string; // Selected operator from the existing query representation, if any
  title: string; // translations.operators.title, e.g. "Operators"
  className: string; // CSS classNames to be applied
  handleOnChange: (value: any) => void; // Callback function to update query representation
  level: number; // The level the group this rule belongs to
  context: any; // Container for custom props that are passed to all components
  validation: boolean | ValidationResult; // validation result of this rule
}
```

- `valueEditor`: By default an `<input type="text" />` is used. The following props are passed:

```ts
interface ValueEditorProps {
  field: string; // Field name corresponding to this rule
  fieldData: Field; // The entire object from the fields array for this field
  operator: string; // Operator name corresponding to this rule
  value: string; // Value from the existing query representation, if any
  title: string; // translations.value.title, e.g. "Value"
  handleOnChange: (value: any) => void; // Callback function to update the query representation
  type: 'text' | 'select' | 'checkbox' | 'radio'; // Type of editor to be displayed
  inputType: string; // @type of <input> if `type` is "text"
  values: any[]; // List of available values for this rule
  level: number; // The level the group this rule belongs to
  className: string; // CSS classNames to be applied
  context: any; // Container for custom props that are passed to all components
  validation: boolean | ValidationResult; // validation result of this rule
}
```

- `notToggle`: By default, `<label><input type="checkbox" />Not</label>` is used. The following props are passed:

```ts
interface NotToggleProps {
  checked: boolean; // Whether the input should be checked or not
  handleOnChange: (checked: boolean) => void; // Callback function to update the query representation
  title: string; // translations.notToggle.title, e.g. "Invert this group"
  level: number; // The level of the group
  className: string; // CSS classNames to be applied
  context: any; // Container for custom props that are passed to all components
  validation: boolean | ValidationResult; // validation result of this group
}
```

- `ruleGroup`: By default, `<RuleGroup />` is used. The following props are passed:

```ts
interface RuleGroupProps {
  id?: string; // Unique identifier for this rule group
  path: number[]; // path of indexes through a rule group hierarchy
  combinator: string; // Combinator for this group, e.g. "and" / "or"
  rules: (RuleType | RuleGroupType)[]; // List of rules and/or sub-groups for this group
  translations: Translations; // The full translations object
  schema: Schema; // See `Schema` documentation below
  not: boolean; // Whether or not to invert this group
  context: any; // Container for custom props that are passed to all components
}
```

- `rule`: By default, `<Rule />` is used. The following props are passed:

```ts
interface RuleProps {
  id?: string; // Unique identifier for this rule
  path: number[]; // path of indexes through a rule group hierarchy
  field: string; // Field name for this rule
  operator: string; // Operator name for this rule
  value: any; // Value for this rule
  translations: Translations; // The full translations object
  schema: Schema; // See `Schema` documentation below
  context: any; // Container for custom props that are passed to all components
}
```

The `Schema` object passed in the `rule` and `ruleGroup` props has the following signature:

```ts
interface Schema {
  fields: Field[];
  fieldMap: { [k: string]: Field };
  classNames: Classnames;
  combinators: { name: string; label: string }[];
  controls: Controls;
  createRule(): RuleType;
  createRuleGroup(): RuleGroupTypeAny;
  getOperators(field: string): { name: string; label: string }[];
  getValueEditorType(field: string, operator: string): ValueEditorType;
  getInputType(field: string, operator: string): string | null;
  getValues(field: string, operator: string): { name: string; label: string }[];
  isRuleGroup(ruleOrGroup: RuleType | RuleGroupTypeAny): ruleOrGroup is RuleGroupTypeAny;
  onGroupAdd(group: RuleGroupTypeAny, parentPath: number[]): void;
  onGroupRemove(path: number[]): void;
  onPropChange(
    prop: Exclude<keyof RuleType | keyof RuleGroupType, 'id' | 'path'>,
    value: any,
    path: number[]
  ): void;
  onRuleAdd(rule: RuleType, parentPath: number[]): void;
  onRuleRemove(path: number[]): void;
  updateInlineCombinator(value: string, path: number[]): void;
  showCombinatorsBetweenRules: boolean;
  showNotToggle: boolean;
  showCloneButtons: boolean;
  autoSelectField: boolean;
  addRuleToNewGroups: boolean;
  validationMap: ValidationMap;
  inlineCombinators: boolean;
}
```

### `getOperators`

`(field: string) => { name: string; label: string; }[] | null`

This is a callback function invoked to get the list of allowed operators for the given field. If `null` is returned, the default operators are used.

### `getValueEditorType`

`(field: string, operator: string) => 'text' | 'select' | 'checkbox' | 'radio' | null`

This is a callback function invoked to get the type of `ValueEditor` for the given field and operator. Allowed values are `"text"` (the default if the function is not provided or if `null` is returned), `"select"`, `"checkbox"`, and `"radio"`.

### `getInputType`

`(field: string, operator: string) => string`

This is a callback function invoked to get the `type` of `<input />` for the given field and operator (only applicable when `getValueEditorType` returns `"text"` or a falsy value). If no function is provided, `"text"` is used as the default.

### `getValues`

`(field: string, operator: string) => { name: string; label: string; }[]`

This is a callback function invoked to get the list of allowed values for the given field and operator (only applicable when `getValueEditorType` returns `"select"` or `"radio"`). If no function is provided, an empty array is used as the default.

### `getDefaultField`

`string | ((fieldsData: Field[]) => string)`

The default field for new rules. This can be a string identifying the default field, or a function that returns a field name.

### `getDefaultOperator`

`string | ((field: string) => string)`

The default operator for new rules. This can be a string identifying the default operator, or a function that returns an operator name.

### `getDefaultValue`

`(rule: RuleType) => any`

This function returns the default value for new rules.

### `onAddRule`

`(rule: RuleType, parentPath: number[], query: RuleGroupType) => RuleType | false`

This callback is invoked before a new rule is added. The function should either manipulate the rule and return it, or return `false` to cancel the addition of the rule. _(To completely prevent the addition of new rules, pass `controlElements={{ addRuleAction: () => null }}` which will hide the "+Rule" button.)_ You can use `findRule(parentId, query)` to locate the parent group to which the new rule will be added among the entire query hierarchy.

### `onAddGroup`

`(ruleGroup: RuleGroupType, parentPath: number[], query: RuleGroupType) => RuleGroupType | false`

This callback is invoked before a new group is added. The function should either manipulate the group and return it, or return `false` to cancel the addition of the group. _(To completely prevent the addition of new groups, pass `controlElements={{ addGroupAction: () => null }}` which will hide the "+Group" button.)_ You can use `findRule(parentId, query)` to locate the parent group to which the new group will be added among the entire query hierarchy.

### `onQueryChange`

`(query: RuleGroupType) => void`

This is a notification that is invoked anytime the query configuration changes. The query is provided as a JSON structure, as shown below:

```json
{
  "combinator": "and",
  "not": false,
  "rules": [
    {
      "field": "firstName",
      "operator": "null",
      "value": ""
    },
    {
      "field": "lastName",
      "operator": "null",
      "value": ""
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

### `controlClassnames`

This can be used to assign specific `CSS` classes to various controls that are created by the `<QueryBuilder />`. This is an object with the following signature:

```ts
interface Classnames {
  queryBuilder?: string; // Root <div> element
  ruleGroup?: string; // <div> containing the RuleGroup
  header?: string; // <div> containing the RuleGroup header controls
  body?: string; // <div> containing the RuleGroup child rules/groups
  combinators?: string; // <select> control for combinators
  addRule?: string; // <button> to add a Rule
  addGroup?: string; // <button> to add a RuleGroup
  cloneRule?: string; // <button> to clone a Rule
  cloneGroup?: string; // <button> to clone a RuleGroup
  removeGroup?: string; // <button> to remove a RuleGroup
  notToggle?: string; // <label> on the "not" toggle
  rule?: string; // <div> containing the Rule
  fields?: string; // <select> control for fields
  operators?: string; // <select> control for operators
  value?: string; // <input> for the field value
  removeRule?: string; // <button> to remove a Rule
}
```

### `translations`

This can be used to override translatable texts applied to various controls that are created by the `<QueryBuilder />`. This is an object with the following properties:

```ts
{
  fields: {
    title: "Fields",
  },
  operators: {
    title: "Operators",
  },
  value: {
    title: "Value",
  },
  removeRule: {
    label: "x",
    title: "Remove rule",
  },
  removeGroup: {
    label: "x",
    title: "Remove group",
  },
  addRule: {
    label: "+Rule",
    title: "Add rule",
  },
  addGroup: {
    label: "+Group",
    title: "Add group",
  },
  combinators: {
    title: "Combinators",
  },
  notToggle: {
    label: "Not",
    title: "Invert this group",
  },
  cloneRule: {
    label: '⧉',
    title: 'Clone rule'
  },
  cloneRuleGroup: {
    label: '⧉',
    title: 'Clone group'
  }
}
```

### `showCombinatorsBetweenRules`

`boolean`

Pass `true` to show the combinators (and/or) between rules and rule groups instead of at the top of rule groups. This can make some queries easier to understand as it encourages a more natural style of reading.

### `showNotToggle`

`boolean`

Pass `true` to show the "Not" toggle switch for each rule group.

### `showCloneButtons`

`boolean`

Pass `true` to show the "Clone rule" and "Clone group" buttons.

### `resetOnFieldChange`

`boolean`

Pass `false` not to reset operator and value for field change.

### `resetOnOperatorChange`

`boolean`

Pass `true` to reset value on operator change.

### `enableMountQueryChange`

`boolean`

Pass `false` to disable the `onQueryChange` on mount of component which will set default value.

### `autoSelectField`

`boolean`

Pass `false` to add an empty option (`"------"`) to the `fields` array as the first element (which is selected by default for new rules). When the empty field option is selected, the operator and value components will not display for that rule.

### `addRuleToNewGroups`

`boolean`

Pass `true` to automatically add a rule to new groups. If a `query` prop is not passed in, a rule will be added to the root group when the component is mounted. If a `query` prop is passed in with an empty `rules` array, no rule will be added automatically.

### `inlineCombinators`

`boolean`

Pass `true` to insert an independent combinator (and/or) selector between each rule/group in a rule group. (The combinator selector at the group level will not be available.) This is similar to the [`showCombinatorsBetweenRules`](#showcombinatorsbetweenrules) option, except that each combinator selector is independent. You may find that users take to this configuration more naturally, as it allows them to express queries more like they would in their own language.

### `validator`

`(query: RuleGroupType) => boolean | { [id: string]: boolean | { valid: boolean; reasons?: any[] } }`

This is a callback function that is executed each time `QueryBuilder` renders. The return value should be a boolean (`true` for valid queries, `false` for invalid) or an object whose keys are the `id`s of each rule and group in the query tree. If such an object is returned, the values associated to each key should be a boolean (`true` for valid rules/groups, `false` for invalid) or an object with a `valid` boolean property and an optional `reasons` array. The full object will be passed to each rule and group component, and all sub-components of each rule/group will receive the value associated with the rule's or group's `id`.

## Other exports

### `defaultValidator`

```ts
function defaultValidator(query: RuleGroupType): {
  [id: string]: { valid: boolean; reasons: string[] };
};
```

Pass `validator={defaultValidator}` to automatically validate groups (rules will be ignored). A group will be marked invalid if either 1) it has no child rules or groups (`query.rules.length === 0`), or 2) it has a missing/invalid `combinator` and more than one child rule or group (`rules.length >= 2`). You can see an example of the default validator in action in the [demo](https://react-querybuilder.github.io/react-querybuilder/) -- empty groups will have bold text on the "+Rule" button and a description of the situation where the rules normally appear.

### `findPath`

```ts
function findPath(path: number[], query: RuleGroupType): RuleType | RuleGroupType;
```

`findPath` is a utility function for finding the rule or group within the query hierarchy that has a given `path`. Useful in custom [`onAddRule`](#onAddRule) and [`onAddGroup`](#onAddGroup) functions.

### Defaults

The following default configuration objects are exported for convenience.

- `defaultCombinators`
- `defaultOperators`
- `defaultTranslations`
- `defaultValueProcessor`

The following components are exported as well:

- `ActionElement` - used for buttons (to add rules, remove groups, etc.)
- `NotToggle` - used for the "Invert this group" toggle switch
- `ValueEditor` - the default `valueEditor` component
- `ValueSelector` - used for drop-down lists (combinator, field, and operator selectors)
