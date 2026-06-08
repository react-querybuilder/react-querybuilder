// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { RulesEngineBuilder } from '../components';
import type { ConsequentProps, RulesEngine } from '../types';
import { useRulesEngineBuilderRulesEngine } from './hooks';

const consequentTypes = [{ name: 'log', label: 'Log' }];

const rulesEngine: RulesEngine = {
  conditions: [
    { antecedent: { combinator: 'and', rules: [] }, consequent: { type: 'log' } },
    { antecedent: { combinator: 'and', rules: [] }, consequent: { type: 'log' } },
  ],
};

// Custom consequent body that reads the live rules engine via the public hook, exercising
// `useRulesEngineBuilderRulesEngine` against the nearest ancestor `RulesEngineBuilder`. The store
// is populated by the builder's mount effect, so the value is `undefined` on first render and
// resolves once effects flush.
const HookProbe = (props: ConsequentProps) => {
  const re = useRulesEngineBuilderRulesEngine({ schema: props.schema });
  return <span data-testid="probe">{re?.conditions?.length ?? 0}</span>;
};

// Controlled wrapper (matches recommended usage: state + onRulesEngineChange) so the rules engine
// identity stays stable across renders.
const Wrapper = () => {
  const [re, setRE] = React.useState<RulesEngine>(() => rulesEngine);
  return (
    <RulesEngineBuilder
      rulesEngine={re}
      onRulesEngineChange={setRE}
      consequentTypes={consequentTypes}
      components={{ consequentBuilderBody: HookProbe }}
    />
  );
};

it('useRulesEngineBuilderRulesEngine returns the nearest builder rules engine', () => {
  render(<Wrapper />);

  // One probe per consequent; each resolves the same rules engine (two conditions).
  const probes = screen.getAllByTestId('probe');
  expect(probes).toHaveLength(2);
  for (const probe of probes) {
    expect(probe).toHaveTextContent('2');
  }
});
