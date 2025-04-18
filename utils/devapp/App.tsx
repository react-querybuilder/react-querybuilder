import * as React from 'react';
import { QueryBuilder } from 'react-querybuilder';
import { DevLayout } from './DevLayout';
import { useDevApp } from './useDevApp';

export const App = (): React.JSX.Element => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
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
    </DevLayout>
  );
};
