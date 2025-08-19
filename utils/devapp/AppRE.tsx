import * as React from 'react';
import { dummyRE, RulesEngineBuilder } from 'react-querybuilder';
import { DevLayout } from './DevLayout';
import { useDevApp } from './useDevApp';

export const AppRE = (): React.JSX.Element => {
  const devApp = useDevApp();
  const [re, setRE] = React.useState(dummyRE);

  return (
    <DevLayout {...devApp}>
      <RulesEngineBuilder
        // {...devApp.commonRQBProps}
        onRulesEngineChange={setRE}
      />
      <pre>
        <code>{JSON.stringify(re, null, 2)}</code>
      </pre>
    </DevLayout>
  );
};
