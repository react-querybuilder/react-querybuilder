import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryBuilderMaterial } from '@react-querybuilder/material';
import { useState } from 'react';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { formatQuery, QueryBuilder } from 'react-querybuilder';
import './styles.scss';

const muiTheme = createTheme();

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
      <ThemeProvider theme={muiTheme}>
        <QueryBuilderMaterial>
          <QueryBuilder
            fields={fields}
            query={query}
            onQueryChange={q => setQuery(q)}
          />
        </QueryBuilderMaterial>
      </ThemeProvider>
      <h4>Query</h4>
      <pre>
        <code>{formatQuery(query, 'json_without_ids')}</code>
      </pre>
    </div>
  );
};
