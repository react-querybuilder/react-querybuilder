import * as React from 'react';
import { QueryBuilder } from '../src';
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
        />
      ) : (
        <QueryBuilder
          {...devApp.commonRQBProps}
          key="queryIC"
          query={devApp.queryIC}
          onQueryChange={devApp.onQueryChangeIC}
        />
      )}
    </DevLayout>
  );
};
