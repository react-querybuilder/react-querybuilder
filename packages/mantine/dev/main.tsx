import { MantineProvider } from '@mantine/core';
import { DevLayout, useDevApp } from '@rqb-devapp';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryBuilder } from 'react-querybuilder';
import { QueryBuilderMantine } from '../src';
import './styles.scss';

const App = () => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <MantineProvider>
        <QueryBuilderMantine>
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
        </QueryBuilderMantine>
      </MantineProvider>
    </DevLayout>
  );
};

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
