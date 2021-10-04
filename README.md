# react-querybuilder

<!-- prettier-ignore-start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-22-orange.svg)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- prettier-ignore-end -->

[![npm](https://img.shields.io/npm/v/react-querybuilder.svg?maxAge=2592000)](https://www.npmjs.com/package/react-querybuilder)
![workflow status](https://github.com/react-querybuilder/react-querybuilder/workflows/Continuous%20Integration/badge.svg)
[![codecov.io](https://codecov.io/github/react-querybuilder/react-querybuilder/coverage.svg?branch=master)](https://codecov.io/github/react-querybuilder/react-querybuilder?branch=master)

- [Getting Started](#getting-started)
- [Demo](#demo)
- [Usage](#usage)
- [API](#api)
- [Other exports](#other-exports)
- [Development](#development)
- [Credits](#credits)
- [Contributors](#contributors-)

![Screenshot](_assets/screenshot.png)

## Getting Started

```shell
npm install react-querybuilder --save
```

OR

```shell
yarn add react-querybuilder
```

## Demo

[See live demo](https://react-querybuilder.github.io/react-querybuilder/)

OR

To run the demo yourself, go through the following steps:

1. _Clone this repo_
2. `yarn` _Install npm packages_
3. `yarn start` _Run a local server_
4. http://localhost:8080/ _Visit your localhost in your browser_

## Usage

```jsx
import QueryBuilder from 'react-querybuilder';

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'age', label: 'Age' },
  { name: 'address', label: 'Address' },
  { name: 'phone', label: 'Phone' },
  { name: 'email', label: 'Email' },
  { name: 'twitter', label: 'Twitter' },
  { name: 'isDev', label: 'Is a Developer?', defaultValue: false }
];

const dom = <QueryBuilder fields={fields} onQueryChange={logQuery} />;

function logQuery(query) {
  console.log(query);
}
```

## API

The default export of this library is the `QueryBuilder` React component, which supports the following props.

#### `query` _(Optional)_

`{ id?: string; combinator: string; rules: ({ field: string; operator: string; value: any; } | { combinator: string; rules: ...[]; })[]; }`

The initial query, in JSON form (follows the same format as the parameter passed to the [`onQueryChange`](#onquerychange-optional) callback). `id` is optional. See [the demo source](demo/main.tsx) for examples.

#### `fields` _(Required)_

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
  validator?(): boolean | ValidationResult; // Called when a rule specifies this field (see the [main validator prop](#validator-optional) for more information)
}
```

Field objects can also contain other data. Each field object will be passed to the appropriate `OperatorSelector` and `ValueEditor` components as `fieldData` (see the section on [`controlElements`](#controlelements-optional)).

#### `context` _(Optional)_

`any`

A "bucket" for passing arbitrary props down to custom components. The `context` prop is passed to each and every component, so it's accessible anywhere in the `QueryBuilder` component tree.

#### `operators` _(Optional)_

`{ name: string; label: string; }[]`

The array of operators that should be used. The default operators include:

```js
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

#### `combinators` _(Optional)_

`{ name: string, label: string; }[]`

The array of combinators that should be used for RuleGroups. The default set includes:

```js
[
  { name: 'and', label: 'AND' },
  { name: 'or', label: 'OR' }
];
```

#### `controlElements` _(Optional)_

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
  id: string; // Unique identifier for this rule group
  parentId: string; // Identifier of the parent group
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
  id: string; // Unique identifier for this rule
  parentId: string; // Identifier of the parent group
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
  createRuleGroup(): RuleGroupType;
  getLevel(id: string): number;
  getOperators(field: string): { name: string; label: string }[];
  getValueEditorType(field: string, operator: string): 'text' | 'select' | 'checkbox' | 'radio';
  getInputType(field: string, operator: string): string | null;
  getValues(field: string, operator: string): { name: string; label: string }[];
  isRuleGroup(ruleOrGroup: RuleType | RuleGroupType): ruleOrGroup is RuleGroupType;
  onGroupAdd(group: RuleGroupType, parentId: string): void;
  onGroupRemove(groupId: string, parentId: string): void;
  onPropChange(prop: string, value: any, ruleId: string): void;
  onRuleAdd(rule: RuleType, parentId: string): void;
  onRuleRemove(id: string, parentId: string): void;
  showCombinatorsBetweenRules: boolean;
  showNotToggle: boolean;
  showCloneButtons: boolean;
  autoSelectField: boolean;
  addRuleToNewGroups: boolean;
  validationMap: ValidationMap;
}
```

#### `getOperators` _(Optional)_

`(field: string) => { name: string; label: string; }[] | null`

This is a callback function invoked to get the list of allowed operators for the given field. If `null` is returned, the default operators are used.

#### `getValueEditorType` _(Optional)_

`(field: string, operator: string) => 'text' | 'select' | 'checkbox' | 'radio' | null`

This is a callback function invoked to get the type of `ValueEditor` for the given field and operator. Allowed values are `"text"` (the default if the function is not provided or if `null` is returned), `"select"`, `"checkbox"`, and `"radio"`.

#### `getInputType` _(Optional)_

`(field: string, operator: string) => string`

This is a callback function invoked to get the `type` of `<input />` for the given field and operator (only applicable when `getValueEditorType` returns `"text"` or a falsy value). If no function is provided, `"text"` is used as the default.

#### `getValues` _(Optional)_

`(field: string, operator: string) => { name: string; label: string; }[]`

This is a callback function invoked to get the list of allowed values for the given field and operator (only applicable when `getValueEditorType` returns `"select"` or `"radio"`). If no function is provided, an empty array is used as the default.

#### `getDefaultField` _(Optional)_

`string | ((fieldsData: Field[]) => string)`

The default field for new rules. This can be a string identifying the default field, or a function that returns a field name.

#### `getDefaultOperator` _(Optional)_

`string | ((field: string) => string)`

The default operator for new rules. This can be a string identifying the default operator, or a function that returns an operator name.

#### `getDefaultValue` _(Optional)_

`(rule: RuleType) => any`

This function returns the default value for new rules.

#### `onAddRule` _(Optional)_

`(rule: RuleType, parentId: string, query: RuleGroupType) => RuleType | false`

This callback is invoked before a new rule is added. The function should either manipulate the rule and return it, or return `false` to cancel the addition of the rule. _(To completely prevent the addition of new rules, pass `controlElements={{ addRuleAction: () => null }}` which will hide the "+Rule" button.)_ You can use `findRule(parentId, query)` to locate the parent group to which the new rule will be added among the entire query hierarchy.

#### `onAddGroup` _(Optional)_

`(ruleGroup: RuleGroupType, parentId: string, query: RuleGroupType) => RuleGroupType | false`

This callback is invoked before a new group is added. The function should either manipulate the group and return it, or return `false` to cancel the addition of the group. _(To completely prevent the addition of new groups, pass `controlElements={{ addGroupAction: () => null }}` which will hide the "+Group" button.)_ You can use `findRule(parentId, query)` to locate the parent group to which the new group will be added among the entire query hierarchy.

#### `onQueryChange` _(Optional)_

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

#### `controlClassnames` _(Optional)_

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

#### `translations` _(Optional)_

This can be used to override translatable texts applied to various controls that are created by the `<QueryBuilder />`. This is an object with the following properties:

```js
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

#### `showCombinatorsBetweenRules` _(Optional)_

`boolean`

Pass `true` to show the combinators (and/or) between rules and rule groups instead of at the top of rule groups. This can make some queries easier to understand as it encourages a more natural style of reading.

#### `showNotToggle` _(Optional)_

`boolean`

Pass `true` to show the "Not" toggle switch for each rule group.

#### `showCloneButtons` _(Optional)_

`boolean`

Pass `true` to show the "Clone rule" and "Clone group" buttons.

#### `resetOnFieldChange` _(Optional)_

`boolean`

Pass `false` not to reset operator and value for field change.

#### `resetOnOperatorChange` _(Optional)_

`boolean`

Pass `true` to reset value on operator change.

#### `enableMountQueryChange` _(Optional)_

`boolean`

Pass `false` to disable the `onQueryChange` on mount of component which will set default value.

#### `autoSelectField` _(Optional)_

`boolean`

Pass `false` to add an empty option (`"------"`) to the `fields` array as the first element (which is selected by default for new rules). When the empty field option is selected, the operator and value components will not display for that rule.

#### `addRuleToNewGroups` _(Optional)_

`boolean`

Pass `true` to automatically add a rule to new groups. If a `query` prop is not passed in, a rule will be added to the root group when the component is mounted. If a `query` prop is passed in with an empty `rules` array, no rule will be added automatically.

#### `validator` _(Optional)_

`(query: RuleGroupType) => boolean | { [id: string]: boolean | { valid: boolean; reasons?: any[] } }`

This is a callback function that is executed each time `QueryBuilder` renders. The return value should be a boolean (`true` for valid queries, `false` for invalid) or an object whose keys are the `id`s of each rule and group in the query tree. If such an object is returned, the values associated to each key should be a boolean (`true` for valid rules/groups, `false` for invalid) or an object with a `valid` boolean property and an optional `reasons` array. The full object will be passed to each rule and group component, and all sub-components of each rule/group will receive the value associated with the rule's or group's `id`.

## Other exports

#### `defaultValidator`

```ts
function defaultValidator(query: RuleGroupType) => {
  [id: string]: { valid: boolean; reasons: string[]; }
}
```

Pass `validator={defaultValidator}` to automatically validate groups (rules will be ignored). A group will be marked invalid if either 1) it has no child rules or groups (`rules.length === 0`), or 2) it has a missing/invalid `combinator` and more than one child rule or group (`rules.length >= 2`). You can see an example of the default validator in action in the [demo](#demo) -- empty groups will have bold text on the "+Rule" button.

#### `findRule`

```ts
function findRule(parentId: string, query: RuleGroupType): RuleType | RuleGroupType;
```

`findRule` is a utility function for finding the rule or group within the query hierarchy that has a given `id`. Useful in custom [`onAddRule`](#onAddRule-optional) and [`onAddGroup`](#onAddGroup-optional) functions.

#### `formatQuery`

```ts
function formatQuery(
  query: RuleGroupType,
  options?: ExportFormat | FormatQueryOptions
): string | { sql: string; params: string[] };
```

`formatQuery` parses a given query into one of the following formats: SQL, parameterized SQL, JSON, MongoDB, or JSON without IDs (which can be useful if you need to serialize the rules). The inversion operator (setting `not: true` for a rule group) is currently unsupported for the MongoDB format, but rules can be created using the `"!="` operator.

Example:

```js
import { formatQuery } from 'react-querybuilder';

const query = {
  id: 'g-b6SQ6WCcup8e37xhydwHE',
  rules: [
    {
      id: 'r-zITQOjVEWlsU1fncraSNn',
      field: 'firstName',
      value: 'Steve',
      operator: '='
    },
    {
      id: 'r-zVx7ARNak3TCZNFHkwMG2',
      field: 'lastName',
      value: 'Vai',
      operator: '='
    }
  ],
  combinator: 'and',
  not: false
};

console.log(formatQuery(query, 'sql')); // '(firstName = "Steve" and lastName = "Vai")'
console.log(formatQuery(query, 'parameterized')); // { sql: "(firstName = ? and lastName = ?)", params: ["Steve", "Vai"] }
console.log(formatQuery(query, 'mongodb')); // '{$and:[{firstName:{$eq:"Steve"}},{lastName:{$eq:"Vai"}}]}'
```

An `options` object can be passed as the second argument instead of a format string in order to have more detailed control over the output. The options object takes the following form:

```ts
interface FormatQueryOptions {
  format?: 'sql' | 'json' | 'json_without_ids' | 'parameterized'; // same as passing a `format` string instead of an options object
  valueProcessor?: (field: string, operator: string, value: any) => string; // see below for an example
  quoteFieldNamesWith?: string; // e.g. "`" to quote field names with backticks (useful if your field names have spaces)
  validator?: QueryValidator; // function to validate the entire query (see [validator](#validator-optional))
  fields?: { name: string; validator?: RuleValidator; [k: string]: any }[]; // This can be the same Field[] passed to <QueryBuilder />, but really all you need to provide is the name and validator for each field
}
```

For example, if you need to control the way the value portion of the output is processed, you can specify a custom `valueProcessor` (only applicable for `format: "sql"`).

```js
const query = {
  id: 'g-J5GsbcFmZ6xOJCLPPKIfE',
  rules: [
    {
      id: 'r-KneYcwIPPHDGSogtKhG4g',
      field: 'instrument',
      value: ['Guitar', 'Vocals'],
      operator: 'in'
    },
    {
      id: 'r-wz6AkZbzSyDYbPk1AxgvO',
      field: 'lastName',
      value: 'Vai',
      operator: '='
    }
  ],
  combinator: 'and',
  not: false
};

const valueProcessor = (field, operator, value) => {
  if (operator === 'in') {
    // Assuming `value` is an array, such as from a multi-select
    return `(${value.map((v) => `"${v.trim()}"`).join(',')})`;
  } else {
    return defaultValueProcessor(field, operator, value);
  }
};

console.log(formatQuery(query, { format: 'sql', valueProcessor })); // '(instrument in ("Guitar","Vocals") and lastName = "Vai")'
```

The 'json_without_ids' format will return the same query without the IDs. This can be useful, for example, if you need to save the query to the URL so that it becomes bookmarkable:

```js
const query = {
  id: 'g-J5GsbcFmZ6xOJCLPPKIfE',
  rules: [
    {
      id: 'r-KneYcwIPPHDGSogtKhG4g',
      field: 'instrument',
      value: ['Guitar', 'Vocals'],
      operator: 'in'
    },
    {
      id: 'r-wz6AkZbzSyDYbPk1AxgvO',
      field: 'lastName',
      value: 'Vai',
      operator: '='
    }
  ],
  combinator: 'and',
  not: false
};

console.log(formatQuery(query, 'json_without_ids'));
/*
{
  rules: [
    {
      field: 'instrument',
      value: ['Guitar', 'Vocals'],
      operator: 'in'
    },
    {
      field: 'lastName',
      value: 'Vai',
      operator: '='
    }
  ],
  combinator: 'and',
  not: false
}
*/
```

The validation options (`validator` and `fields`) only affect the output when `format` is `sql`, `parameterized`, or `mongodb`. If the `validator` function returns `false` or `{ valid: false }`, the `sql` and `parameterized` formats will return `"(1 = 1)"`, and the `mongodb` format will return `"{$and:[{$expr:true}]}"`. Otherwise, groups and rules marked as invalid (either by the validation map produced by the `validator` function or the field-based `validator` functions) will be ignored.

Example:

```ts
const query = {
  id: 'root',
  rules: [
    {
      id: 'r1',
      field: 'firstName',
      value: '',
      operator: '='
    },
    {
      id: 'r2',
      field: 'lastName',
      value: 'Vai',
      operator: '='
    }
  ],
  combinator: 'and',
  not: false
};

// Invalid query
console.log(formatQuery(query, { format: 'sql', validator: () => false })); // "(1 = 1)"
// Invalid rule based on validation map
console.log(formatQuery(query, { format: 'sql', validator: () => ({ r1: false }) })); // "(lastName = 'Vai')"
// Invalid rule based on field validator
console.log(
  formatQuery(query, { format: 'sql', fields: [{ name: 'firstName', validator: () => false }] })
); // "(lastName = 'Vai')"
```

### Defaults

The following default configuration objects are exported for convenience.

- `defaultCombinators`
- `defaultOperators`
- `defaultTranslations`
- `defaultValueProcessor`

The following components are exported as well:

- `ActionElement` - used for buttons ("Add rule", "Remove group", etc.)
- `NotToggle` - used for the "Invert this group" toggle switch
- `ValueEditor` - the default ValueEditor component
- `ValueSelector` - used for drop-down lists: the combinator, field, and operator selectors

## Development

#### Changelog Generation

We are using [github-changes](https://github.com/lalitkapoor/github-changes) to generate the changelog.

To use it:

1. tag your commit using [semantic versioning](http://semver.org/)
2. run `npm run generate-changelog`
3. enter your github credentials at the prompt
4. commit
5. push your commit and tags

## Credits

This component was inspired by prior work from:

- [jQuery QueryBuilder](http://querybuilder.js.org/)
- [Angular QueryBuilder](https://github.com/mfauveau/angular-query-builder)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/jakeboone02"><img src="https://avatars1.githubusercontent.com/u/366438?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jake Boone</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=jakeboone02" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=jakeboone02" title="Documentation">📖</a> <a href="#maintenance-jakeboone02" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://quicklens.app/"><img src="https://avatars0.githubusercontent.com/u/156846?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pavan Podila</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=pavanpodila" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=pavanpodila" title="Documentation">📖</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=pavanpodila" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/maniax89"><img src="https://avatars2.githubusercontent.com/u/6325237?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andrew Turgeon</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=maniax89" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=maniax89" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/miphe"><img src="https://avatars2.githubusercontent.com/u/393147?v=4?s=100" width="100px;" alt=""/><br /><sub><b>André Drougge</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=miphe" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=miphe" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/oumar-sh"><img src="https://avatars0.githubusercontent.com/u/10144493?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Oumar Sharif DAMBABA</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=oumar-sh" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/artenator"><img src="https://avatars2.githubusercontent.com/u/1946019?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Arte Ebrahimi</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=artenator" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=artenator" title="Documentation">📖</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=artenator" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/CharlyJazz"><img src="https://avatars0.githubusercontent.com/u/12489333?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Carlos Azuaje</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=CharlyJazz" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/srinivasdamam"><img src="https://avatars0.githubusercontent.com/u/13461208?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Srinivas Damam</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=srinivasdamam" title="Code">💻</a></td>
    <td align="center"><a href="https://matthewreishus.com/"><img src="https://avatars3.githubusercontent.com/u/937354?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Matthew Reishus</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=mreishus" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/duwalanise"><img src="https://avatars2.githubusercontent.com/u/7278569?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Anish Duwal</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=duwalanise" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=duwalanise" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/RomanLamsal1337"><img src="https://avatars1.githubusercontent.com/u/66664277?v=4?s=100" width="100px;" alt=""/><br /><sub><b>RomanLamsal1337</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=RomanLamsal1337" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/snakerxx"><img src="https://avatars2.githubusercontent.com/u/2099820?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dmitriy Kolesnikov</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=xxsnakerxx" title="Code">💻</a></td>
    <td align="center"><a href="http://vitorbarbosa.com/"><img src="https://avatars2.githubusercontent.com/u/86801?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vitor Barbosa</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=vitorhsb" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/lakk1"><img src="https://avatars0.githubusercontent.com/u/9366737?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Laxminarayana</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=lakk1" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=lakk1" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://mundpropaganda.net/"><img src="https://avatars0.githubusercontent.com/u/3873068?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Christian Mund</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=kkkrist" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=kkkrist" title="Documentation">📖</a></td>
    <td align="center"><a href="http://thegalacticdesignbureau.com/"><img src="https://avatars0.githubusercontent.com/u/6655746?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dallas Larsen</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=hellofantastic" title="Code">💻</a></td>
    <td align="center"><a href="https://geekayush.github.io/"><img src="https://avatars2.githubusercontent.com/u/22499864?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ayush Srivastava</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=geekayush" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/fabioespinosa"><img src="https://avatars2.githubusercontent.com/u/10719524?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Fabio Espinosa</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=fabioespinosa" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=fabioespinosa" title="Documentation">📖</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=fabioespinosa" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://careers.stackoverflow.com/bubenkoff"><img src="https://avatars0.githubusercontent.com/u/427136?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Anatoly Bubenkov</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=bubenkoff" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=bubenkoff" title="Documentation">📖</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=bubenkoff" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/saurabhnemade"><img src="https://avatars0.githubusercontent.com/u/17445338?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Saurabh Nemade</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=saurabhnemade" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=saurabhnemade" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/edwin-xavier/"><img src="https://avatars2.githubusercontent.com/u/74540236?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Edwin Xavier</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=eddie-xavi" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=eddie-xavi" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://stackoverflow.com/users/3875582/code-monk"><img src="https://avatars.githubusercontent.com/u/15674997?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Code Monk</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=CodMonk" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=CodMonk" title="Documentation">📖</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=CodMonk" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
