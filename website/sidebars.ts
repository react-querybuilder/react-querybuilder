import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

export default {
  mySidebar: [
    'intro',
    {
      type: 'category',
      label: 'Components',
      link: {
        type: 'generated-index',
        title: 'Components',
        description: 'React components available from React Query Builder.',
      },
      items: [
        {
          type: 'category',
          label: 'Query Builder',
          link: { type: 'doc', id: 'components/querybuilder' },
          items: [
            {
              type: 'doc',
              label: 'controlElements',
              id: 'components/querybuilder-controlelements',
            },
          ],
        },
        'components/valueeditor',
        'components/valueselector',
        'components/actionelement',
        'components/nottoggle',
        'components/draghandle',
        'components/shiftactions',
        'components/inlinecombinator',
        'components/matchmodeeditor',
        'components/rulegroup',
        'components/rule',
      ],
    },
    {
      type: 'category',
      label: 'Styling',
      link: {
        type: 'generated-index',
        title: 'Styling',
        description: 'Managing the look and feel of React Query Builder.',
      },
      items: ['styling/overview', 'styling/classnames'],
    },
    {
      type: 'category',
      label: 'Utilities',
      link: {
        type: 'generated-index',
        title: 'Utilities',
        description:
          'Hooks, tools for managing queries, importing from/exporting to different query languages, etc.',
      },
      items: ['utils/export', 'utils/import', 'utils/hooks', 'utils/validation', 'utils/misc'],
    },
    {
      type: 'category',
      label: 'Tips & tricks',
      link: {
        type: 'generated-index',
        title: 'Tips & tricks',
        description: 'Miscellaneous advice and advanced configurations.',
      },
      items: [
        'tips/showcase',
        'tips/option-lists',
        'tips/maximizing-performance',
        'tips/managing-fields',
        'tips/managing-operators',
        'tips/custom-with-fallback',
        'tips/async-option-lists',
        'tips/subqueries',
        'tips/arbitrary-updates',
        'tips/external-controls',
        'tips/limit-groups',
        'tips/adding-removing-query-properties',
        'tips/custom-bind-variables',
        'tips/path',
        'tips/common-mistakes',
      ],
    },
    'compat',
    'dnd',
    'datetime',
    'typescript',
    'buildless',
    'migrate',
    'changelog',
  ],
} satisfies SidebarsConfig;
