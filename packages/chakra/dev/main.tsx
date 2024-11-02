import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryBuilder } from 'react-querybuilder';
import { DevLayout, useDevApp } from '@rqb-devapp';
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
          {devApp.optVals.independentCombinators ? (
            <QueryBuilder
              key="queryIC"
              {...devApp.commonRQBProps}
              query={devApp.queryIC}
              onQueryChange={devApp.onQueryChangeIC}
            />
          ) : (
            <QueryBuilder
              key="query"
              {...devApp.commonRQBProps}
              query={devApp.query}
              onQueryChange={devApp.onQueryChange}
            />
          )}
        </QueryBuilderChakra>
      </ChakraProvider>
    </DevLayout>
  );
};

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
