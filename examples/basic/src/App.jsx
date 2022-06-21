import { useState } from 'react';
import { formatQuery, QueryBuilder } from 'react-querybuilder';

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const initialQuery = {
  combinator: 'and',
  rules: [],
};
export const App = () => {
  const [query, setQuery] = useState(initialQuery);

  return (
    <div>
      <QueryBuilder fields={fields} query={query} onQueryChange={q => setQuery(q)} />
      <h4>Query</h4>
      <pre>
        <code>{formatQuery(query, 'json')}</code>
      </pre>
    </div>
  );
};
