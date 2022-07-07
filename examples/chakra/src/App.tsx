import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { chakraControlElements } from '@react-querybuilder/chakra';
import { useState } from 'react';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { formatQuery, QueryBuilder } from 'react-querybuilder';

const chakraTheme = extendTheme({
  config: { initialColorMode: 'light', useSystemColorMode: false },
});

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
    <ChakraProvider theme={chakraTheme}>
      <div>
        <QueryBuilder
          fields={fields}
          query={query}
          onQueryChange={q => setQuery(q)}
          controlElements={chakraControlElements}
        />
        <h4>Query</h4>
        <pre>
          <code>{formatQuery(query, 'json')}</code>
        </pre>
      </div>
    </ChakraProvider>
  );
};
