import packageJSON_rqb_antd from '@react-querybuilder/antd/package.json';
import packageJSON_rqb_bootstrap from '@react-querybuilder/bootstrap/package.json';
import packageJSON_rqb_bulma from '@react-querybuilder/bulma/package.json';
import packageJSON_rqb_chakra from '@react-querybuilder/chakra/package.json';
import packageJSON_rqb_dnd from '@react-querybuilder/dnd/package.json';
import packageJSON_rqb_mantine from '@react-querybuilder/mantine/package.json';
import packageJSON_rqb_material from '@react-querybuilder/material/package.json';
import type { ExportFormat, RuleGroupType } from 'react-querybuilder';
import { convertToIC, generateID, objectKeys } from 'react-querybuilder';
import type { DemoOption, DemoOptions, HttpsURL, StyleName } from './types';

export const defaultOptions: DemoOptions = {
  showCombinatorsBetweenRules: false,
  showNotToggle: false,
  showCloneButtons: false,
  showLockButtons: false,
  resetOnFieldChange: true,
  resetOnOperatorChange: false,
  autoSelectField: true,
  autoSelectOperator: true,
  addRuleToNewGroups: false,
  validateQuery: false,
  independentCombinators: false,
  listsAsArrays: false,
  enableDragAndDrop: false,
  disabled: false,
  debugMode: false,
  parseNumbers: false,
  justifiedLayout: false,
  showBranches: false,
};

export const optionOrder: DemoOption[] = [
  'showCombinatorsBetweenRules',
  'showNotToggle',
  'showCloneButtons',
  'showLockButtons',
  'resetOnFieldChange',
  'resetOnOperatorChange',
  'autoSelectField',
  'autoSelectOperator',
  'addRuleToNewGroups',
  'validateQuery',
  'independentCombinators',
  'listsAsArrays',
  'enableDragAndDrop',
  'disabled',
  'debugMode',
  'parseNumbers',
  'justifiedLayout',
  'showBranches',
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
    link: '/docs/api/querybuilder#showcombinatorsbetweenrules',
    label: 'Combinators between rules',
    title: 'Display combinator (and/or) selectors between rules instead of in the group header',
  },
  showNotToggle: {
    link: '/docs/api/querybuilder#shownottoggle',
    label: 'Show "not" toggle',
    title: `Display a checkbox to invert a group's rules (labelled "Not" by default)`,
  },
  showCloneButtons: {
    link: '/docs/api/querybuilder#showclonebuttons',
    label: 'Show clone buttons',
    title: 'Display buttons to clone rules and groups',
  },
  resetOnFieldChange: {
    link: '/docs/api/querybuilder#resetonfieldchange',
    label: 'Reset on field change',
    title: `Operator and value will be reset when a rule's field selection changes`,
  },
  resetOnOperatorChange: {
    link: '/docs/api/querybuilder#resetonoperatorchange',
    label: 'Reset on operator change',
    title: 'The value will reset when the operator changes',
  },
  autoSelectField: {
    link: '/docs/api/querybuilder#autoselectfield',
    label: 'Auto-select field',
    title: 'The default field will be automatically selected for new rules',
  },
  autoSelectOperator: {
    link: '/docs/api/querybuilder#autoselectoperator',
    label: 'Auto-select operator',
    title: 'The default operator will be automatically selected for new rules',
  },
  addRuleToNewGroups: {
    link: '/docs/api/querybuilder#addruletonewgroups',
    label: 'Add rule to new groups',
    title: 'A rule will be automatically added to new groups',
  },
  validateQuery: {
    link: '/docs/api/validation',
    label: 'Use validation',
    title:
      'The validator function(s) will be used to bold the "+Rule" button for empty groups and put a purple background on empty text fields and emtpy groups',
  },
  independentCombinators: {
    link: '/docs/api/querybuilder#independentcombinators',
    label: 'Independent combinators',
    title: 'Combinators between rules can be independently updated',
  },
  listsAsArrays: {
    link: '/docs/api/querybuilder#listsasarrays',
    label: 'Lists as arrays',
    title: 'Lists will be stored as arrays instead of comma-separated strings',
  },
  enableDragAndDrop: {
    link: '/docs/api/querybuilder#enabledraganddrop',
    label: 'Drag-and-drop enabled',
    title: 'Rules and groups can be reordered and dragged to different groups',
  },
  disabled: {
    link: '/docs/api/querybuilder#disabled',
    label: 'Disabled',
    title: 'Disable all components within the query builder',
  },
  showLockButtons: {
    link: '/docs/api/querybuilder#showlockbuttons',
    label: 'Show lock buttons',
    title: 'Display buttons to lock/disable rules and groups',
  },
  debugMode: {
    link: '/docs/api/querybuilder#debugmode',
    label: 'Debug mode',
    title: 'Enable debug logging for QueryBuilder and React DnD (see console)',
  },
  parseNumbers: {
    link: '/docs/api/export#parse-numbers',
    label: 'Parse numbers',
    title: 'Parse real numbers from strings in rule values',
  },
  justifiedLayout: {
    link: '',
    label: 'Justified layout',
    title: 'Add custom CSS to push the "clone", "lock", and "remove" buttons to the right edge',
  },
  showBranches: {
    link: '/docs/tips/styling#branch-lines',
    label: 'Show branches',
    title: 'Add the `.queryBuilder-branches` class to display "tree view" branches',
  },
};

export const optionOrderByLabel = optionOrder.sort((a, b) =>
  optionsMetadata[a].label.localeCompare(optionsMetadata[b].label)
);

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
export const formatMap: [ExportFormat, string, HttpsURL, string][] = [
  ['sql', 'SQL', 'https://en.wikipedia.org/wiki/SQL', 'sql'],
  ['parameterized', 'SQL (parameterized)', 'https://en.wikipedia.org/wiki/SQL', 'parameterized-sql'],
  ['parameterized_named', 'SQL (named parameters)', 'https://en.wikipedia.org/wiki/SQL', 'named-parameters'],
  ['json_without_ids', 'JSON (no identifiers)', 'https://en.wikipedia.org/wiki/JSON', 'json-without-identifiers'],
  ['json', 'JSON', 'https://en.wikipedia.org/wiki/JSON', 'json'],
  ['mongodb', 'MongoDB', 'https://www.mongodb.com/', 'mongodb'],
  ['cel', 'CEL', 'https://github.com/google/cel-spec', 'common-expression-language'],
  ['spel', 'SpEL', 'https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#expressions-language-ref', 'spring-expression-language'],
  ['jsonlogic', 'JsonLogic', 'https://jsonlogic.com/', 'jsonlogic'],
];

export const styleNameMap: Record<StyleName, string> = {
  default: 'Default',
  bootstrap: 'Bootstrap',
  material: 'MUI/Material',
  mantine: 'Mantine',
  antd: 'Ant Design',
  chakra: 'Chakra UI',
  bulma: 'Bulma',
};

const { default: _d, ...compatStyles } = styleNameMap;

export const styleNameArray: StyleName[] = ['default', ...objectKeys(compatStyles).sort()];

export const peerDependencies: Record<StyleName | 'dnd', Record<string, string>> = {
  default: {},
  dnd: packageJSON_rqb_dnd.peerDependencies,
  antd: packageJSON_rqb_antd.peerDependencies,
  bootstrap: packageJSON_rqb_bootstrap.peerDependencies,
  bulma: packageJSON_rqb_bulma.peerDependencies,
  chakra: packageJSON_rqb_chakra.peerDependencies,
  mantine: packageJSON_rqb_mantine.peerDependencies,
  material: packageJSON_rqb_material.peerDependencies,
};
