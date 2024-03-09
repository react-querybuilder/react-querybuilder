import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryBuilder } from 'react-querybuilder';
import { DevLayout, useDevApp } from 'react-querybuilder/dev/index';
import 'react-querybuilder/dist/query-builder.scss';
import { QueryBuilderAntD } from '../src';
import './styles.scss';

const App = () => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <QueryBuilderAntD>
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
      </QueryBuilderAntD>
    </DevLayout>
  );
};

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
