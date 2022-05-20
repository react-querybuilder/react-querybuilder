import { createTheme, ThemeProvider } from '@mui/material/styles';
import { materialControlElements } from '@react-querybuilder/material';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Field, formatQuery, QueryBuilder, RuleGroupType } from 'react-querybuilder';
import './index.scss';

const muiTheme = createTheme();

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
    <ThemeProvider theme={muiTheme}>
      <div>
        <QueryBuilder
          fields={fields}
          query={query}
          onQueryChange={q => setQuery(q)}
          controlElements={materialControlElements}
        />
        <h4>Query</h4>
        <pre>
          <code>{formatQuery(query, 'json')}</code>
        </pre>
      </div>
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
