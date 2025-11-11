import type { BaseOption, Field, FullOptionList } from '@react-querybuilder/core';
import { toFullOptionList } from '@react-querybuilder/core';
import type { RulesEngine } from '@react-querybuilder/rules-engine';
import { regenerateREIDs, RulesEngineBuilder } from '@react-querybuilder/rules-engine';
import * as React from 'react';
import { DevLayout } from './DevLayout';
import { useDevApp } from './useDevApp';

const fields: Field[] = [{ name: 'age', label: 'Age' }];
const queryBuilderProps = { fields };

const consequentTypes: FullOptionList<BaseOption> = toFullOptionList([
  { value: 'send_email', label: 'Send Email' },
  { value: 'log_event', label: 'Log Event' },
]);

const initialRE: RulesEngine = regenerateREIDs({
  defaultConsequent: { id: '3', consequentType: 'log_event' },
  conditions: [
    {
      antecedent: { combinator: 'and', rules: [{ field: 'age', operator: '>=', value: 18 }] },
      consequent: {
        consequentType: 'send_email',
        params: { to: 'user@example.com', subject: 'Welcome!', body: 'Thanks for signing up!' },
      },
      conditions: [
        {
          antecedent: { combinator: 'and', rules: [{ field: 'age', operator: '=', value: 18 }] },
          consequent: {
            consequentType: 'send_email',
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
      antecedent: { combinator: 'and', rules: [{ field: 'age', operator: '<', value: 18 }] },
      consequent: {
        consequentType: 'send_email',
        params: {
          to: 'user@example.com',
          subject: 'Sorry!',
          body: 'You must be 18 or older to sign up.',
        },
      },
    },
  ],
});

const preStyle: React.CSSProperties = { marginTop: 'var(--rqbre-spacing)' };

export const AppRE = (): React.JSX.Element => {
  const devApp = useDevApp();
  const [re, setRE] = React.useState(initialRE);

  const {
    optVals: { justifiedLayout, suppressStandardClassnames },
  } = devApp;

  const rebClassnames = React.useMemo(
    () => ({ rulesEngineBuilder: justifiedLayout ? 'rulesEngineBuilder-justified' : '' }),
    [justifiedLayout]
  );

  return (
    <DevLayout {...devApp}>
      <RulesEngineBuilder
        // {...devApp.commonRQBProps}
        suppressStandardClassnames={suppressStandardClassnames}
        classnames={rebClassnames}
        rulesEngine={re}
        queryBuilderProps={queryBuilderProps}
        onRulesEngineChange={setRE}
        consequentTypes={consequentTypes}
      />
      <pre style={preStyle}>
        <code>{JSON.stringify(re, null, 2)}</code>
      </pre>
    </DevLayout>
  );
};
