import * as React from 'react';
import * as ReactDnD from 'react-dnd';
import * as ReactDnDHTML5Backend from 'react-dnd-html5-backend';
import { createRoot } from 'react-dom/client';
import { QueryBuilder } from 'react-querybuilder';
import { DevLayout, useDevApp } from 'react-querybuilder/dev/index.js';
import 'react-querybuilder/dist/query-builder.scss';
import { QueryBuilderDnD } from '../src/QueryBuilderDnD';

const App = () => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDnDHTML5Backend }}>
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
      </QueryBuilderDnD>
    </DevLayout>
  );
};

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
