import type { SidebarItem } from '@rspress/core';

export default [
  {
    text: 'Getting started',
    link: '/docs/intro',
  },
  {
    text: 'Using with AI agents',
    link: '/docs/ai',
  },
  {
    text: 'Components',
    link: '/docs/category/components',
    collapsible: true,
    items: [
      {
        text: 'Query Builder',
        link: '/docs/components/querybuilder',
        collapsible: true,
        items: [
          {
            text: 'controlElements',
            link: '/docs/components/querybuilder-controlelements',
          },
        ],
      },
      {
        text: 'ValueEditor',
        link: '/docs/components/valueeditor',
      },
      {
        text: 'ValueSelector',
        link: '/docs/components/valueselector',
      },
      {
        text: 'ActionElement',
        link: '/docs/components/actionelement',
      },
      {
        text: 'NotToggle',
        link: '/docs/components/nottoggle',
      },
      {
        text: 'DragHandle',
        link: '/docs/components/draghandle',
      },
      {
        text: 'ShiftActions',
        link: '/docs/components/shiftactions',
      },
      {
        text: 'UndoRedoActions',
        link: '/docs/components/undoredoactions',
      },
      {
        text: 'InlineCombinator',
        link: '/docs/components/inlinecombinator',
      },
      {
        text: 'MatchModeEditor',
        link: '/docs/components/matchmodeeditor',
      },
      {
        text: 'RuleGroup',
        link: '/docs/components/rulegroup',
      },
      {
        text: 'Rule',
        link: '/docs/components/rule',
      },
    ],
  },
  {
    text: 'Styling',
    link: '/docs/category/styling',
    collapsible: true,
    items: [
      {
        text: 'Styling overview',
        link: '/docs/styling/overview',
      },
      {
        text: 'CSS classes',
        link: '/docs/styling/classnames',
      },
    ],
  },
  {
    text: 'Utilities',
    link: '/docs/category/utilities',
    collapsible: true,
    items: [
      {
        text: 'Export',
        link: '/docs/utils/export',
      },
      {
        text: 'Import',
        link: '/docs/utils/import',
      },
      {
        text: 'Query management',
        link: '/docs/utils/query-management',
      },
      {
        text: 'Hooks',
        link: '/docs/utils/hooks',
      },
      {
        text: 'Framework adapter API',
        link: '/docs/utils/framework-adapters',
      },
      {
        text: 'Validation',
        link: '/docs/utils/validation',
      },
      {
        text: 'JSON Schema',
        link: '/docs/utils/json-schema',
      },
      {
        text: 'Miscellaneous',
        link: '/docs/utils/misc',
      },
    ],
  },
  {
    text: 'Tips & tricks',
    link: '/docs/category/tips-tricks',
    collapsible: true,
    items: [
      {
        text: 'Customization showcase',
        link: '/docs/tips/showcase',
      },
      {
        text: 'Recipes',
        link: '/docs/tips/recipes',
      },
      {
        text: 'Working with option lists',
        link: '/docs/tips/option-lists',
      },
      {
        text: 'Maximizing rendering performance',
        link: '/docs/tips/maximizing-performance',
      },
      {
        text: 'Managing fields',
        link: '/docs/tips/managing-fields',
      },
      {
        text: 'Managing operators',
        link: '/docs/tips/managing-operators',
      },
      {
        text: 'Custom components with fallbacks',
        link: '/docs/tips/custom-with-fallback',
      },
      {
        text: 'Async option list loading',
        link: '/docs/tips/async-option-lists',
      },
      {
        text: 'Subqueries and nested data',
        link: '/docs/tips/subqueries',
      },
      {
        text: 'Undo / redo',
        link: '/docs/tips/undo-redo',
      },
      {
        text: 'Arbitrary updates',
        link: '/docs/tips/arbitrary-updates',
      },
      {
        text: 'External controls',
        link: '/docs/tips/external-controls',
      },
      {
        text: 'Limit rule groups',
        link: '/docs/tips/limit-groups',
      },
      {
        text: 'Adding and removing query properties',
        link: '/docs/tips/adding-removing-query-properties',
      },
      {
        text: 'Custom bind variables',
        link: '/docs/tips/custom-bind-variables',
      },
      {
        text: 'External parameter manager',
        link: '/docs/tips/parameter-manager',
      },
      {
        text: 'Path concepts',
        link: '/docs/tips/path',
      },
      {
        text: 'Common mistakes',
        link: '/docs/tips/common-mistakes',
      },
      {
        text: 'Comparison with other libraries',
        link: '/docs/tips/comparison',
      },
      {
        text: 'Migrating from react-awesome-query-builder',
        link: '/docs/tips/migrate-from-raqb',
      },
    ],
  },
  {
    text: 'Compatibility packages',
    link: '/docs/compat',
  },
  {
    text: 'Drag-and-drop',
    link: '/docs/dnd',
  },
  {
    text: 'Date/time features',
    link: '/docs/datetime',
  },
  {
    text: 'Expressions',
    link: '/docs/expr',
  },
  {
    text: 'Rules engine',
    link: '/docs/rules-engine',
  },
  {
    text: 'TypeScript reference',
    link: '/docs/typescript',
  },
  {
    text: 'Buildless',
    link: '/docs/buildless',
  },
  {
    text: 'Migrating to v7 or v8',
    link: '/docs/migrate',
  },
  {
    text: 'Changelog',
    link: '/docs/changelog',
  },
] satisfies SidebarItem[];
