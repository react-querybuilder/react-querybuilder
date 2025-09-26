import type { BaseOption, Field, FullOptionList } from '@react-querybuilder/core';
import { regenerateIDs, toFullOptionList } from '@react-querybuilder/core';
import type { RulesEngine } from '@react-querybuilder/rules-engine';
import { RulesEngineBuilder } from '@react-querybuilder/rules-engine';
import * as React from 'react';
import { DevLayout } from './DevLayout';
import { useDevApp } from './useDevApp';

const fields: Field[] = [{ name: 'age', label: 'Age' }];

const actionTypes: FullOptionList<BaseOption> = toFullOptionList([
  { value: 'send_email', label: 'Send Email' },
  { value: 'log_event', label: 'Log Event' },
]);

const initialRE: RulesEngine = regenerateIDs({
  conditions: [
    {
      combinator: 'and',
      rules: [{ field: 'age', operator: '>=', value: 18 }],
      action: {
        actionType: 'send_email',
        params: { to: 'user@example.com', subject: 'Welcome!', body: 'Thanks for signing up!' },
      },
      conditions: [
        {
          combinator: 'and',
          rules: [{ field: 'age', operator: '=', value: 18 }],
          action: {
            actionType: 'send_email',
            params: {
              to: 'user@example.com',
              subject: 'Happy Birthday!',
              body: 'Thanks for signing up!',
            },
          },
        },
      ],
    },
    {
      combinator: 'and',
      rules: [{ field: 'age', operator: '<', value: 18 }],
      action: {
        actionType: 'send_email',
        params: {
          to: 'user@example.com',
          subject: 'Sorry!',
          body: 'You must be 18 or older to sign up.',
        },
      },
    },
    { id: '3', actionType: 'log_event' },
  ],
});

export const AppRE = (): React.JSX.Element => {
  const devApp = useDevApp();
  const [re, setRE] = React.useState(initialRE);

  return (
    <DevLayout {...devApp}>
      <RulesEngineBuilder
        // {...devApp.commonRQBProps}
        rulesEngine={re}
        fields={fields}
        onRulesEngineChange={setRE}
        actionTypes={actionTypes}
      />
      <pre>
        <code>{JSON.stringify(re, null, 2)}</code>
      </pre>
    </DevLayout>
  );
};
