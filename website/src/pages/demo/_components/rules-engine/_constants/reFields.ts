import type { Field, FullField } from 'react-querybuilder';
import { defaultOperators, toFullOption } from 'react-querybuilder';
import { musicalInstruments } from '../../../_constants/musicalInstruments';

// Fields double as json-rules-engine "facts". Operators limited to ones that map
// cleanly to json-rules-engine (=, !=, <, <=, >, >=, in).
export const reFields: FullField[] = (
  [
    { name: 'firstName', label: 'First Name' },
    { name: 'middleName', label: 'Middle Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'age', label: 'Age', inputType: 'number' },
    {
      name: 'isMusician',
      label: 'Is a musician',
      valueEditorType: 'checkbox',
      operators: defaultOperators.filter(op => op.name === '='),
      defaultValue: false,
    },
    {
      name: 'instrument',
      label: 'Primary instrument',
      valueEditorType: 'select',
      values: musicalInstruments,
      operators: defaultOperators.filter(op => op.name === '='),
    },
    {
      name: 'alsoPlays',
      label: 'Also plays',
      valueEditorType: 'multiselect',
      values: musicalInstruments,
      operators: defaultOperators.filter(op => op.name === 'in'),
    },
    { name: 'monthlyListeners', label: 'Monthly listeners', inputType: 'number' },
    { name: 'genre', label: 'Genre' },
    {
      name: 'rating',
      label: 'Rating (1-5)',
      inputType: 'number',
      operators: defaultOperators.filter(op => ['=', '!=', '<', '<=', '>', '>='].includes(op.name)),
    },
  ] satisfies Field[]
).map(o => toFullOption(o));
