import type { Sidebar } from '@rspress/core';

export default [
  {
    text: 'Getting started',
    link: '/docs/4/intro',
  },
  {
    text: 'API',
    link: '/docs/4/category/api',
    collapsible: true,
    items: [
      {
        text: '&lt;QueryBuilder /&gt;',
        link: '/docs/4/api/querybuilder',
      },
      {
        text: '&lt;ValueEditor /&gt;',
        link: '/docs/4/api/valueeditor',
      },
      {
        text: 'CSS classes',
        link: '/docs/4/api/classnames',
      },
      {
        text: 'Export',
        link: '/docs/4/api/export',
      },
      {
        text: 'Import',
        link: '/docs/4/api/import',
      },
      {
        text: 'Validation',
        link: '/docs/4/api/validation',
      },
      {
        text: 'Miscellaneous',
        link: '/docs/4/api/misc',
      },
    ],
  },
  {
    text: 'Tips & tricks',
    link: '/docs/4/category/tips--tricks',
    collapsible: true,
    items: [
      {
        text: 'Managing operators',
        link: '/docs/4/tips/managing-operators',
      },
      {
        text: 'Limit rule groups',
        link: '/docs/4/tips/limit-groups',
      },
      {
        text: 'Custom components with fallbacks',
        link: '/docs/4/tips/custom-with-fallback',
      },
      {
        text: 'External controls',
        link: '/docs/4/tips/external-controls',
      },
      {
        text: 'Custom bind variables',
        link: '/docs/4/tips/custom-bind-variables',
      },
      {
        text: 'Adding and removing query properties',
        link: '/docs/4/tips/adding-removing-query-properties',
      },
      {
        text: 'Common mistakes',
        link: '/docs/4/tips/common-mistakes',
      },
    ],
  },
  {
    text: 'Compatibility packages',
    link: '/docs/4/compat',
  },
  {
    text: 'TypeScript reference',
    link: '/docs/4/typescript',
  },
  {
    text: 'UMD build',
    link: '/docs/4/umd',
  },
  {
    text: 'Migrating to v4',
    link: '/docs/4/migrate',
  },
] satisfies Sidebar[string];
