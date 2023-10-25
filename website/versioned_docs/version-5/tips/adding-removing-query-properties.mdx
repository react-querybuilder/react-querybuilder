---
title: Adding and removing query properties
description: Customizing the query object
hide_table_of_contents: true
---

import Details from '@theme/Details';

## Removing properties

To convert a standard query object to a JSON string containing only certain properties, you can take advantage of the second parameter of the [`JSON.stringify` function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

```ts
const query: RuleGroupType = {
  id: 'root',
  combinator: 'and',
  rules: [
    {
      field: 'firstName',
      operator: '=',
      value: 'Steve',
    },
  ],
};

// This will leave off the `id` and `combinator` properties:
console.log(JSON.stringify(query, ['rules', 'field', 'operator', 'value']));
// '{"rules":[{"field":"firstName","operator":"=","value":"Steve"}]}'
```

The `formatQuery` function also provides a shortcut for producing a JSON string representing everything in the query except the `id` properties:

```ts
console.log(formatQuery(query, 'json_without_ids'));
// '{"combinator":"and","rules":[{"field":"firstName","operator":"=","value":"Steve"}]}'
```

## Adding properties

To produce a query object with additional properties, you can loop through the `rules` array recursively. The [`transformQuery`](../api/misc#transformquery) function is provided for use cases such as this.

In the example below (inspired by [issue #226](https://github.com/react-querybuilder/react-querybuilder/issues/226)), the `inputType` from the `fields` array is added to each rule.

```ts
import type { Field, RuleGroupType, RuleType } from 'react-querybuilder';
import { transformQuery } from 'react-querybuilder';

const fields: Field[] = [
  { name: 'description', label: 'Description', inputType: 'string' },
  { name: 'price', label: 'Price', inputType: 'number' },
];

const ruleProcessor = (r: RuleType): RuleType & { inputType?: string } => ({
  ...r,
  inputType: fields.find(f => f.name === r.field)?.inputType,
});

const result = transformQuery(query, { ruleProcessor });
```

<Details summary="Manual recursion">

This example (_directly_ from [issue #226](https://github.com/react-querybuilder/react-querybuilder/issues/226)) demonstrates manual recursion to achieve exactly the same result as the `transformQuery` example above.

```ts
import type { Field, RuleGroupType, RuleType } from 'react-querybuilder';

const fields: Field[] = [
  { name: 'description', label: 'Description', inputType: 'string' },
  { name: 'price', label: 'Price', inputType: 'number' },
];

const processRule = (r: RuleType): RuleType & { inputType?: string } => ({
  ...r,
  inputType: fields.find(f => f.name === r.field)?.inputType,
});

const processGroup = (rg: RuleGroupType): RuleGroupType => ({
  ...rg,
  rules: rg.rules.map(r => {
    if ('field' in r) {
      return processRule(r);
    }
    return processGroup(r);
  }),
});

const result = processGroup(query);
```

</Details>
