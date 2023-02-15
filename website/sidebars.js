// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
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
        'components/querybuilder',
        'components/rulegroup',
        'components/rule',
        'components/actionelement',
        'components/valueselector',
        'components/valueeditor',
        'components/nottoggle',
        'components/draghandle',
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
        'tips/managing-operators',
        'tips/limit-groups',
        'tips/custom-with-fallback',
        'tips/external-controls',
        'tips/custom-bind-variables',
        'tips/adding-removing-query-properties',
        'tips/common-mistakes',
      ],
    },
    'compat',
    'typescript',
    'buildless',
    'migrate',
  ],
};

module.exports = sidebars;
