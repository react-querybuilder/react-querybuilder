import { DevLayout, useDevApp } from '@rqb-devapp';
import { PrimeReactProvider } from 'primereact/api';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryBuilder } from 'react-querybuilder';
import { QueryBuilderPrime } from '../src';
import './styles.scss';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';

const App = () => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <PrimeReactProvider>
        <QueryBuilderPrime>
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
        </QueryBuilderPrime>
      </PrimeReactProvider>
    </DevLayout>
  );
};

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
