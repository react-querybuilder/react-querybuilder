---
title: Arbitrary updates
description: Non-standard query management from custom components
hide_table_of_contents: true
---

import { SandpackRQB } from '@site/src/components/SandpackRQB';

Standard component actions may be insufficient for a particular use case. React Query Builder provides tools to augment or replace the standard methods.

## Multiple action elements

The `addRuleAction` component adds a new rule to the current group when clicked, _always_ using the default configuration. But your requirement may be to provide the user _two_ buttons that add a rule with a different field selected depending on which button was clicked.

The example below uses a custom component that renders two buttons in the `addRuleAction` position, one for each field. The click event handler calls `props.schema.getQuery()` to retrieve the current query and `props.schema.dispatchQuery()` to update the query state appropriately for the given button.

<SandpackRQB rqbVersion={7} options={{ editorHeight: 480 }}>

```tsx
import { useState } from 'react';
import {
  ActionElement,
  ActionWithRulesAndAddersProps,
  add,
  Field,
  QueryBuilder,
  RuleGroupType,
} from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

const AddRulesAction = (props: ActionWithRulesAndAddersProps) => {
  const onClick = (field: string) => {
    props.schema.dispatchQuery(
      add(props.schema.getQuery(), { field, operator: '=', value: '' }, props.path)
    );
  };
  return (
    <>
      <ActionElement
        {...props}
        label="+ First Name Rule"
        handleOnClick={() => onClick('firstName')}
      />
      <ActionElement
        {...props}
        label="+ Last Name Rule"
        handleOnClick={() => onClick('lastName')}
      />
    </>
  );
};

const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const initialQuery: RuleGroupType = {
  combinator: 'and',
  rules: [],
};

export default () => {
  const [query, setQuery] = useState(initialQuery);

  return (
    <div>
      <QueryBuilder
        fields={fields}
        query={query}
        onQueryChange={setQuery}
        controlElements={{ addRuleAction: AddRulesAction }}
      />
    </div>
  );
};
```

</SandpackRQB>

## Custom query properties

Sometimes the structure of the query object is appropriate but doesn't carry enough information. You may need additional properties in the query hierarchy, and you probably want to update those properties from controls within the query builder. The example below uses a `caseSensitive` property on each rule, with a checkbox rendered beside the default value editor to update the property.

To further illustrate this scenario, the `caseSensitive` property is used by a custom [rule processor](../utils/export#rule-processor) for `formatQuery`. When `caseSensitive` is falsey, the `field` is augmented with a call to the SQL `LOWER` function and the `value` is converted to lowercase before being passed to the default rule processor.

The generated SQL and the raw query object are displayed below the query builder.

> _Related: [Adding and removing query properties](./adding-removing-query-properties)_

<SandpackRQB rqbVersion={7} options={{ editorHeight: 480 }}>

```tsx
import { useState } from 'react';
import {
  defaultRuleProcessorSQL,
  Field,
  formatQuery,
  QueryBuilder,
  RuleGroupType,
  RuleProcessor,
  update,
  ValueEditor,
  ValueEditorProps,
} from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

const CaseSensitivityValueEditor = (props: ValueEditorProps) => {
  const onChange = () => {
    props.schema.dispatchQuery(
      update(props.schema.getQuery(), 'caseSensitive', !props.rule.caseSensitive, props.path)
    );
  };
  return (
    <>
      <ValueEditor {...props} />
      <label>
        <input type="checkbox" checked={!!props.rule.caseSensitive} onChange={onChange} />
        {' Case sensitive'}
      </label>
    </>
  );
};

const ruleProcessor: RuleProcessor = (rule, opts) => {
  if (!rule.caseSensitive) {
    return defaultRuleProcessorSQL(
      { ...rule, field: `LOWER(${rule.field})`, value: rule.value.toLocaleLowerCase() },
      opts
    );
  }
  return defaultRuleProcessorSQL(rule, opts);
};

const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const initialQuery: RuleGroupType = {
  combinator: 'or',
  rules: [
    { field: 'firstName', operator: '=', value: 'Adam', caseSensitive: true },
    { field: 'firstName', operator: '=', value: 'Eve', caseSensitive: false },
  ],
};

export default () => {
  const [query, setQuery] = useState(initialQuery);

  return (
    <div>
      <QueryBuilder
        fields={fields}
        query={query}
        onQueryChange={setQuery}
        controlElements={{ valueEditor: CaseSensitivityValueEditor }}
      />
      <pre>
        <code>{formatQuery(query, { format: 'sql', ruleProcessor })}</code>
      </pre>
      <pre>
        <code>{JSON.stringify(query, null, 2)}</code>
      </pre>
    </div>
  );
};
```

</SandpackRQB>
