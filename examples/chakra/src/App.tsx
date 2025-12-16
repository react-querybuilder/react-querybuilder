import { ChakraProvider, Theme, createSystem, defaultConfig } from '@chakra-ui/react';
import { QueryBuilderChakra } from '@react-querybuilder/chakra';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { QueryBuilder, formatQuery } from 'react-querybuilder';
import './styles.css';

const chakraTheme = createSystem(defaultConfig);

const Provider = (props: React.PropsWithChildren) => (
  <ChakraProvider value={chakraTheme}>
    <ThemeProvider attribute="class" disableTransitionOnChange>
      {props.children}
    </ThemeProvider>
  </ChakraProvider>
);

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
      <Provider>
        <Theme colorPalette="teal">
          <QueryBuilderChakra>
            <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
          </QueryBuilderChakra>
        </Theme>
      </Provider>
      <h4>Query</h4>
      <pre>
        <code>{formatQuery(query, 'json')}</code>
      </pre>
    </div>
  );
};
