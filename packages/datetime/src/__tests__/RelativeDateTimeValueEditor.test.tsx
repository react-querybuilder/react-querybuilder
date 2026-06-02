// @vitest-environment jsdom
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import type { RuleType } from 'react-querybuilder';
import { QueryBuilder, standardClassnames } from 'react-querybuilder';
import { RelativeDateTimeValueEditor } from '../RelativeDateTimeValueEditor';
import { isRelativeDateTimeValue } from '../utils';

const user = userEvent.setup();

const fields = [
  { name: 'f1', label: 'Field 1', inputType: 'datetime-local', datatype: 'datetime' },
];

const setup = (initialValue: unknown = '') => {
  const defaultQuery = {
    combinator: 'and',
    rules: [{ field: 'f1', operator: '=', value: initialValue }],
  };
  let latest = defaultQuery;
  const { container } = render(
    <QueryBuilder
      fields={fields}
      defaultQuery={defaultQuery}
      onQueryChange={q => {
        latest = q;
      }}
      controlElements={{ valueEditor: RelativeDateTimeValueEditor }}
    />
  );
  const editor = () =>
    within(container.querySelector(`.${standardClassnames.valueDateTimeRelative}`) as HTMLElement);
  return { editor, getValue: () => (latest.rules[0] as RuleType).value };
};

it('defaults to absolute mode', () => {
  const { editor, getValue } = setup('');
  // Only the mode selector is a combobox; no anchor/offset/unit controls
  expect(editor().getAllByRole('combobox')).toHaveLength(1);
  expect(editor().queryByRole('spinbutton')).toBeNull();
  expect(getValue()).toBe('');
});

it('switches to relative mode and back', async () => {
  const { editor, getValue } = setup('');

  await user.selectOptions(editor().getAllByRole('combobox')[0], 'relative');
  expect(isRelativeDateTimeValue(getValue())).toBe(true);
  expect(getValue()).toEqual({ mode: 'relative', anchor: 'now', offset: 0, unit: 'day' });

  await user.selectOptions(editor().getAllByRole('combobox')[0], 'absolute');
  expect(getValue()).toBe('');
});

it('hides the unit selector when offset is 0 and shows it otherwise', async () => {
  const { editor, getValue } = setup({ mode: 'relative', anchor: 'now', offset: 0, unit: 'day' });

  // offset 0 -> mode + anchor selectors only (no unit)
  expect(editor().getAllByRole('combobox')).toHaveLength(2);

  await user.type(editor().getByRole('spinbutton'), '3');
  expect(getValue()).toMatchObject({ offset: 3 });

  // non-zero offset -> unit selector appears
  expect(editor().getAllByRole('combobox')).toHaveLength(3);
});

it('updates anchor, offset, and unit', async () => {
  const { editor, getValue } = setup({ mode: 'relative', anchor: 'now', offset: 2, unit: 'day' });

  await user.selectOptions(editor().getAllByRole('combobox')[1], 'startOfMonth');
  expect(getValue()).toMatchObject({ anchor: 'startOfMonth' });

  await user.selectOptions(editor().getAllByRole('combobox')[2], 'month');
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
