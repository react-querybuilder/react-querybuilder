import { useState , useDeferredValue} from 'react';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { QueryBuilder, formatQuery } from 'react-querybuilder';
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
  const differedQuery = useDeferredValue(query);

  return (
    <div>
      <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />

      <h4>Query</h4>
      <pre>
        <code>{formatQuery(differedQuery, 'json')}</code>
      </pre>
    </div>
  );
};
