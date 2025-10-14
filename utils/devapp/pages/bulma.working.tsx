import { QueryBuilderBulma } from '@react-querybuilder/bulma';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryBuilder } from 'react-querybuilder';
import { DevLayout } from '../DevLayout';
import { useDevApp } from '../useDevApp';
import './bulma.css';

const App = () => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <QueryBuilderBulma>
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
      </QueryBuilderBulma>
    </DevLayout>
  );
};

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
