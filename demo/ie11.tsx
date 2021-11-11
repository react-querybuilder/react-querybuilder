import 'core-js';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import QueryBuilder, { defaultValidator, Field, RuleGroupType, RuleType } from '../src';
import './styles/ie11.scss';

const validator = (r: RuleType) => !!r.value;

const fields: Field[] = [
  { name: 'firstName', label: 'First Name', placeholder: 'Enter first name', validator },
  {
    name: 'lastName',
    label: 'Last Name',
    placeholder: 'Enter last name',
    defaultOperator: 'beginsWith',
    validator
  },
  { name: 'age', label: 'Age', inputType: 'number', validator },
  {
    name: 'isMusician',
    label: 'Is a musician',
    valueEditorType: 'checkbox',
    operators: [{ name: '=', label: 'is' }],
    defaultValue: false
  },
  {
    name: 'instrument',
    label: 'Instrument',
    valueEditorType: 'select',
    values: [
      { name: 'Guitar', label: 'Guitar' },
      { name: 'Piano', label: 'Piano' },
      { name: 'Vocals', label: 'Vocals' },
      { name: 'Drums', label: 'Drums' }
    ],
    defaultValue: 'Piano',
    operators: [{ name: '=', label: 'is' }]
  },
  {
    name: 'gender',
    label: 'Gender',
    operators: [{ name: '=', label: 'is' }],
    valueEditorType: 'radio',
    values: [
      { name: 'M', label: 'Male' },
      { name: 'F', label: 'Female' },
      { name: 'O', label: 'Other' }
    ]
  },
  { name: 'height', label: 'Height', validator },
  { name: 'job', label: 'Job', validator }
];

const initialQuery: RuleGroupType = {
  rules: [
    {
      field: 'firstName',
      value: 'Stev',
      operator: 'beginsWith'
    },
    {
      field: 'lastName',
      value: 'Vai, Vaughan',
      operator: 'in'
    },
    {
      field: 'age',
      operator: '>',
      value: '28'
    },
    {
      combinator: 'or',
      rules: [
        {
          field: 'isMusician',
          operator: '=',
          value: true
        },
        {
          field: 'instrument',
          operator: '=',
          value: 'Guitar'
        }
      ]
    }
  ],
  combinator: 'and',
  not: false
};

const IE11Test = () => {
  const [query, setQuery] = useState(initialQuery);

  return (
    <QueryBuilder
      fields={fields}
      query={query}
      onQueryChange={(q) => setQuery(q)}
      addRuleToNewGroups
      enableDragAndDrop
      showCloneButtons
      showNotToggle
      validator={defaultValidator}
    />
  );
};

ReactDOM.render(<IE11Test />, document.getElementById('ie11'));
