// @vitest-environment jsdom
import { standardClassnames, TestID } from '@react-querybuilder/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import type { ValueEditorProps } from 'react-querybuilder';
import { getCompatContextProvider, QueryBuilder } from 'react-querybuilder';
import { DateTimeValueEditor, QueryBuilderDateTime } from '../QueryBuilderDateTime';
import { rqbDateTimeLibraryAPI } from '../rqbDateTimeLibraryAPI.dayjs';
import type { RQBDateTimeLibraryAPI } from '../types';

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

// Marker editor used to verify delegation to an inherited (compat) value editor.
const CustomValueEditor = (_props: ValueEditorProps) => (
  <span data-testid="custom-editor">custom</span>
);
const OuterCompatProvider = getCompatContextProvider({
  controlElements: { valueEditor: CustomValueEditor },
});

it('delegates non-date fields to the inherited (compat) value editor', () => {
  render(
    <OuterCompatProvider>
      <QueryBuilderDateTime>
        <QueryBuilder fields={fields} getDefaultField="field2" addRuleToNewGroups />
      </QueryBuilderDateTime>
    </OuterCompatProvider>
  );

  expect(screen.getByTestId('custom-editor')).toBeInTheDocument();
});

it('delegates the absolute date input and relative offset to the inherited editor', async () => {
  render(
    <OuterCompatProvider>
      <QueryBuilderDateTime>
        <QueryBuilder fields={fields} getDefaultField="field1" addRuleToNewGroups />
      </QueryBuilderDateTime>
    </OuterCompatProvider>
  );

  // Absolute mode: the date input itself renders through the inherited editor.
  expect(screen.getByTestId('custom-editor')).toBeInTheDocument();

  // Relative mode: the numeric offset input also renders through the inherited editor.
  await user.click(screen.getByRole('switch'));
  expect(screen.getByTestId('custom-editor')).toBeInTheDocument();
});

it('uses a custom dateTimeAPI prop to parse/format the input value', () => {
  // Custom adapter that always parses to a fixed date, proving the API is pluggable.
  const fixedDate = new Date(2020, 5, 15, 9, 30);
  const customAPI: RQBDateTimeLibraryAPI = {
    ...rqbDateTimeLibraryAPI,
    isValid: () => true,
    toDate: () => fixedDate,
  };

  render(
    <QueryBuilderDateTime dateTimeAPI={customAPI}>
      <QueryBuilder fields={fields} addRuleToNewGroups getDefaultField="field3" />
    </QueryBuilderDateTime>
  );

  // datetime-local formatted from the fixed date (local time), not the field default.
  expect(dateInput()).toHaveValue('2020-06-15T09:30');
});
