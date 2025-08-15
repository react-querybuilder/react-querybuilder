import * as React from 'react';
import { RulesEngineBuilder } from 'react-querybuilder';
import { DevLayout } from './DevLayout';
import { useDevApp } from './useDevApp';

export const AppRE = (): React.JSX.Element => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <RulesEngineBuilder
      // {...devApp.commonRQBProps}
      />
    </DevLayout>
  );
};
