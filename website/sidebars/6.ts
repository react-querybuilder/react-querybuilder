import type { Sidebar } from '@rspress/core';

export default [
  {
    text: 'Getting started',
    link: '/docs/6/intro',
  },
  {
    text: 'Components',
    link: '/docs/6/category/components',
    collapsible: true,
    items: [
      {
        text: 'QueryBuilder',
        link: '/docs/6/components/querybuilder',
      },
      {
        text: 'RuleGroup',
        link: '/docs/6/components/rulegroup',
      },
      {
        text: 'Rule',
        link: '/docs/6/components/rule',
      },
      {
        text: 'ActionElement',
        link: '/docs/6/components/actionelement',
      },
      {
        text: 'ValueSelector',
        link: '/docs/6/components/valueselector',
      },
      {
        text: 'ValueEditor',
        link: '/docs/6/components/valueeditor',
      },
      {
        text: 'NotToggle',
        link: '/docs/6/components/nottoggle',
      },
      {
        text: 'DragHandle',
        link: '/docs/6/components/draghandle',
      },
    ],
  },
  {
    text: 'Styling',
    link: '/docs/6/category/styling',
    collapsible: true,
    items: [
      {
        text: 'Styling overview',
        link: '/docs/6/styling/overview',
      },
      {
        text: 'CSS classes',
        link: '/docs/6/styling/classnames',
      },
    ],
  },
  {
    text: 'Utilities',
    link: '/docs/6/category/utilities',
    collapsible: true,
    items: [
      {
        text: 'Export',
        link: '/docs/6/utils/export',
      },
      {
        text: 'Import',
        link: '/docs/6/utils/import',
      },
      {
        text: 'Hooks',
        link: '/docs/6/utils/hooks',
      },
      {
        text: 'Validation',
        link: '/docs/6/utils/validation',
      },
      {
        text: 'Miscellaneous',
        link: '/docs/6/utils/misc',
      },
    ],
  },
  {
    text: 'Tips & tricks',
    link: '/docs/6/category/tips--tricks',
    collapsible: true,
    items: [
      {
        text: 'Managing operators',
        link: '/docs/6/tips/managing-operators',
      },
      {
        text: 'Path concepts',
        link: '/docs/6/tips/path',
      },
      {
        text: 'Limit rule groups',
        link: '/docs/6/tips/limit-groups',
      },
      {
        text: 'Custom components with fallbacks',
        link: '/docs/6/tips/custom-with-fallback',
      },
      {
        text: 'External controls',
        link: '/docs/6/tips/external-controls',
      },
      {
        text: 'Custom bind variables',
        link: '/docs/6/tips/custom-bind-variables',
      },
      {
        text: 'Adding and removing query properties',
        link: '/docs/6/tips/adding-removing-query-properties',
      },
      {
        text: 'Common mistakes',
        link: '/docs/6/tips/common-mistakes',
      },
    ],
  },
  {
    text: 'Compatibility packages',
    link: '/docs/6/compat',
  },
  {
    text: 'TypeScript reference',
    link: '/docs/6/typescript',
  },
  {
    text: 'Buildless',
    link: '/docs/6/buildless',
  },
  {
    text: 'Migrating to v6',
    link: '/docs/6/migrate',
  },
] satisfies Sidebar[string];
