import type { SidebarItem } from '@rspress/core';

export default [
  {
    text: 'Getting started',
    link: '/docs/5/intro',
  },
  {
    text: 'API',
    link: '/docs/5/category/api',
    collapsible: true,
    items: [
      {
        text: '<QueryBuilder />',
        link: '/docs/5/api/querybuilder',
      },
      {
        text: '<ValueEditor />',
        link: '/docs/5/api/valueeditor',
      },
      {
        text: 'CSS classes',
        link: '/docs/5/api/classnames',
      },
      {
        text: 'Export',
        link: '/docs/5/api/export',
      },
      {
        text: 'Import',
        link: '/docs/5/api/import',
      },
      {
        text: 'Validation',
        link: '/docs/5/api/validation',
      },
      {
        text: 'Miscellaneous',
        link: '/docs/5/api/misc',
      },
    ],
  },
  {
    text: 'Tips & tricks',
    link: '/docs/5/category/tips-tricks',
    collapsible: true,
    items: [
      {
        text: 'Styling',
        link: '/docs/5/tips/styling',
      },
      {
        text: 'Managing operators',
        link: '/docs/5/tips/managing-operators',
      },
      {
        text: 'Limit rule groups',
        link: '/docs/5/tips/limit-groups',
      },
      {
        text: 'Custom components with fallbacks',
        link: '/docs/5/tips/custom-with-fallback',
      },
      {
        text: 'External controls',
        link: '/docs/5/tips/external-controls',
      },
      {
        text: 'Custom bind variables',
        link: '/docs/5/tips/custom-bind-variables',
      },
      {
        text: 'Adding and removing query properties',
        link: '/docs/5/tips/adding-removing-query-properties',
      },
      {
        text: 'Common mistakes',
        link: '/docs/5/tips/common-mistakes',
      },
    ],
  },
  {
    text: 'Compatibility packages',
    link: '/docs/5/compat',
  },
  {
    text: 'TypeScript reference',
    link: '/docs/5/typescript',
  },
  {
    text: 'UMD build',
    link: '/docs/5/umd',
  },
  {
    text: 'Migrating to v5',
    link: '/docs/5/migrate',
  },
] satisfies SidebarItem[];
