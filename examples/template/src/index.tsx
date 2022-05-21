// __IMPORTS__
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Field, formatQuery, QueryBuilder, RuleGroupType } from 'react-querybuilder';
import './index.scss';

// __ADDITIONAL_DECLARATIONS__

const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const initialQuery: RuleGroupType = {
  combinator: 'and',
  rules: [],
};

const App = () => {
  const [query, setQuery] = useState(initialQuery);

  return (
    // __WRAPPER_OPEN__
    <div>
      <QueryBuilder
        fields={fields}
        query={query}
        onQueryChange={q => setQuery(q)}
        // __RQB_PROPS__
      />
      <h4>Query</h4>
      <pre>
        <code>{formatQuery(query, 'json')}</code>
      </pre>
    </div>
    // __WRAPPER_CLOSE__
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
