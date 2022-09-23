import { QueryBuilderAntD } from '@react-querybuilder/antd';
import { useState } from 'react';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { formatQuery, QueryBuilder } from 'react-querybuilder';
import './styles.scss';

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
      <QueryBuilderAntD>
        <QueryBuilder
          fields={fields}
          query={query}
          onQueryChange={q => setQuery(q)}
        />
      </QueryBuilderAntD>
      <h4>Query</h4>
      <pre>
        <code>{formatQuery(query, 'json_without_ids')}</code>
      </pre>
    </div>
  );
};
