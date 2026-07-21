import type { Field } from '@react-querybuilder/core';
import type { ConsequentTypeOption, RulesEngine } from '@react-querybuilder/rules-engine';
import {
  formatRulesEngine,
  regenerateREIDs,
  RulesEngineBuilder,
} from '@react-querybuilder/rules-engine';
import * as React from 'react';
import { DevLayout } from './DevLayout';
import { useDevApp } from './useDevApp';

const fields: Field[] = [{ name: 'age', label: 'Age', inputType: 'number' }];

const consequentTypes: ConsequentTypeOption[] = [
  {
    name: 'send_email',
    label: 'Send Email',
    properties: [
      { name: 'to', label: 'To' },
      { name: 'subject', label: 'Subject' },
      { name: 'body', label: 'Body', inputType: 'textarea' },
    ],
  },
  {
    name: 'log_event',
    label: 'Log Event',
    properties: [
      { name: 'message', label: 'Message' },
      {
        name: 'level',
        label: 'Level',
        inputType: 'select',
        defaultValue: 'info',
        values: [
          { name: 'info', label: 'Info' },
          { name: 'warn', label: 'Warning' },
          { name: 'error', label: 'Error' },
        ],
      },
    ],
  },
];

const initialRE: RulesEngine = regenerateREIDs({
  defaultConsequent: { id: '3', type: 'log_event' },
  conditions: [
    {
      antecedent: { combinator: 'and', rules: [{ field: 'age', operator: '>=', value: 18 }] },
      consequent: {
        type: 'send_email',
        params: { to: 'user@example.com', subject: 'Welcome!', body: 'Thanks for signing up!' },
      },
      conditions: [
        {
          antecedent: { combinator: 'and', rules: [{ field: 'age', operator: '=', value: 18 }] },
          consequent: {
            type: 'send_email',
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
        type: 'send_email',
        params: {
          to: 'user@example.com',
          subject: 'Sorry!',
          body: 'You must be 18 or older to sign up.',
        },
      },
    },
  ],
});

const extraOptions = {
  addConsequentToNewConditions: false,
  allowDefaultConsequents: true,
  allowNestedConditions: true,
  autoSelectConsequentType: true,
  showShiftActions: false,
};

export const AppRE = (): React.JSX.Element => {
  const [re, setRE] = React.useState(initialRE);
  const exportFormats = React.useMemo(
    () => ({
      'rules-engine': formatRulesEngine(re),
      'json-rules-engine': JSON.stringify(
        formatRulesEngine(re, { format: 'json-rules-engine' }),
        null,
        2
      ),
      rulepilot: JSON.stringify(formatRulesEngine(re, { format: 'rulepilot' }), null, 2),
    }),
    [re]
  );

  const devApp = useDevApp(extraOptions, exportFormats);

  const rebClassnames = React.useMemo(
    () => ({
      rulesEngineBuilder: devApp.optVals.justifiedLayout ? 'rulesEngineBuilder-justified' : '',
    }),
    [devApp.optVals.justifiedLayout]
  );

  const queryBuilderProps = React.useMemo(
    () => ({ ...devApp.commonRQBProps, fields }),
    [devApp.commonRQBProps]
  );

  return (
    <DevLayout {...devApp}>
      <RulesEngineBuilder
        addConsequentToNewConditions={devApp.optVals.addConsequentToNewConditions}
        allowDefaultConsequents={devApp.optVals.allowDefaultConsequents}
        allowNestedConditions={devApp.optVals.allowNestedConditions}
        autoSelectConsequentType={devApp.optVals.autoSelectConsequentType}
        suppressStandardClassnames={devApp.optVals.suppressStandardClassnames}
        showBranches={devApp.optVals.showBranches}
        showShiftActions={devApp.optVals.showShiftActions}
        classnames={rebClassnames}
        rulesEngine={re}
        queryBuilderProps={queryBuilderProps}
        onRulesEngineChange={setRE}
        consequentTypes={consequentTypes}
      />
    </DevLayout>
  );
};
