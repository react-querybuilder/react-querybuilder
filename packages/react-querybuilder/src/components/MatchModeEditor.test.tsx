import type { FullField } from '@react-querybuilder/core';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import type { MatchModeEditorProps, Schema } from '../types';
import { MatchModeEditor } from './MatchModeEditor';
import { ValueEditor } from './ValueEditor';
import { ValueSelector } from './ValueSelector';

const baseSchema = {
  controls: { valueSelector: ValueSelector, valueEditor: ValueEditor },
  classNames: {},
  parseNumbers: true,
} as unknown as Schema<FullField, string>;

const baseProps: MatchModeEditorProps = {
  match: { mode: 'atLeast', threshold: 2 },
  options: [{ name: 'atLeast', value: 'atLeast', label: 'At least' }],
  title: 'Match mode',
  className: '',
  disabled: false,
  testID: 'match-mode-editor',
  schema: baseSchema,
  handleOnChange: () => {},
  path: [],
  level: 0,
  classNames: { matchMode: '', matchThreshold: '' },
  field: 'f',
  fieldData: { name: 'f', value: 'f', label: 'F' },
  rule: { field: 'f', operator: '=', value: 'v' },
};

describe('MatchModeEditor', () => {
  it('renders threshold input with placeholder from thresholdPlaceholder prop', () => {
    render(<MatchModeEditor {...baseProps} thresholdPlaceholder="#" />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('placeholder', '#');
  });

  it('renders threshold input without placeholder when prop is omitted', () => {
    render(<MatchModeEditor {...baseProps} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('placeholder', '');
  });

  it('does not render threshold input when match mode is nullish', () => {
    render(<MatchModeEditor {...baseProps} match={{ mode: undefined as never, threshold: 1 }} />);
    expect(screen.queryByRole('spinbutton')).toBeNull();
  });
});
