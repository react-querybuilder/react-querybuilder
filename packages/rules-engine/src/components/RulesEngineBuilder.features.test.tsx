// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import * as React from 'react';
import type { ConsequentTypeOption, RulesEngine, RulesEngineProps } from '../types';
import { RulesEngineBuilder } from './RulesEngineBuilder';

const emptyAntecedent = { combinator: 'and' as const, rules: [] };

/** Renders a controlled {@link RulesEngineBuilder}, exposing the latest rules engine state. */
const renderRE = (props: Partial<RulesEngineProps> & { rulesEngine: RulesEngine }) => {
  const ref: { current: RulesEngine } = { current: props.rulesEngine };
  const Wrapper = () => {
    const [re, setRE] = React.useState<RulesEngine>(props.rulesEngine);
    ref.current = re;
    const onRulesEngineChange = React.useCallback((r: RulesEngine) => setRE(r), []);
    return (
      <RulesEngineBuilder {...props} rulesEngine={re} onRulesEngineChange={onRulesEngineChange} />
    );
  };
  render(<Wrapper />);
  return {
    get latest() {
      return ref.current;
    },
  };
};

describe('shift actions', () => {
  const twoTypes = [
    { name: 'log', label: 'Log' },
    { name: 'warn', label: 'Warn' },
  ];
  const reTwo = (): RulesEngine => ({
    conditions: [
      { antecedent: emptyAntecedent, consequent: { type: 'log' } },
      { antecedent: emptyAntecedent, consequent: { type: 'warn' } },
    ],
  });

  it('renders shift buttons in each condition header when enabled', () => {
    renderRE({ rulesEngine: reTwo(), consequentTypes: twoTypes, showShiftActions: true });
    expect(screen.getAllByTitle('Shift condition up')).toHaveLength(2);
    expect(screen.getAllByTitle('Shift condition down')).toHaveLength(2);
  });

  it('does not render shift buttons by default', () => {
    renderRE({ rulesEngine: reTwo(), consequentTypes: twoTypes });
    expect(screen.queryByTitle('Shift condition up')).toBeNull();
  });

  it('disables shift-up on the first and shift-down on the last condition', () => {
    renderRE({ rulesEngine: reTwo(), consequentTypes: twoTypes, showShiftActions: true });
    const ups = screen.getAllByTitle('Shift condition up') as HTMLButtonElement[];
    const downs = screen.getAllByTitle('Shift condition down') as HTMLButtonElement[];
    expect(ups[0].disabled).toBe(true);
    expect(ups[1].disabled).toBe(false);
    expect(downs[0].disabled).toBe(false);
    expect(downs[1].disabled).toBe(true);
  });

  it('shifts a condition down when clicked', () => {
    const re = renderRE({
      rulesEngine: reTwo(),
      consequentTypes: twoTypes,
      showShiftActions: true,
    });
    fireEvent.click(screen.getAllByTitle('Shift condition down')[0]);
    expect(re.latest.conditions[0].consequent?.type).toBe('warn');
    expect(re.latest.conditions[1].consequent?.type).toBe('log');
  });

  it('cancels the move when onMoveCondition returns false', () => {
    const onMoveCondition = vi.fn<NonNullable<RulesEngineProps['onMoveCondition']>>(() => false);
    const re = renderRE({
      rulesEngine: reTwo(),
      consequentTypes: twoTypes,
      showShiftActions: true,
      onMoveCondition,
    });
    fireEvent.click(screen.getAllByTitle('Shift condition down')[0]);
    expect(onMoveCondition).toHaveBeenCalledTimes(1);
    expect(onMoveCondition.mock.calls[0][2]).toBe('down');
    expect(re.latest.conditions[0].consequent?.type).toBe('log');
  });

  it('replaces state when onMoveCondition returns a new rules engine', () => {
    const replacement: RulesEngine = {
      conditions: [{ antecedent: emptyAntecedent, consequent: { type: 'warn' } }],
    };
    const re = renderRE({
      rulesEngine: reTwo(),
      consequentTypes: twoTypes,
      showShiftActions: true,
      onMoveCondition: () => replacement,
    });
    fireEvent.click(screen.getAllByTitle('Shift condition down')[0]);
    expect(re.latest.conditions).toHaveLength(1);
    expect(re.latest.conditions[0].consequent?.type).toBe('warn');
  });
});

