import { DevLayout, useDevApp } from '@rqb-devapp';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryBuilder } from 'react-querybuilder';
import { QueryBuilderDateTime } from '../src/QueryBuilderDateTime';
import './styles.scss';

const App = () => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <QueryBuilderDateTime>
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
      </QueryBuilderDateTime>
    </DevLayout>
  );
};

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
