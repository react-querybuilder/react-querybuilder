import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { QueryBuilder, TestID } from 'react-querybuilder';
import { QueryBuilderDateTime } from './QueryBuilderDateTime';

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

it('handles valid and invalid date input', async () => {
  render(
    <QueryBuilderDateTime>
      <QueryBuilder fields={fields} addRuleToNewGroups resetOnFieldChange={false} />
    </QueryBuilderDateTime>
  );

  expect(screen.getByTestId(TestID.valueEditor)).toHaveValue('2002-12-14');

  await user.selectOptions(screen.getByTestId(TestID.fields), 'field2');
  await user.clear(screen.getByTestId(TestID.valueEditor));
  expect(screen.getByTestId(TestID.valueEditor)).toHaveValue('');

  await user.selectOptions(screen.getByTestId(TestID.fields), 'field1');
  expect(screen.getByTestId(TestID.valueEditor)).toHaveValue('');
});

it('handles valid datetime-local input', async () => {
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

  expect(screen.getByTestId(TestID.valueEditor)).toHaveValue('2002-01-01T00:00');
});
