import { useState } from 'react';
import type { ControlElementsProp, Field, FullField, RuleGroupType } from 'react-querybuilder';
import { QueryBuilder, formatQuery } from 'react-querybuilder';
import { BaseActionElement } from './BaseActionElement';
import { BaseNotToggle } from './BaseNotToggle';
import { BaseValueEditor } from './BaseValueEditor';
import { BaseValueSelector } from './BaseValueSelector';
import './styles.css';

const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const initialQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'firstName', operator: 'beginsWith', value: 'Stev' },
    { field: 'lastName', operator: 'in', value: 'Vai,Vaughan' },
  ],
};

const controlElements: ControlElementsProp<FullField, string> = {
  actionElement: BaseActionElement,
  notToggle: BaseNotToggle,
  valueEditor: BaseValueEditor,
  valueSelector: BaseValueSelector,
};

export const App = () => {
  const [query, setQuery] = useState(initialQuery);

  return (
    <div>
      <QueryBuilder
        fields={fields}
        query={query}
        onQueryChange={setQuery}
        controlElements={controlElements}
      />

      <h4>Query</h4>
      <pre>
        <code>{formatQuery(query, 'json')}</code>
      </pre>
    </div>
  );
};
