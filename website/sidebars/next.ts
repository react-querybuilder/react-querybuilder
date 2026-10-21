import type { Sidebar } from '@rspress/core';

export default [
  {
    text: 'Getting started',
    link: '/docs/next/intro',
  },
  {
    text: 'Using with AI agents',
    link: '/docs/next/ai',
  },
  {
    text: 'Components',
    link: '/docs/next/category/components',
    collapsible: true,
    items: [
      {
        text: 'Query Builder',
        link: '/docs/next/components/querybuilder',
        collapsible: true,
        items: [
          {
            text: 'controlElements',
            link: '/docs/next/components/querybuilder-controlelements',
          },
        ],
      },
      {
        text: 'ValueEditor',
        link: '/docs/next/components/valueeditor',
      },
      {
        text: 'ValueSelector',
        link: '/docs/next/components/valueselector',
      },
      {
        text: 'ActionElement',
        link: '/docs/next/components/actionelement',
      },
      {
        text: 'NotToggle',
        link: '/docs/next/components/nottoggle',
      },
      {
        text: 'DragHandle',
        link: '/docs/next/components/draghandle',
      },
      {
        text: 'ShiftActions',
        link: '/docs/next/components/shiftactions',
      },
      {
        text: 'UndoRedoActions',
        link: '/docs/next/components/undoredoactions',
      },
      {
        text: 'InlineCombinator',
        link: '/docs/next/components/inlinecombinator',
      },
      {
        text: 'MatchModeEditor',
        link: '/docs/next/components/matchmodeeditor',
      },
      {
        text: 'RuleGroup',
        link: '/docs/next/components/rulegroup',
      },
      {
        text: 'Rule',
        link: '/docs/next/components/rule',
      },
    ],
  },
  {
    text: 'Styling',
    link: '/docs/next/category/styling',
    collapsible: true,
    items: [
      {
        text: 'Styling overview',
        link: '/docs/next/styling/overview',
      },
      {
        text: 'CSS classes',
        link: '/docs/next/styling/classnames',
      },
    ],
  },
  {
    text: 'Utilities',
    link: '/docs/next/category/utilities',
    collapsible: true,
    items: [
      {
        text: 'Export',
        link: '/docs/next/utils/export',
      },
      {
        text: 'Import',
        link: '/docs/next/utils/import',
      },
      {
        text: 'Query management',
        link: '/docs/next/utils/query-management',
      },
      {
        text: 'Hooks',
        link: '/docs/next/utils/hooks',
      },
      {
        text: 'Framework adapter API',
        link: '/docs/next/utils/framework-adapters',
      },
      {
        text: 'Validation',
        link: '/docs/next/utils/validation',
      },
      {
        text: 'JSON Schema',
        link: '/docs/next/utils/json-schema',
      },
      {
        text: 'Miscellaneous',
        link: '/docs/next/utils/misc',
      },
    ],
  },
  {
    text: 'Tips & tricks',
    link: '/docs/next/category/tips--tricks',
    collapsible: true,
    items: [
      {
        text: 'Customization showcase',
        link: '/docs/next/tips/showcase',
      },
      {
        text: 'Recipes',
        link: '/docs/next/tips/recipes',
      },
      {
        text: 'Working with option lists',
        link: '/docs/next/tips/option-lists',
      },
      {
        text: 'Maximizing rendering performance',
        link: '/docs/next/tips/maximizing-performance',
      },
      {
        text: 'Managing fields',
        link: '/docs/next/tips/managing-fields',
      },
      {
        text: 'Managing operators',
        link: '/docs/next/tips/managing-operators',
      },
      {
        text: 'Custom components with fallbacks',
        link: '/docs/next/tips/custom-with-fallback',
      },
      {
        text: 'Async option list loading',
        link: '/docs/next/tips/async-option-lists',
      },
      {
        text: 'Subqueries and nested data',
        link: '/docs/next/tips/subqueries',
      },
      {
        text: 'Undo / redo',
        link: '/docs/next/tips/undo-redo',
      },
      {
        text: 'Arbitrary updates',
        link: '/docs/next/tips/arbitrary-updates',
      },
      {
        text: 'External controls',
        link: '/docs/next/tips/external-controls',
      },
      {
        text: 'Limit rule groups',
        link: '/docs/next/tips/limit-groups',
      },
      {
        text: 'Adding and removing query properties',
        link: '/docs/next/tips/adding-removing-query-properties',
      },
      {
        text: 'Custom bind variables',
        link: '/docs/next/tips/custom-bind-variables',
      },
      {
        text: 'External parameter manager',
        link: '/docs/next/tips/parameter-manager',
      },
      {
        text: 'Path concepts',
        link: '/docs/next/tips/path',
      },
      {
        text: 'Common mistakes',
        link: '/docs/next/tips/common-mistakes',
      },
      {
        text: 'Comparison with other libraries',
        link: '/docs/next/tips/comparison',
      },
      {
        text: 'Migrating from react-awesome-query-builder',
        link: '/docs/next/tips/migrate-from-raqb',
      },
    ],
  },
  {
    text: 'Compatibility packages',
    link: '/docs/next/compat',
  },
  {
    text: 'Drag-and-drop',
    link: '/docs/next/dnd',
  },
  {
    text: 'Date/time features',
    link: '/docs/next/datetime',
  },
  {
    text: 'Expressions',
    link: '/docs/next/expr',
  },
  {
    text: 'Rules engine',
    link: '/docs/next/rules-engine',
  },
  {
    text: 'TypeScript reference',
    link: '/docs/next/typescript',
  },
  {
    text: 'Buildless',
    link: '/docs/next/buildless',
  },
  {
    text: 'Migrating to RQB@next',
    link: '/docs/next/migrate',
  },
  {
    text: 'Changelog',
    link: '/docs/next/changelog',
  },
] satisfies Sidebar[string];
