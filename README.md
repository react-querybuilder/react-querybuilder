# react-querybuilder

[![npm](https://img.shields.io/npm/v/react-querybuilder.svg?maxAge=2592000)](https://www.npmjs.com/package/react-querybuilder)
[![Build Status](https://travis-ci.org/sapientglobalmarkets/react-querybuilder.svg?branch=master)](https://travis-ci.org/sapientglobalmarkets/react-querybuilder)
[![codecov.io](https://codecov.io/github/sapientglobalmarkets/react-querybuilder/coverage.svg?branch=master)](https://codecov.io/github/sapientglobalmarkets/react-querybuilder?branch=master)

## Credits

This component was inspired by prior work from:

- [jQuery QueryBuilder](http://querybuilder.js.org/)
- [Angular QueryBuilder](https://github.com/mfauveau/angular-query-builder)

## Getting Started

![Screenshot](_assets/screenshot.png)

```shell
npm install react-querybuilder --save
```

## Demo

To run a demo of the react-querybuilder being used, go through the following steps.

- `npm install` _Install npm packages_
- `npm start` _Run a local server_
- `http://localhost:8080/` _Visit your localhost in your browser_

OR

[See live Demo](https://sapientglobalmarkets.github.io/react-querybuilder/).

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
  { name: 'isDev', label: 'Is a Developer?', value: false }
];

const dom = <QueryBuilder fields={fields} onQueryChange={logQuery} />;

function logQuery(query) {
  console.log(query);
}
```

## API

This library exposes a React component, [`<QueryBuilder />`](#QueryBuilder), and a utility function, [`formatQuery`](#formatQuery). `<QueryBuilder />` is the default export, and `formatQuery` is exposed as a named export.

### QueryBuilder

`<QueryBuilder />` supports the following properties:

#### fields _(Required)_

`[ {name:String, label:String, id:ID} ]`

The array of fields that should be used. Each field should be an object with at least:

`{name:String, label:String, id:ID}`

The `id` is optional. If you do not provide an `id` for a field then the `name` will be used.

Field objects can also contain other data. Each field object will be passed to the appropriate `OperatorSelector` and `ValueEditor` components as `fieldData` (see the section on `controlElements` below).

#### operators _(Optional)_

`[ {name:String, label:String} ]`

The array of operators that should be used. The default operators include:

```js
[
  { name: 'null', label: 'is null' },
  { name: 'notNull', label: 'is not null' },
  { name: 'in', label: 'in' },
  { name: 'notIn', label: 'not in' },
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
  { name: 'doesNotEndWith', label: 'does not end with' }
];
```

#### combinators _(Optional)_

`[ {name:String, label:String} ]`

The array of combinators that should be used for RuleGroups. The default set includes:

```js
[{ name: 'and', label: 'AND' }, { name: 'or', label: 'OR' }];
```

#### controlElements _(Optional)_

```js
React.PropTypes.shape({
  addGroupAction: React.PropTypes.func, //returns ReactClass
  removeGroupAction: React.PropTypes.func, //returns ReactClass
  addRuleAction: React.PropTypes.func, //returns ReactClass
  removeRuleAction: React.PropTypes.func, //returns ReactClass
  combinatorSelector: React.PropTypes.func, //returns ReactClass
  fieldSelector: React.PropTypes.func, //returns ReactClass
  operatorSelector: React.PropTypes.func, //returns ReactClass
  valueEditor: React.PropTypes.func //returns ReactClass
  notToggle: React.PropTypes.func //returns ReactClass
});
```

This is a custom controls object that allows you to override the control elements used. The following control overrides are supported:

- `addGroupAction`: By default a `<button />` is used. The following props are passed:

```js
{
  label: React.PropTypes.string, //"+Group"
  className: React.PropTypes.string, //CSS classNames to be applied
  handleOnClick: React.PropTypes.func, //callback function to invoke adding a <RuleGroup />
  rules: React.PropTypes.array, //Provides the number of rules already present for this group,
  level: React.PropTypes.number //The level of the current group
}
```

- `removeGroupAction`: By default a `<button />` is used. The following props are passed:

```js
{
  label: React.PropTypes.string, //"x"
  className: React.PropTypes.string, //CSS classNames to be applied
  handleOnClick: React.PropTypes.func, //callback function to invoke removing a <RuleGroup />
  rules: React.PropTypes.array, //Provides the number of rules already present for this group,
  level: React.PropTypes.number //The level of the current group
}
```

- `addRuleAction`: By default a `<button />` is used. The following props are passed:

```js
{
  label: React.PropTypes.string, //"+Rule"
  className: React.PropTypes.string, //CSS classNames to be applied
  handleOnClick: React.PropTypes.func, //callback function to invoke adding a <Rule />
  rules: React.PropTypes.array, //Provides the number of rules already present for this group,
  level: React.PropTypes.number //The level of the current group
}
```

- `removeRuleAction`: By default a `<button />` is used. The following props are passed:

```js
{
  label: React.PropTypes.string, //"x"
  className: React.PropTypes.string, //CSS classNames to be applied
  handleOnClick: React.PropTypes.func, //callback function to invoke removing a <Rule />
  level: React.PropTypes.number //The level of the current group
}
```

- `combinatorSelector`: By default a `<select />` is used. The following props are passed:

```js
{
  options: React.PropTypes.array.isRequired, //same as 'combinators' passed into QueryBuilder
  value: React.PropTypes.string, //selected combinator from the existing query representation, if any
  className: React.PropTypes.string, //CSS classNames to be applied
  handleOnChange: React.PropTypes.func, //callback function to update query representation
  rules: React.PropTypes.array, //Provides the number of rules already present for this group
  level: React.PropTypes.number //The level of the current group
}
```

- `fieldSelector`: By default a `<select />` is used. The following props are passed:

```js
{
  options: React.PropTypes.array.isRequired, //same as 'fields' passed into QueryBuilder
  value: React.PropTypes.string, //selected field from the existing query representation, if any
  className: React.PropTypes.string, //CSS classNames to be applied
  handleOnChange: React.PropTypes.func, //callback function to update query representation
  level: React.PropTypes.number //The level the group this rule belongs to
}
```

- `operatorSelector`: By default a `<select />` is used. The following props are passed:

```js
{
  field: React.PropTypes.string, //field name corresponding to this Rule
  fieldData: React.PropTypes.object, //the entire object from the fields array for this field
  options: React.PropTypes.array.isRequired, //return value of getOperators(field)
  value: React.PropTypes.string, //selected operator from the existing query representation, if any
  className: React.PropTypes.string, //CSS classNames to be applied
  handleOnChange: React.PropTypes.func, //callback function to update query representation
  level: React.PropTypes.number //The level the group this rule belongs to
}
```

- `valueEditor`: By default an `<input type="text" />` is used. The following props are passed:

```js
{
  field: React.PropTypes.string, //field name corresponding to this Rule
  fieldData: React.PropTypes.object, //the entire object from the fields array for this field
  operator: React.PropTypes.string, //operator name corresponding to this Rule
  value: React.PropTypes.string, //value from the existing query representation, if any
  handleOnChange: React.PropTypes.func, //callback function to update the query representation
  type: React.PropTypes.oneOf(['text', 'select', 'checkbox', 'radio']), //type of editor to be displayed
  inputType: React.PropTypes.string, //type of <input> if type is "text"
  values: React.PropTypes.arrayOf(React.PropTypes.object), //
  level: React.PropTypes.number, //The level the group this rule belongs to
  className: React.PropTypes.string, //CSS classNames to be applied
}
```

- `notToggle`: By default, `<label><input type="checkbox" />Not</label>` is used. The following props are passed:

```js
{
  checked: React.PropTypes.bool, // Whether the input should be checked or not
  handleOnChange: React.PropTypes.func, // Callback function to update the query representation
  title: React.PropTypes.string, // Tooltip for the label
  level: React.PropTypes.number, // The level of the group
  className: React.PropTypes.string, // CSS classNames to be applied
}
```

#### getOperators _(Optional)_

`function(field):[]`

This is a callback function invoked to get the list of allowed operators for the given field.

#### getValueEditorType _(Optional)_

`function(field, operator):string`

This is a callback function invoked to get the type of `ValueEditor` for the given field and operator. Allowed values are `"text"` (the default), `"select"`, `"checkbox"`, and `"radio"`.

#### getInputType _(Optional)_

`function(field, operator):string`

This is a callback function invoked to get the `type` of `<input />` for the given field and operator (only applicable when `getValueEditorType` returns `"text"` or a falsy value). If no function is provided, `"text"` is used as the default.

#### getValues _(Optional)_

`function(field, operator):[]`

This is a callback function invoked to get the list of allowed values for the given field and operator (only applicable when `getValueEditorType` returns `"select"` or `"radio"`). If no function is provided, an empty array is used as the default.

#### onQueryChange _(Optional)_

`function(queryJSON):void`

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

#### controlClassnames _(Optional)_

This can be used to assign specific `CSS` classes to various controls that are created by the `<QueryBuilder />`. This is an object with the following properties:

```js
{
    queryBuilder:String, // Root <div> element

    ruleGroup:String, // <div> containing the RuleGroup
    combinators:String, // <select> control for combinators
    addRule:String, // <button> to add a Rule
    addGroup:String, // <button> to add a RuleGroup
    removeGroup:String, // <button> to remove a RuleGroup
    notToggle:String, // <label> on the "not" toggle

    rule:String, // <div> containing the Rule
    fields:String, // <select> control for fields
    operators:String, // <select> control for operators
    value:String, // <input> for the field value
    removeRule:String // <button> to remove a Rule

}
```

#### translations _(Optional)_

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
        title: "Invert this group",
    }
}
```

#### showCombinatorsBetweenRules _(Optional)_

`boolean`

Pass `true` to show the combinators (and/or) between rules and rule groups instead of at the top of rule groups. This can make some queries easier to understand as it encourages a more natural style of reading.

#### showNotToggle _(Optional)_

`boolean`

Pass `true` to show the "Not" toggle switch for each rule group.

### formatQuery

`formatQuery` formats a given query in either JSON or SQL format. Example:

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
```

An optional third argument can be passed into `formatQuery` if you need to control the way the value portion of the output is processed. (This is only applicable when the format is `"sql"`.)

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
    return `"${value}"`;
  }
};

console.log(formatQuery(query, 'sql', valueProcessor)); // '(instrument in ("Guitar","Vocals") and lastName = "Vai")'
```

## Development

### Changelog Generation

We are using [github-changes](https://github.com/lalitkapoor/github-changes) to generate the changelog.

To use it:

1. tag your commit using [semantic versioning](http://semver.org/)
1. run `npm run generate-changelog`
1. enter your github credentials at the prompt
1. commit
1. push your commit and tags
