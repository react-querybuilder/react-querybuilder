import * as React from 'react';
import { QueryBuilder } from 'react-querybuilder';
import { QueryBuilderHistory } from 'react-querybuilder/history';
import { DevLayout } from './DevLayout';
import { useDevApp } from './useDevApp';

export const App = (): React.JSX.Element => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <QueryBuilderHistory>
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
      </QueryBuilderHistory>
    </DevLayout>
  );
};
