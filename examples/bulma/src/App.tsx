import { QueryBuilderBulma } from '@react-querybuilder/bulma';
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
  rules: [],
};

export const App = () => {
  const [query, setQuery] = useState(initialQuery);

  return (
    <div>
      <QueryBuilderBulma>
        <QueryBuilder
          fields={fields}
          query={query}
          onQueryChange={q => setQuery(q)}
        />
      </QueryBuilderBulma>
      <h4>Query</h4>
      <pre>
        <code>{formatQuery(query, 'json')}</code>
      </pre>
    </div>
  );
};
