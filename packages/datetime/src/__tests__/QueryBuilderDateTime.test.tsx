// @vitest-environment jsdom
import { standardClassnames, TestID } from '@react-querybuilder/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { QueryBuilder } from 'react-querybuilder';
import { DateTimeValueEditor, QueryBuilderDateTime } from '../QueryBuilderDateTime';

const user = userEvent.setup();

const fields = [
  {
    name: 'field1',
    label: 'Field 1',
    inputType: 'date',
    datatype: 'date',
    defaultValue: '2002-12-14',
  },
  { name: 'field2', label: 'Field 2' },
  {
    name: 'field3',
    label: 'Field 3',
    inputType: 'datetime-local',
    datatype: 'datetime',
    defaultValue: '2002-01-01 00:00:00', // No "T", no time zone
  },
];

// For date/time fields the value editor is the relative-capable editor; the absolute
// date input lives inside its container alongside the (absolute/relative) mode selector.
const dateInput = () =>
  document.querySelector(`.${standardClassnames.valueDateTimeRelative} input`) as HTMLInputElement;

it('handles valid and invalid date input', async () => {
  render(
    <QueryBuilderDateTime>
      <QueryBuilder fields={fields} addRuleToNewGroups resetOnFieldChange={false} />
    </QueryBuilderDateTime>
  );

  expect(dateInput()).toHaveValue('2002-12-14');

  // Non-date field falls back to the standard editor (single value-editor element).
  await user.selectOptions(screen.getByTestId(TestID.fields), 'field2');
  await user.clear(screen.getByTestId(TestID.valueEditor));
  expect(screen.getByTestId(TestID.valueEditor)).toHaveValue('');

  await user.selectOptions(screen.getByTestId(TestID.fields), 'field1');
  expect(dateInput()).toHaveValue('');
});

it('handles valid datetime-local input', () => {
  render(
    <QueryBuilderDateTime>
      <QueryBuilder
        fields={fields}
        addRuleToNewGroups
        resetOnFieldChange={false}
        getDefaultField="field3"
      />
    </QueryBuilderDateTime>
  );

  expect(dateInput()).toHaveValue('2002-01-01T00:00');
});

it('DateTimeValueEditor falls back to the standard editor for non-date fields', async () => {
  render(
    <QueryBuilder
      fields={fields}
      getDefaultField="field2"
      addRuleToNewGroups
      controlElements={{ valueEditor: DateTimeValueEditor }}
    />
  );

  const editor = screen.getByTestId(TestID.valueEditor);
  await user.type(editor, 'abc');
  expect(editor).toHaveValue('abc');
});

it('passes relative editor config props through to the editor', async () => {
  render(
    <QueryBuilderDateTime toggleLabels={{ label: 'Switch mode' }}>
      <QueryBuilder fields={fields} addRuleToNewGroups getDefaultField="field1" />
    </QueryBuilderDateTime>
  );

  // The configured toggle label reaches the relative editor's switch.
  expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Switch mode');

  // Switching to relative mode renders the relative sub-controls.
  await user.click(screen.getByRole('switch'));
  expect(screen.getAllByRole('combobox').length).toBeGreaterThan(1);
});
