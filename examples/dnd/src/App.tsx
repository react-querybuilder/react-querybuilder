import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import { useState } from 'react';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { QueryBuilder, formatQuery } from 'react-querybuilder';
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

export const App = () => {
  const [query, setQuery] = useState(initialQuery);

  return (
    <div>
      <ul>
        <li>
          Hold <kbd>Alt</kbd>/<kbd>Option</kbd>/<kbd>⌥</kbd> before and during
          dragging to clone the source rule.
        </li>
        <li>
          Hold <kbd>Ctrl</kbd> before and during dragging to create a new group
          with the target and source rules.
        </li>
      </ul>
      <QueryBuilderDnD>
        <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
      </QueryBuilderDnD>
      <h4>Query</h4>
      <pre>
        <code>{formatQuery(query, 'json')}</code>
      </pre>
    </div>
  );
};
