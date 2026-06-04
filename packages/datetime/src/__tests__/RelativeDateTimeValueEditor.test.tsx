// @vitest-environment jsdom
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import type { RuleType } from 'react-querybuilder';
import { QueryBuilder, standardClassnames } from 'react-querybuilder';
import { RelativeDateTimeConfigContext } from '../RelativeDateTimeConfigContext';
import {
  createOperatorModeController,
  toggleModeController,
  withRelativeOperators,
} from '../relativeDateTimeModeControllers';
import { RelativeDateTimeValueEditor } from '../RelativeDateTimeValueEditor';
import type { RelativeDateTimeEditorConfig } from '../types';
import { isRelativeDateTimeValue } from '../utils';

const user = userEvent.setup();

const relOp = { name: 'relative', value: 'relative', label: 'relative to' };
const operatorModeController = createOperatorModeController(['relative']);

const fields = [
  { name: 'f1', label: 'Field 1', inputType: 'datetime-local', datatype: 'datetime' },
];

const setup = (
  initialValue: unknown = '',
  config?: RelativeDateTimeEditorConfig,
  operator = '='
) => {
  const defaultQuery = {
    combinator: 'and',
    rules: [{ field: 'f1', operator, value: initialValue }],
  };
  let latest = defaultQuery;
  const { container } = render(
    <RelativeDateTimeConfigContext.Provider value={config ?? {}}>
      <QueryBuilder
        fields={fields}
        defaultQuery={defaultQuery}
        onQueryChange={q => {
          latest = q;
        }}
        controlElements={{ valueEditor: RelativeDateTimeValueEditor }}
      />
    </RelativeDateTimeConfigContext.Provider>
  );
  const editor = () =>
    within(container.querySelector(`.${standardClassnames.valueDateTimeRelative}`) as HTMLElement);
  return { editor, getValue: () => (latest.rules[0] as RuleType).value };
};

