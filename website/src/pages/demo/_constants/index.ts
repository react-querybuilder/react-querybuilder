import packageJSON_rqb_antd from '@react-querybuilder/antd/package.json';
import packageJSON_rqb_bootstrap from '@react-querybuilder/bootstrap/package.json';
import packageJSON_rqb_bulma from '@react-querybuilder/bulma/package.json';
import packageJSON_rqb_chakra from '@react-querybuilder/chakra/package.json';
import packageJSON_rqb_dnd from '@react-querybuilder/dnd/package.json';
import packageJSON_rqb_fluent from '@react-querybuilder/fluent/package.json';
import packageJSON_rqb_mantine from '@react-querybuilder/mantine/package.json';
import packageJSON_rqb_material from '@react-querybuilder/material/package.json';
import packageJSON_rqb_tremor from '@react-querybuilder/tremor/package.json';
import type { ExportFormat, RuleGroupType, RuleGroupTypeIC } from 'react-querybuilder/debug';
import { convertToIC, generateID, objectKeys } from 'react-querybuilder/debug';
import type { DemoOption, DemoOptions, HttpsURL, StyleName } from './types';

export const defaultOptions = {
  showCombinatorsBetweenRules: false,
  showNotToggle: false,
  showCloneButtons: false,
  showLockButtons: false,
  resetOnFieldChange: true,
  resetOnOperatorChange: false,
  autoSelectField: true,
  autoSelectOperator: true,
  autoSelectValue: true,
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
  showShiftActions: false,
  suppressStandardClassnames: false,
  useDateTimePackage: false,
} satisfies DemoOptions;

export const optionOrder: DemoOption[] = [
  'showCombinatorsBetweenRules',
  'showNotToggle',
  'showCloneButtons',
  'showLockButtons',
  'showShiftActions',
  'resetOnFieldChange',
  'resetOnOperatorChange',
  'autoSelectField',
  'autoSelectOperator',
  'autoSelectValue',
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
  'suppressStandardClassnames',
  'useDateTimePackage',
];

export const optionsMetadata = {
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
    label: 'Show shift actions',
    title: 'Display buttons to shift rules and groups up or down',
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
  autoSelectValue: {
    link: '/docs/components/querybuilder#autoselectvalue',
    label: 'Auto-select value',
    title:
      'The default value will be automatically selected for rules where the value editor is a select list',
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
      'The validator function(s) will be used to bold the "+ Rule" button for empty groups and put a purple background on empty text fields and emtpy groups',
  },
  independentCombinators: {
    link: '/docs/components/querybuilder#independent-combinators',
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
    label: 'Drag-and-drop enabled',
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
    link: '/docs/components/querybuilder#parsenumbers',
    label: 'Parse numbers',
    title: 'Parse real numbers from strings in rule values (uses "strict-limited" option)',
  },
  suppressStandardClassnames: {
    link: '/docs/components/querybuilder#suppressstandardclassnames',
    label: 'Suppress standard classes',
    title:
      'Disable application of any standard classes, including validation- and event-based classes',
  },
  justifiedLayout: {
    link: '/docs/styling/overview#justified-layout',
    label: 'Justified layout',
    title:
      'Add `.queryBuilder-justified` class to push the "+ Rule", "+ Group", "clone", "lock", and "remove" buttons to the right edge',
  },
  showBranches: {
    link: '/docs/styling/overview#branch-lines',
    label: 'Show branches',
    title: 'Add the `.queryBuilder-branches` class to display "tree view" branches',
  },
  useDateTimePackage: {
    link: '/docs/compat#datetime',
    label: 'Use date/time package',
    title: 'Use the Date/Time package',
  },
} satisfies Record<DemoOption, { link: string; label: string; title: string }>;

export const optionOrderByLabel = optionOrder.sort((a, b) =>
  optionsMetadata[a].label.localeCompare(optionsMetadata[b].label)
);

export const emptyQuery = { combinator: 'and', rules: [] } satisfies RuleGroupType;
export const emptyQueryIC = { rules: [] } satisfies RuleGroupTypeIC;

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
  ['jsonata', 'JSONata', 'https://jsonata.org/', 'jsonata'],
  ['ldap', 'LDAP', 'https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol', 'ldap'],
  ['prisma', 'Prisma ORM', 'https://www.prisma.io/', 'prisma-orm'],
  ['elasticsearch', 'ElasticSearch', 'https://www.elastic.co/', 'elasticsearch'],
  ['natural_language', 'Natural language', 'https://en.wikipedia.org/wiki/English_language', 'natural-language'],
];

export const styleNameMap: Record<StyleName, string> = {
  antd: 'Ant Design',
  bootstrap: 'Bootstrap',
  bulma: 'Bulma',
  chakra: 'Chakra UI',
  default: 'Default',
  fluent: 'Fluent UI',
  mantine: 'Mantine',
  material: 'MUI/Material',
  tremor: 'Tremor',
};

const { default: _d, ...compatStyles } = styleNameMap;

export const styleNameArray: StyleName[] = ['default', ...objectKeys(compatStyles).sort()];

const noReactOrRQB = (pd: string, _i: number, _a: Array<unknown>) =>
  pd !== 'react' && pd !== 'react-querybuilder';

export const peerDependencies: Record<StyleName | 'dnd', string[]> = {
  default: [],
  dnd: objectKeys(packageJSON_rqb_dnd.peerDependencies).filter(noReactOrRQB),
  antd: objectKeys(packageJSON_rqb_antd.peerDependencies).filter(noReactOrRQB),
  bootstrap: objectKeys(packageJSON_rqb_bootstrap.peerDependencies).filter(noReactOrRQB),
  bulma: objectKeys(packageJSON_rqb_bulma.peerDependencies).filter(noReactOrRQB),
  chakra: objectKeys(packageJSON_rqb_chakra.peerDependencies).filter(noReactOrRQB),
  fluent: objectKeys(packageJSON_rqb_fluent.peerDependencies).filter(noReactOrRQB),
  mantine: objectKeys(packageJSON_rqb_mantine.peerDependencies).filter(noReactOrRQB),
  material: objectKeys(packageJSON_rqb_material.peerDependencies).filter(noReactOrRQB),
  tremor: objectKeys(packageJSON_rqb_tremor.peerDependencies).filter(noReactOrRQB),
};
