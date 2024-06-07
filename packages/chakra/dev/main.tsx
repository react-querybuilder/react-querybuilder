import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryBuilder } from 'react-querybuilder';
import { DevLayout, useDevApp } from 'react-querybuilder/dev/index.js';
import 'react-querybuilder/dist/query-builder.scss';
import { QueryBuilderChakra } from '../src';
import './styles.scss';

const chakraTheme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        color: 'rebeccapurple',
        fontWeight: 'bold', // Normally "semibold"
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

const App = () => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <ChakraProvider theme={chakraTheme}>
        <QueryBuilderChakra>
          {!devApp.optVals.independentCombinators ? (
            <QueryBuilder
              {...devApp.commonRQBProps}
              key="query"
              query={devApp.query}
              onQueryChange={devApp.onQueryChange}
            />
          ) : (
            <QueryBuilder
              {...devApp.commonRQBProps}
              key="queryIC"
              query={devApp.queryIC}
              onQueryChange={devApp.onQueryChangeIC}
            />
          )}
        </QueryBuilderChakra>
      </ChakraProvider>
    </DevLayout>
  );
};

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
