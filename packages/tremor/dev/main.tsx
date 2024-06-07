import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryBuilder } from 'react-querybuilder';
import { DevLayout, useDevApp } from 'react-querybuilder/dev/index.js';
import 'react-querybuilder/dist/query-builder.scss';
import { QueryBuilderTremor } from '../src';
import './styles.scss';

const App = () => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <QueryBuilderTremor
        controlClassnames={{ fields: 'w-max', operators: 'w-max', combinators: 'w-max' }}>
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
      </QueryBuilderTremor>
    </DevLayout>
  );
};

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
