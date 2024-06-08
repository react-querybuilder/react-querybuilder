import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryBuilder } from 'react-querybuilder';
import { DevLayout, useDevApp } from '@dev';
import 'react-querybuilder/src/query-builder.scss';
import { QueryBuilderFluent } from '../src';
import './styles.scss';

const App = () => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <FluentProvider theme={webLightTheme}>
        <QueryBuilderFluent>
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
        </QueryBuilderFluent>
      </FluentProvider>
    </DevLayout>
  );
};

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
