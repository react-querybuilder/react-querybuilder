import type { Field, FullField, RuleType } from 'react-querybuilder';
import { defaultOperators, toFullOption } from 'react-querybuilder';
import { musicalInstruments } from './musicalInstruments';

export const validator = (r: RuleType) => !!r.value;

export const fields: FullField[] = (
  [
    {
      name: 'firstName',
      label: 'First Name',
      datatype: 'string',
      placeholder: 'Enter first name',
      validator,
    },
    {
      name: 'lastName',
      label: 'Last Name',
      datatype: 'string',
      placeholder: 'Enter last name',
      defaultOperator: 'beginsWith',
      validator,
    },
    { name: 'age', label: 'Age', inputType: 'number', datatype: 'integer', validator },
    {
      name: 'isMusician',
      label: 'Is a musician',
      datatype: 'boolean',
      valueEditorType: 'checkbox',
      operators: defaultOperators.filter(op => op.name === '='),
      defaultValue: false,
    },
    {
      name: 'instrument',
      label: 'Primary instrument',
      datatype: 'enum',
      valueEditorType: 'select',
      values: musicalInstruments,
      // This must be commented out to properly demonstrate `autoSelectValue={false}`
      // defaultValue: 'Cowbell',
      operators: defaultOperators.filter(op => op.name === '='),
    },
    {
      name: 'alsoPlays',
      label: 'Also plays',
      datatype: 'enum',
      valueEditorType: 'multiselect',
      values: musicalInstruments,
      defaultValue: 'more_cowbell',
      operators: defaultOperators.filter(op => op.name === 'in'),
    },
    {
      name: 'tourStops',
      label: 'Tour stops',
      matchModes: true,
      subproperties: [
        { name: 'city', label: 'City' },
        { name: 'state', label: 'State/Province' },
        { name: 'venue', label: 'Venue' },
        { name: 'date', label: 'Date', inputType: 'date', datatype: 'date' },
        { name: 'country', label: 'Country' },
      ],
    },
    {
      name: 'gender',
      label: 'Gender',
      datatype: 'enum',
      operators: defaultOperators.filter(op => op.name === '='),
      valueEditorType: 'radio',
      values: [
        { name: 'M', label: 'Male' },
        { name: 'F', label: 'Female' },
        { name: 'O', label: 'Other' },
      ],
    },
    { name: 'height', label: 'Height', datatype: 'decimal(5,2)', validator },
    { name: 'job', label: 'Job', datatype: 'varchar(100)', validator },
    { name: 'description', label: 'Description', datatype: 'text', valueEditorType: 'textarea' },
    { name: 'birthdate', label: 'Birth Date', inputType: 'date', datatype: 'date' },
    {
      name: 'datetime',
      label: 'Show Time',
      inputType: 'datetime-local',
      datatype: 'timestamp with time zone',
    },
    { name: 'alarm', label: 'Daily Alarm', inputType: 'time', datatype: 'time' },
    { name: 'bign', label: 'Big Int', inputType: 'bigint', datatype: 'bigint' },
    {
      name: 'groupedField1',
      label: 'Grouped Field 1',
      comparator: 'groupNumber',
      groupNumber: 'group1',
      valueSources: ['field', 'value'],
    },
    {
      name: 'groupedField2',
      label: 'Grouped Field 2',
      comparator: 'groupNumber',
      groupNumber: 'group1',
      valueSources: ['field', 'value'],
    },
    {
      name: 'groupedField3',
      label: 'Grouped Field 3',
      comparator: 'groupNumber',
      groupNumber: 'group1',
      valueSources: ['field', 'value'],
    },
    {
      name: 'groupedField4',
      label: 'Grouped Field 4',
      comparator: 'groupNumber',
      groupNumber: 'group1',
      valueSources: ['field', 'value'],
    },
  ] satisfies Field[]
).map(o => toFullOption(o));
