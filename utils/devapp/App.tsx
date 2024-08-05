import * as React from 'react';
import { QueryBuilder } from 'react-querybuilder';
import { DevLayout } from './DevLayout';
import './styles.scss';
import { useDevApp } from './useDevApp';

export const App = () => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      {!devApp.optVals.independentCombinators ? (
        <QueryBuilder
          {...devApp.commonRQBProps}
          key="query"
          query={devApp.query}
          onQueryChange={devApp.onQueryChange}
          onAddGroup={(rg, pp, q, c) => { rg.title = "okGo"; console.log("ok GO"); return rg }}
        />
      ) : (
        <QueryBuilder
          {...devApp.commonRQBProps}
          key="queryIC"
          query={devApp.queryIC}
          onQueryChange={devApp.onQueryChangeIC}
          onAddGroup={(rg, pp, q, c) => { rg.title = "okGo"; console.log("ok GO"); return rg }}
        />
      )}
    </DevLayout>
  );
};
