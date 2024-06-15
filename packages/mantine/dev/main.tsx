import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryBuilder } from 'react-querybuilder';
import { DevLayout, useDevApp } from '@rqb-devapp';
import 'react-querybuilder/query-builder.scss';
import { QueryBuilderMantine } from '../src';
import './styles.scss';

const App = () => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <MantineProvider>
        <QueryBuilderMantine>
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
        </QueryBuilderMantine>
      </MantineProvider>
    </DevLayout>
  );
};

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