describe('default consequent seeding', () => {
  const types = [{ name: 'log', label: 'Log' }];
  const reNoConsequent = (): RulesEngine => ({ conditions: [{ antecedent: emptyAntecedent }] });

  it('seeds a consequent on newly added conditions when enabled', () => {
    const re = renderRE({
      rulesEngine: reNoConsequent(),
      consequentTypes: types,
      addConsequentToNewConditions: true,
    });
    fireEvent.click(screen.getByText('+ Condition'));
    expect(re.latest.conditions).toHaveLength(2);
    expect(re.latest.conditions[1].consequent?.type).toBe('log');
    expect(screen.getByText('Then')).toBeInTheDocument();
  });

  it('does not seed a consequent on new conditions by default', () => {
    const re = renderRE({ rulesEngine: reNoConsequent(), consequentTypes: types });
    fireEvent.click(screen.getByText('+ Condition'));
    expect(re.latest.conditions).toHaveLength(2);
    expect(re.latest.conditions[1].consequent).toBeUndefined();
    expect(screen.queryByText('Then')).toBeNull();
  });

  it('falls back to the placeholder type when no consequent types are available', () => {
    const re = renderRE({
      rulesEngine: reNoConsequent(),
      consequentTypes: [],
      addConsequentToNewConditions: true,
    });
    fireEvent.click(screen.getByText('+ Condition'));
    expect(re.latest.conditions[1].consequent?.type).toBe('~');
  });

  it('uses the default type when adding a consequent via the header (ensureConsequent)', () => {
    const re = renderRE({ rulesEngine: reNoConsequent(), consequentTypes: types });
    fireEvent.click(screen.getByText('+ Then'));
    expect(re.latest.conditions[0].consequent?.type).toBe('log');
  });

  it('uses the default type when adding a default consequent (ensureDefaultConsequent)', () => {
    const re = renderRE({ rulesEngine: reNoConsequent(), consequentTypes: types });
    fireEvent.click(screen.getByText('+ Else'));
    expect(re.latest.defaultConsequent?.type).toBe('log');
    expect(screen.getByText('Else')).toBeInTheDocument();
  });
});

