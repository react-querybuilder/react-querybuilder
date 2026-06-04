// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import type { RulesEngine } from '../types';
import { RulesEngineBuilder } from './RulesEngineBuilder';

const consequentTypes = [{ name: 'log', label: 'Log' }];

const makeRulesEngine = (evaluationMode?: RulesEngine['evaluationMode']): RulesEngine => ({
  evaluationMode,
  conditions: [
    { antecedent: { combinator: 'and', rules: [] }, consequent: { type: 'log' } },
    { antecedent: { combinator: 'and', rules: [] }, consequent: { type: 'log' } },
  ],
  defaultConsequent: { type: 'log' },
});

// Controlled wrapper (matches recommended usage: state + onRulesEngineChange).
const Wrapper = ({ evaluationMode }: { evaluationMode?: RulesEngine['evaluationMode'] }) => {
  const [re, setRE] = React.useState<RulesEngine>(() => makeRulesEngine(evaluationMode));
  return (
    <RulesEngineBuilder
      rulesEngine={re}
      onRulesEngineChange={setRE}
      consequentTypes={consequentTypes}
    />
  );
};

describe('RulesEngineBuilder block labels', () => {
  it('uses if/else-if/then/else labels in cascade mode (default)', () => {
    render(<Wrapper />);
    expect(screen.getByText('If')).toBeInTheDocument();
    expect(screen.getByText('Else If')).toBeInTheDocument();
    expect(screen.getAllByText('Then')).toHaveLength(2);
    expect(screen.getByText('Else')).toBeInTheDocument();
    expect(screen.queryByText('When')).not.toBeInTheDocument();
    expect(screen.queryByText('Always')).not.toBeInTheDocument();
  });

  it('uses when/then/always labels in cumulative mode', () => {
    render(<Wrapper evaluationMode="cumulative" />);
    expect(screen.getAllByText('When')).toHaveLength(2);
    expect(screen.getAllByText('Then')).toHaveLength(2);
    expect(screen.getByText('Always')).toBeInTheDocument();
    expect(screen.queryByText('If')).not.toBeInTheDocument();
    expect(screen.queryByText('Else If')).not.toBeInTheDocument();
    expect(screen.queryByText('Else')).not.toBeInTheDocument();
  });
});