it('defaults to absolute mode with a toggle switch', () => {
  const { editor, getValue } = setup('');
  // Mode is a switch (not a combobox); no anchor/offset/unit controls in absolute mode.
  expect(editor().getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  expect(editor().queryAllByRole('combobox')).toHaveLength(0);
  expect(editor().queryByRole('spinbutton')).toBeNull();
  expect(getValue()).toBe('');
});

it('toggles to relative mode and back', async () => {
  const { editor, getValue } = setup('');

  await user.click(editor().getByRole('switch'));
  expect(isRelativeDateTimeValue(getValue())).toBe(true);
  expect(getValue()).toEqual({ mode: 'relative', anchor: 'now', offset: 0, unit: 'day' });
  expect(editor().getByRole('switch')).toHaveAttribute('aria-checked', 'true');

  await user.click(editor().getByRole('switch'));
  expect(getValue()).toBe('');
});

it('hides the unit selector when offset is 0 and shows it otherwise', async () => {
  const { editor, getValue } = setup({ mode: 'relative', anchor: 'now', offset: 0, unit: 'day' });

  // offset 0 -> anchor selector only (no unit)
  expect(editor().getAllByRole('combobox')).toHaveLength(1);

  await user.type(editor().getByRole('spinbutton'), '3');
  expect(getValue()).toMatchObject({ offset: 3 });

  // non-zero offset -> unit selector appears
  expect(editor().getAllByRole('combobox')).toHaveLength(2);
});

it('updates anchor, offset, and unit', async () => {
  const { editor, getValue } = setup({ mode: 'relative', anchor: 'now', offset: 2, unit: 'day' });

  const [anchor, unit] = editor().getAllByRole('combobox');
  await user.selectOptions(anchor, 'startOfMonth');
  expect(getValue()).toMatchObject({ anchor: 'startOfMonth' });

  await user.selectOptions(unit, 'month');
  expect(getValue()).toMatchObject({ unit: 'month' });

  const offset = editor().getByRole('spinbutton');
  await user.clear(offset);
  await user.type(offset, '5');
  expect(getValue()).toMatchObject({ offset: 5 });
});

it('coerces empty/invalid offset to 0', async () => {
  const { editor, getValue } = setup({ mode: 'relative', anchor: 'now', offset: 4, unit: 'day' });
  await user.clear(editor().getByRole('spinbutton'));
  expect(getValue()).toMatchObject({ offset: 0 });
});

it('honors custom anchor and unit options', () => {
  const config: RelativeDateTimeEditorConfig = {
    anchors: [{ name: 'now', value: 'now', label: 'right now' }],
    units: [
      { name: 'day', value: 'day', label: 'sols' },
      { name: 'week', value: 'week', label: 'cycles' },
    ],
  };
  const { editor } = setup({ mode: 'relative', anchor: 'now', offset: 1, unit: 'day' }, config);
  const [anchor, unit] = editor().getAllByRole('combobox');
  expect(within(anchor).getByText('right now')).toBeInTheDocument();
  expect(within(unit).getByText('sols')).toBeInTheDocument();
});

it('honors custom toggle labels', () => {
  const config: RelativeDateTimeEditorConfig = {
    toggleLabels: { label: 'Mode', absoluteTitle: 'pick a date', absoluteContent: 'ABS' },
  };
  const { editor } = setup('', config);
  const toggle = editor().getByRole('switch');
  expect(toggle).toHaveAttribute('aria-label', 'Mode');
  expect(toggle).toHaveAttribute('title', 'pick a date');
  expect(toggle).toHaveTextContent('ABS');
});

it('uses the operator-driven controller (no toggle, mode from operator)', async () => {
  const config: RelativeDateTimeEditorConfig = { modeController: operatorModeController };
  // operator '=' -> absolute (no relative controls)
  const absolute = setup('', config, '=');
  expect(absolute.editor().queryByRole('switch')).toBeNull();
  expect(absolute.editor().queryAllByRole('combobox')).toHaveLength(0);

  // operator 'relative' -> relative controls, still no toggle
  const relative = setup('', config, 'relative');
  expect(relative.editor().queryByRole('switch')).toBeNull();
  expect(relative.editor().getAllByRole('combobox')).toHaveLength(1);

  await user.selectOptions(relative.editor().getByRole('combobox'), 'now');
  expect(isRelativeDateTimeValue(relative.getValue())).toBe(true);
});

it('supports a predicate-based operator controller', () => {
  const config: RelativeDateTimeEditorConfig = {
    modeController: createOperatorModeController(op => op.startsWith('rel')),
  };
  const { editor } = setup('', config, 'relativeFoo');
  expect(editor().getAllByRole('combobox').length).toBeGreaterThan(0);
});

describe('toggleModeController', () => {
  it('derives mode from the value shape', () => {
    expect(
      toggleModeController.isRelative({
        value: { mode: 'relative', anchor: 'now', offset: 0, unit: 'day' },
      } as never)
    ).toBe(true);
    expect(toggleModeController.isRelative({ value: '2020-01-01' } as never)).toBe(false);
  });
});

describe('between / notBetween', () => {
  it('renders two independent editors and stores a two-element array', async () => {
    const { editor, getValue } = setup(['', ''], undefined, 'between');
    expect(editor().getAllByRole('switch')).toHaveLength(2);

    // Toggle the first bound to relative; the second stays absolute.
    await user.click(editor().getAllByRole('switch')[0]);
    const value = getValue() as unknown[];
    expect(Array.isArray(value)).toBe(true);
    expect(isRelativeDateTimeValue(value[0])).toBe(true);
    expect(value[1]).toBe('');
  });

  it('supports mixed absolute/relative bounds', () => {
    const { editor } = setup(
      [{ mode: 'relative', anchor: 'now', offset: 0, unit: 'day' }, ''],
      undefined,
      'between'
    );
    const switches = editor().getAllByRole('switch');
    expect(switches[0]).toHaveAttribute('aria-checked', 'true');
    expect(switches[1]).toHaveAttribute('aria-checked', 'false');
    // Relative first bound (offset 0) shows only its anchor selector.
    expect(editor().getAllByRole('combobox')).toHaveLength(1);
  });

  it('edits the second bound independently', async () => {
    const { editor, getValue } = setup(['', ''], undefined, 'notBetween');
    await user.click(editor().getAllByRole('switch')[1]);
    const value = getValue() as unknown[];
    expect(value[0]).toBe('');
    expect(isRelativeDateTimeValue(value[1])).toBe(true);
  });

  it('renders no toggles with an operator-driven controller', () => {
    const { editor } = setup(['', ''], { modeController: operatorModeController }, 'between');
    expect(editor().queryByRole('switch')).toBeNull();
  });
});

describe('withRelativeOperators', () => {
  it('appends relative operators, defaulting when a field has none', () => {
    const [withOwn, without] = withRelativeOperators(
      [
        { name: 'a', label: 'A', operators: [{ name: '=', value: '=', label: '=' }] },
        { name: 'b', label: 'B' },
      ],
      [relOp]
    );
    expect(withOwn.operators).toContainEqual(relOp);
    expect(withOwn.operators).toHaveLength(2);
    // Field without operators falls back to defaults + relative operators.
    expect(without.operators).toContainEqual(relOp);
    expect(without.operators!.length).toBeGreaterThan(1);
  });

  it('accepts a custom operator set', () => {
    const custom = [{ name: 'x', value: 'x', label: 'X' }];
    const [field] = withRelativeOperators([{ name: 'a', label: 'A', operators: [] }], custom);
    expect(field.operators).toEqual(custom);
  });
});
