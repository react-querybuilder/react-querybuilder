import {
  ExportFormat,
  Field,
  QueryBuilderProps,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType
} from '../src';
import {
  AntDActionElement,
  AntDNotToggle,
  AntDValueEditor,
  AntDValueSelector,
  BootstrapNotToggle,
  BootstrapValueEditor,
  ChakraActionElement,
  ChakraNotToggle,
  ChakraValueEditor,
  ChakraValueSelector,
  MaterialActionElement,
  MaterialNotToggle,
  MaterialValueEditor,
  MaterialValueSelector
} from './components';

export type StyleName = 'default' | 'bootstrap' | 'antd' | 'material' | 'chakra';

export const repoLink = 'https://github.com/react-querybuilder/react-querybuilder';
export const npmLink = 'https://www.npmjs.com/package/react-querybuilder';

export const validator = (r: RuleType) => !!r.value;

export const styleOptions: { [s in StyleName]: Partial<QueryBuilderProps> } = {
  default: {},
  bootstrap: {
    controlClassnames: {
      addGroup: 'btn btn-secondary btn-sm',
      addRule: 'btn btn-primary btn-sm',
      cloneGroup: 'btn btn-secondary btn-sm',
      cloneRule: 'btn btn-secondary btn-sm',
      removeGroup: 'btn btn-danger btn-sm',
      removeRule: 'btn btn-danger btn-sm',
      combinators: 'form-select form-select-sm',
      fields: 'form-select form-select-sm',
      operators: 'form-select form-select-sm',
      value: 'form-control form-control-sm'
    },
    controlElements: {
      notToggle: BootstrapNotToggle,
      valueEditor: BootstrapValueEditor
    }
  },
  antd: {
    controlElements: {
      addGroupAction: AntDActionElement,
      addRuleAction: AntDActionElement,
      cloneGroupAction: AntDActionElement,
      cloneRuleAction: AntDActionElement,
      combinatorSelector: AntDValueSelector,
      fieldSelector: AntDValueSelector,
      notToggle: AntDNotToggle,
      operatorSelector: AntDValueSelector,
      removeGroupAction: AntDActionElement,
      removeRuleAction: AntDActionElement,
      valueEditor: AntDValueEditor
    }
  },
  material: {
    controlElements: {
      addGroupAction: MaterialActionElement,
      addRuleAction: MaterialActionElement,
      cloneGroupAction: MaterialActionElement,
      cloneRuleAction: MaterialActionElement,
      combinatorSelector: MaterialValueSelector,
      fieldSelector: MaterialValueSelector,
      notToggle: MaterialNotToggle,
      operatorSelector: MaterialValueSelector,
      removeGroupAction: MaterialActionElement,
      removeRuleAction: MaterialActionElement,
      valueEditor: MaterialValueEditor
    }
  },
  chakra: {
    controlElements: {
      addGroupAction: ChakraActionElement,
      addRuleAction: ChakraActionElement,
      cloneGroupAction: ChakraActionElement,
      cloneRuleAction: ChakraActionElement,
      combinatorSelector: ChakraValueSelector,
      fieldSelector: ChakraValueSelector,
      notToggle: ChakraNotToggle,
      operatorSelector: ChakraValueSelector,
      removeGroupAction: ChakraActionElement,
      removeRuleAction: ChakraActionElement,
      valueEditor: ChakraValueEditor
    }
  }
};

export const fields: Field[] = [
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

export const initialQuery: RuleGroupType = {
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

export const initialQueryIC: RuleGroupTypeIC = {
  rules: [
    {
      field: 'firstName',
      value: 'Stev',
      operator: 'beginsWith'
    },
    'and',
    {
      field: 'lastName',
      value: 'Vai, Vaughan',
      operator: 'in'
    },
    'and',
    {
      field: 'age',
      operator: '>',
      value: '28'
    },
    'and',
    {
      rules: [
        {
          field: 'isMusician',
          operator: '=',
          value: true
        },
        'or',
        {
          field: 'instrument',
          operator: '=',
          value: 'Guitar'
        }
      ]
    }
  ],
  not: false
};

export const formatMap: { fmt: ExportFormat; lbl: string }[] = [
  { fmt: 'json_without_ids', lbl: 'JSON without identifiers' },
  { fmt: 'json', lbl: 'JSON' },
  { fmt: 'sql', lbl: 'SQL' },
  { fmt: 'parameterized', lbl: 'Parameterized SQL' },
  { fmt: 'parameterized_named', lbl: 'Parameterized (named) SQL' },
  { fmt: 'mongodb', lbl: 'MongoDB' }
];
