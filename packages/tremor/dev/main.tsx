import { DevLayout, useDevApp } from '@rqb-devapp';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import type { Classnames } from 'react-querybuilder';
import { QueryBuilder } from 'react-querybuilder';
import { QueryBuilderTremor } from '../src';
import './styles.css';

const controlClassnames: Partial<Classnames> = {
  fields: 'w-max',
  operators: 'w-max',
  combinators: 'w-max',
  matchMode: 'w-max',
};

const App = () => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <QueryBuilderTremor controlClassnames={controlClassnames}>
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
      </QueryBuilderTremor>
    </DevLayout>
  );
};

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
