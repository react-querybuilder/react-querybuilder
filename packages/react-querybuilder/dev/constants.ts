import type { ExportFormat, Field, RuleGroupType, RuleType } from '../src';
import { convertToIC, defaultOperators, generateID } from '../src';
import { musicalInstruments } from './musicalInstruments';
import type { DemoOption, DemoOptions, HttpsURL } from './types';

export const validator = (r: RuleType) => !!r.value;

export const defaultOptions: DemoOptions = {
  addRuleToNewGroups: false,
  autoSelectField: true,
  autoSelectOperator: true,
  debugMode: false,
  disabled: false,
  enableDragAndDrop: false,
  independentCombinators: false,
  listsAsArrays: false,
  parseNumbers: false,
  resetOnFieldChange: true,
  resetOnOperatorChange: false,
  showCloneButtons: false,
  showCombinatorsBetweenRules: false,
  showLockButtons: false,
  showNotToggle: false,
  validateQuery: false,
  showBranches: false,
  showShiftActions: false,
};

export const optionOrder: DemoOption[] = [
  'addRuleToNewGroups',
  'autoSelectField',
  'autoSelectOperator',
  'debugMode',
  'disabled',
  'enableDragAndDrop',
  'independentCombinators',
  'listsAsArrays',
  'parseNumbers',
  'resetOnFieldChange',
  'resetOnOperatorChange',
  'showShiftActions',
  'showCloneButtons',
  'showCombinatorsBetweenRules',
  'showLockButtons',
  'showNotToggle',
  'showBranches',
  'validateQuery',
];

export const optionsMetadata: Record<
  DemoOption,
  {
    link: string;
    label: string;
    title: string;
  }
> = {
  showCombinatorsBetweenRules: {
    link: '/docs/components/querybuilder#showcombinatorsbetweenrules',
    label: 'Combinators between rules',
    title: 'Display combinator (and/or) selectors between rules instead of in the group header',
  },
  showNotToggle: {
    link: '/docs/components/querybuilder#shownottoggle',
    label: 'Show "not" toggle',
    title: `Display a checkbox to invert a group's rules (labelled "Not" by default)`,
  },
  showShiftActions: {
    link: '/docs/components/querybuilder#showshiftactions',
    label: 'Show shift up/down actions',
    title: 'Display links to shift rules and groups up or down in the query hierarchy',
  },
  showCloneButtons: {
    link: '/docs/components/querybuilder#showclonebuttons',
    label: 'Show clone buttons',
    title: 'Display buttons to clone rules and groups',
  },
  resetOnFieldChange: {
    link: '/docs/components/querybuilder#resetonfieldchange',
    label: 'Reset on field change',
    title: `Operator and value will be reset when a rule's field selection changes`,
  },
  resetOnOperatorChange: {
    link: '/docs/components/querybuilder#resetonoperatorchange',
    label: 'Reset on operator change',
    title: 'The value will reset when the operator changes',
  },
  autoSelectField: {
    link: '/docs/components/querybuilder#autoselectfield',
    label: 'Auto-select field',
    title: 'The default field will be automatically selected for new rules',
  },
  autoSelectOperator: {
    link: '/docs/components/querybuilder#autoselectoperator',
    label: 'Auto-select operator',
    title: 'The default operator will be automatically selected for new rules',
  },
  addRuleToNewGroups: {
    link: '/docs/components/querybuilder#addruletonewgroups',
    label: 'Add rule to new groups',
    title: 'A rule will be automatically added to new groups',
  },
  validateQuery: {
    link: '/docs/utils/validation',
    label: 'Use validation',
    title:
      'The validator function(s) will be used to put a purple outline around empty text fields and bold the "+Rule" button for empty groups',
  },
  independentCombinators: {
    link: '/docs/components/querybuilder#independentcombinators',
    label: 'Independent combinators',
    title: 'Combinators between rules can be independently updated',
  },
  listsAsArrays: {
    link: '/docs/components/querybuilder#listsasarrays',
    label: 'Lists as arrays',
    title: 'Lists will be stored as arrays instead of comma-separated strings',
  },
  enableDragAndDrop: {
    link: '/docs/components/querybuilder#enabledraganddrop',
    label: 'Enable drag-and-drop',
    title: 'Rules and groups can be reordered and dragged to different groups',
  },
  disabled: {
    link: '/docs/components/querybuilder#disabled',
    label: 'Disabled',
    title: 'Disable all components within the query builder',
  },
  showLockButtons: {
    link: '/docs/components/querybuilder#showlockbuttons',
    label: 'Show lock buttons',
    title: 'Display buttons to lock/disable rules and groups',
  },
  debugMode: {
    link: '/docs/components/querybuilder#debugmode',
    label: 'Debug mode',
    title: 'Enable debug logging for QueryBuilder and React DnD (see console)',
  },
  parseNumbers: {
    link: '/docs/utils/export#parse-numbers',
    label: 'Parse numbers',
    title: 'Parse real numbers from strings in rule values',
  },
  showBranches: {
    link: '/docs/styling/overview#branch-lines',
    label: 'Show branches',
    title: 'Add the `.queryBuilder-branches` class to display "tree view" branches',
  },
};

