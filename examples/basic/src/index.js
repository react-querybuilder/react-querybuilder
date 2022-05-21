import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { formatQuery, QueryBuilder } from 'react-querybuilder';
import './index.css';
const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];
const initialQuery = {
  combinator: 'and',
  rules: [],
};
const App = () => {
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
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
