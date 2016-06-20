# react-querybuilder
A QueryBuilder component for React

[![npm](https://img.shields.io/npm/v/react-querybuilder.svg?maxAge=2592000)]()

**Credits**: This component was inspired by prior work from:

- [jQuery QueryBuilder](http://querybuilder.js.org/)
- [Angular QueryBuilder](https://github.com/mfauveau/angular-query-builder)


### Getting Started

![Screenshot](_assets/screenshot.png)

```shell
npm install react-querybuilder --save
```
### Demo

Open `<path-to-project>/node_modules/react-querybuilder/demo/index.html` in your browser.

OR

[See live Demo](http://www.webpackbin.com/41LfnfeBb).


### Usage

```jsx
import {QueryBuilder} from 'react-querybuilder';

const fields = [
    {name: 'firstName', label: 'First Name'},
    {name: 'lastName', label: 'Last Name'},
    {name: 'age', label: 'Age'},
    {name: 'address', label: 'Address'},
    {name: 'phone', label: 'Phone'},
    {name: 'email', label: 'Email'},
    {name: 'twitter', label: 'Twitter'},
    {name: 'isDev', label: 'Is a Developer?', value: false},
];

const dom = <QueryBuilder fields={fields}
                          onQueryChange={logQuery}/>


function logQuery(query) {
    console.log(query);
}

```

### API

`<QueryBuilder />` is the only top-level component exposed from this library. It supports the following properties:

*(Required)* **fields** : [ {name:String, label:String} ]

The array of fields that should be used. Each field should be an object with
`{name:String, label:String}` |

*(Optional)* **operators** : [ {name:String, label:String} ]

The array of operators that should be used. The default operators include:

```js
[
    {name: 'null', label: 'Is Null'},
    {name: 'notNull', label: 'Is Not Null'},
    {name: 'in', label: 'In'},
    {name: 'notIn', label: 'Not In'},
    {name: '=', label: '='},
    {name: '!=', label: '!='},
    {name: '<', label: '<'},
    {name: '>', label: '>'},
    {name: '<=', label: '<='},
    {name: '>=', label: '>='},
]
```

*(Optional)* **combinators** : [ {name:String, label:String} ]

The array of combinators that should be used for RuleGroups.
The default set includes:

```js
[
    {name: 'and', label: 'AND'},
    {name: 'or', label: 'OR'},
]
```

*(Optional)* **getEditor** : function({field, operator, value, onChange}):ReactElement

This is a callback function invoked by the internal `<Rule />` component to determine the
editor for the field value. By default a `<input type="text" />` is used.

*(Optional)* **getOperators** : function(field):[]

This is a callback function invoked to get the list of allowed operators
for the given field

*(Optional)* **onQueryChange** : function(queryJSON):void

This is a notification that is invoked anytime the query configuration changes. The
query is provided as a JSON structure, as shown below:

```json
{
  "combinator": "and",
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