export const fields: Field[] = [
  {
    name: 'firstName',
    label: 'First Name',
    placeholder: 'Enter first name',
    validator,
  },
  {
    name: 'lastName',
    label: 'Last Name',
    placeholder: 'Enter last name',
    defaultOperator: 'beginsWith',
    validator,
  },
  { name: 'age', label: 'Age', inputType: 'number', validator },
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
    defaultValue: 'Cowbell',
    operators: defaultOperators.filter(op => op.name === '=' || op.name === 'in'),
  },
  {
    name: 'alsoPlays',
    label: 'Also plays',
    valueEditorType: 'multiselect',
    values: musicalInstruments,
    defaultValue: 'More cowbell',
    operators: defaultOperators.filter(op => op.name === 'in'),
  },
  {
    name: 'gender',
    label: 'Gender',
    operators: defaultOperators.filter(op => op.name === '='),
    valueEditorType: 'radio',
    values: [
      { name: 'M', label: 'Male' },
      { name: 'F', label: 'Female' },
      { name: 'O', label: 'Other' },
    ],
  },
  { name: 'height', label: 'Height', validator },
  { name: 'job', label: 'Job', validator },
  { name: 'description', label: 'Description', valueEditorType: 'textarea' },
  { name: 'birthdate', label: 'Birth Date', inputType: 'date' },
  { name: 'datetime', label: 'Show Time', inputType: 'datetime-local' },
  { name: 'alarm', label: 'Daily Alarm', inputType: 'time' },
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
];

export const emptyQuery: RuleGroupType = { combinator: 'and', rules: [] };
export const emptyQueryIC = convertToIC(emptyQuery);

export const initialQuery: RuleGroupType = {
  id: generateID(),
  combinator: 'and',
  not: false,
  rules: [
    {
      id: generateID(),
      field: 'firstName',
      value: 'Stev',
      operator: 'beginsWith',
    },
    {
      id: generateID(),
      field: 'lastName',
      value: 'Vai, Vaughan',
      operator: 'in',
    },
    {
      id: generateID(),
      field: 'age',
      operator: '>',
      value: '28',
    },
    {
      id: generateID(),
      combinator: 'or',
      rules: [
        {
          id: generateID(),
          field: 'isMusician',
          operator: '=',
          value: true,
        },
        {
          id: generateID(),
          field: 'instrument',
          operator: '=',
          value: 'Guitar',
        },
      ],
    },
    {
      id: generateID(),
      field: 'groupedField1',
      operator: '=',
      value: 'groupedField4',
      valueSource: 'field',
    },
    {
      id: generateID(),
      field: 'birthdate',
      operator: 'between',
      value: '1954-10-03,1960-06-06',
    },
  ],
};

export const initialQueryIC = convertToIC(initialQuery);

// prettier-ignore
export const formatMap: [ExportFormat, string, HttpsURL][] = [
  ['sql', 'SQL', 'https://en.wikipedia.org/wiki/SQL'],
  ['parameterized', 'SQL (parameterized)', 'https://en.wikipedia.org/wiki/SQL'],
  ['parameterized_named', 'SQL (named parameters)', 'https://en.wikipedia.org/wiki/SQL'],
  ['json_without_ids', 'JSON (no identifiers)', 'https://en.wikipedia.org/wiki/JSON'],
  ['json', 'JSON', 'https://en.wikipedia.org/wiki/JSON'],
  ['mongodb', 'MongoDB', 'https://www.mongodb.com/'],
  ['cel', 'CEL', 'https://github.com/google/cel-spec'],
  ['spel', 'SpEL', 'https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#expressions-language-ref'],
  ['jsonlogic', 'JsonLogic', 'https://jsonlogic.com/'],
];