describe('consequent property editor', () => {
  const propsType: ConsequentTypeOption[] = [
    {
      name: 'log',
      label: 'Log',
      properties: [
        { name: 'message', label: 'Message', inputType: 'text' },
        { name: 'body', label: 'Body', inputType: 'textarea' },
        { name: 'count', inputType: 'number' },
        { name: 'enabled', label: 'Enabled', inputType: 'checkbox' },
        {
          name: 'level',
          label: 'Level',
          inputType: 'select',
          values: [
            { name: 'info', label: 'Info' },
            { name: 'warn', label: 'Warn' },
          ],
        },
        { name: 'choice', label: 'Choice', inputType: 'select' },
        { name: 'plain', label: 'Plain' },
      ],
    },
  ];
  const reWithProps = (): RulesEngine => ({
    conditions: [
      { antecedent: emptyAntecedent, consequent: { type: 'log', params: { level: 'info' } } },
    ],
  });

  it('renders an input for each property type', () => {
    renderRE({ rulesEngine: reWithProps(), consequentTypes: propsType });
    expect(screen.getByLabelText('Message')).toHaveProperty('type', 'text');
    expect(screen.getByLabelText('Body').tagName).toBe('TEXTAREA');
    expect(screen.getByLabelText('count')).toHaveProperty('type', 'number');
    expect(screen.getByLabelText('Enabled')).toHaveProperty('type', 'checkbox');
    expect(screen.getByLabelText('Level').tagName).toBe('SELECT');
    expect(screen.getByLabelText('Plain')).toHaveProperty('type', 'text');
  });

  it('renders an empty select when no values are provided', () => {
    renderRE({ rulesEngine: reWithProps(), consequentTypes: propsType });
    expect(within(screen.getByLabelText('Choice')).queryAllByRole('option')).toHaveLength(0);
  });

  it('writes a text property to params', () => {
    const re = renderRE({ rulesEngine: reWithProps(), consequentTypes: propsType });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'hi' } });
    expect(re.latest.conditions[0].consequent?.params).toMatchObject({ message: 'hi' });
  });

  it('writes a textarea property to params', () => {
    const re = renderRE({ rulesEngine: reWithProps(), consequentTypes: propsType });
    fireEvent.change(screen.getByLabelText('Body'), { target: { value: 'multi' } });
    expect(re.latest.conditions[0].consequent?.params).toMatchObject({ body: 'multi' });
  });

  it('writes a number property and clears it to undefined', () => {
    const re = renderRE({ rulesEngine: reWithProps(), consequentTypes: propsType });
    fireEvent.change(screen.getByLabelText('count'), { target: { value: '5' } });
    expect(re.latest.conditions[0].consequent?.params).toMatchObject({ count: 5 });
    fireEvent.change(screen.getByLabelText('count'), { target: { value: '' } });
    expect(
      (re.latest.conditions[0].consequent!.params as Record<string, unknown>).count
    ).toBeUndefined();
  });

  it('toggles a checkbox property', () => {
    const re = renderRE({ rulesEngine: reWithProps(), consequentTypes: propsType });
    fireEvent.click(screen.getByLabelText('Enabled'));
    expect(re.latest.conditions[0].consequent?.params).toMatchObject({ enabled: true });
  });

  it('writes a select property (option value falls back to name)', () => {
    const re = renderRE({ rulesEngine: reWithProps(), consequentTypes: propsType });
    fireEvent.change(screen.getByLabelText('Level'), { target: { value: 'warn' } });
    expect(re.latest.conditions[0].consequent?.params).toMatchObject({ level: 'warn' });
  });

  it('resets params and seeds defaults when switching to another property-based type', () => {
    const twoPropTypes: ConsequentTypeOption[] = [
      { name: 'log', label: 'Log', properties: [{ name: 'message', label: 'Message' }] },
      {
        name: 'email',
        label: 'Email',
        properties: [{ name: 'subject', label: 'Subject', defaultValue: 'Hi' }],
      },
    ];
    const re = renderRE({
      rulesEngine: {
        conditions: [
          { antecedent: emptyAntecedent, consequent: { type: 'log', params: { message: 'x' } } },
        ],
      },
      consequentTypes: twoPropTypes,
    });
    fireEvent.change(screen.getByDisplayValue('Log'), { target: { value: 'email' } });
    expect(re.latest.conditions[0].consequent?.type).toBe('email');
    expect(re.latest.conditions[0].consequent?.params).toEqual({ subject: 'Hi' });
    expect(screen.getByLabelText('Subject')).toHaveValue('Hi');
    expect(screen.queryByLabelText('Message')).toBeNull();
  });

  it('drops managed params when switching to a type without properties', () => {
    const mixed: ConsequentTypeOption[] = [
      { name: 'log', label: 'Log', properties: [{ name: 'message', label: 'Message' }] },
      { name: 'noop', label: 'Noop' },
    ];
    const re = renderRE({
      rulesEngine: {
        conditions: [
          { antecedent: emptyAntecedent, consequent: { type: 'log', params: { message: 'x' } } },
        ],
      },
      consequentTypes: mixed,
    });
    fireEvent.change(screen.getByDisplayValue('Log'), { target: { value: 'noop' } });
    expect(re.latest.conditions[0].consequent?.type).toBe('noop');
    expect(re.latest.conditions[0].consequent?.params).toBeUndefined();
  });

  it('preserves arbitrary consequent fields when neither type has properties', () => {
    const plainTypes = [
      { name: 'a', label: 'A' },
      { name: 'b', label: 'B' },
    ];
    const re = renderRE({
      rulesEngine: {
        conditions: [{ antecedent: emptyAntecedent, consequent: { type: 'a', foo: 'bar' } }],
      },
      consequentTypes: plainTypes,
    });
    fireEvent.change(screen.getByDisplayValue('A'), { target: { value: 'b' } });
    expect(re.latest.conditions[0].consequent?.type).toBe('b');
    expect(re.latest.conditions[0].consequent?.foo).toBe('bar');
  });
});
