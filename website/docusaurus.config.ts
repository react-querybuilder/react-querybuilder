import type { Options as PluginContentDocsOptions } from '@docusaurus/plugin-content-docs';
import type { Options as PresetClassicOptions, ThemeConfig } from '@docusaurus/preset-classic';
import remarkPluginNpm2Yarn from '@docusaurus/remark-plugin-npm2yarn';
import type { Config } from '@docusaurus/types';
import type { PluginOptions as DocusaurusPluginTypedocOptions } from 'docusaurus-plugin-typedoc';
import path from 'node:path';
import { themes } from 'prism-react-renderer';
import rehypeRaw from 'rehype-raw';
import type { TypeDocOptions } from 'typedoc';
import { discordLink } from './src/constants';
import { remarkPluginImport } from './src/plugins/remark-plugin-import';

const config: Config = {
  title: 'React Query Builder',
  tagline: 'A minimally opinionated, fully customizable query builder solution',
  url: 'https://react-querybuilder.js.org',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/react-querybuilder.png',
  organizationName: 'react-querybuilder',
  projectName: 'react-querybuilder.github.io',
  trailingSlash: false,
  deploymentBranch: 'gh-pages',
  clientModules: [
    path.resolve('./static/js/console.js'),
    path.resolve('./static/js/loadRqbUtils.js'),
  ],
  future: {
    experimental_faster: true,
    v4: true,
  },
  plugins: [
    'docusaurus-plugin-sass',
    [
      '@docusaurus/plugin-client-redirects',
      {
        fromExtensions: ['html', 'htm'],
        toExtensions: ['exe', 'zip'],
        redirects: [
          {
            from: '/react-querybuilder',
            to: '/demo',
          },
        ],
      },
    ],
    () => ({
      name: 'rqb-crypto-fallback',
      configureWebpack: () => ({
        resolve: {
          fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
          },
        },
      }),
    }),
    async (_context, _options) => ({
      name: 'docusaurus-tailwindcss',
      configurePostCss: postcssOptions => {
        postcssOptions.plugins.push(
          require.resolve('@tailwindcss/postcss'),
          require('postcss-prefix-selector')({
            prefix: '.rqb-tremor',
            includeFiles: [/rqb-tremor.css/],
          }),
          require.resolve('../utils/devapp/postcss-scoped-donut')
        );
        return postcssOptions;
      },
    }),
    // () => ({
    //   // This is not actually used, only here just in case
    //   name: 'rqb-wp5-raw-loader',
    //   configureWebpack: () => ({
    //     module: { rules: [{ resourceQuery: /raw/, type: 'asset/source' }] },
    //   }),
    // }),
    process.env.RQB_TYPEDOC_DONE
      ? null
      : [
          'docusaurus-plugin-typedoc',
          {
            entryPointStrategy: 'packages',
            entryPoints: ['../packages/*'],
            out: './api',
            cleanOutputDir: false,
            includeVersion: true,
            name: 'React Query Builder API',
            readme: 'none',
            textContentMappings: {
              'title.indexPage': 'React Query Builder API',
              'title.memberPage': '{name}',
              'footer.text':
                ':::caution\n\nAPI documentation is generated from the latest commit on the [`main` branch](https://github.com/react-querybuilder/react-querybuilder/tree/main). It may be somewhat inconsistent with official releases of React Query Builder.\n\n:::',
            },
            enumMembersFormat: 'table',
            parametersFormat: 'table',
            propertiesFormat: 'list',
            indexFormat: 'table',
            sidebar: {
              autoConfiguration: true,
              deprecatedItemClassName: 'deprecated',
              pretty: true,
              typescript: false,
            },
            sortEntryPoints: true,
            hideGroupHeadings: true,
            pretty: true,
            expandObjects: true,
            expandParameters: true,
            strikeDeprecatedPageTitles: true,
            plugin: ['typedoc-plugin-frontmatter', './api-gitkeep.mjs'],
          } satisfies Partial<DocusaurusPluginTypedocOptions & TypeDocOptions>,
        ],
    [
      'content-docs',
      {
        id: 'api',
        path: 'api',
        routeBasePath: 'api',
        editUrl: 'https://github.com/react-querybuilder/react-querybuilder/edit/main/website/',
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        versions: { current: { label: 'Latest' } },
        breadcrumbs: false,
        sidebarPath: require.resolve('./sidebar-api.js'),
      } satisfies PluginContentDocsOptions,
    ],
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          beforeDefaultRemarkPlugins: [remarkPluginImport],
          remarkPlugins: [
            [remarkPluginNpm2Yarn, { sync: true, converters: ['bun', 'yarn', 'pnpm'] }],
          ],
          rehypePlugins: [
            [
              rehypeRaw,
              {
                passThrough: [
                  'mdxFlowExpression',
                  'mdxjsEsm',
                  'mdxJsxFlowElement',
                  'mdxJsxTextElement',
                  'mdxTextExpression',
                ],
              },
            ],
          ],
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/react-querybuilder/react-querybuilder/edit/main/website/',
          versions: {
            3: { label: 'v3' },
            4: { label: 'v4' },
            5: { label: 'v5' },
            6: { label: 'v6' },
            7: { label: 'v7 / v8' },
            current: { label: 'Next' },
          },
        },
        // blog: {
        //   showReadingTime: true,
        //   editUrl:
        //     'https://github.com/react-querybuilder/react-querybuilder/edit/main/website/',
        // },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        gtag: {
          trackingID: 'G-7VHBQ0YBTJ',
        },
      } satisfies PresetClassicOptions,
    ],
  ],

  themeConfig: {
    algolia: {
      appId: '1ECMJ15RQA',
      apiKey: '359cf32327b9778459b13f4631f71027',
      indexName: 'react-querybuilder',
      // contextualSearch: true,
      // searchParameters: {},
    },
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'React Query Builder',
      logo: {
        alt: 'React Query Builder Logo',
        src: 'img/react-querybuilder.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'components/querybuilder',
          position: 'right',
          label: 'Docs',
        },
        {
          to: '/demo',
          label: 'Demo',
          position: 'right',
        },
        {
          to: '/api',
          label: 'API',
          position: 'right',
        },
        // {to: '/blog', label: 'Blog', position: 'right'},
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/react-querybuilder/react-querybuilder',
          'aria-label': 'GitHub repository',
          position: 'right',
          className: 'header-github-link',
        },
        {
          to: '/discord',
          'aria-label': 'Discord server',
          position: 'right',
          className: 'header-discord-link',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting started',
              to: '/docs/intro',
            },
            {
              label: 'Components',
              to: '/docs/components/querybuilder',
            },
            {
              label: 'Tips & Tricks',
              to: '/docs/category/tips--tricks',
            },
            {
              label: 'Showcase',
              to: '/demo',
            },
            {
              label: 'Changelog',
              to: '/docs/changelog',
            },
          ],
        },
        {
          title: 'External',
          items: [
            // {
            //   label: 'Blog',
            //   to: '/blog',
            // },
            {
              label: 'GitHub',
              href: 'https://github.com/react-querybuilder/react-querybuilder',
            },
            {
              label: 'Discord',
              href: discordLink,
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/react-querybuilder',
            },
            {
              label: 'Support ♥',
              href: 'https://github.com/sponsors/jakeboone02',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} React Query Builder authors. Built with Docusaurus.<br><br><a href="https://www.netlify.com"><img src="https://www.netlify.com/v3/img/components/netlify-dark.svg" alt="Deploys by Netlify" /></a>`,
    },
    prism: {
      theme: themes.github,
      darkTheme: themes.dracula,
      additionalLanguages: ['diff', 'json', 'mongodb', 'scss'],
    },
  } satisfies ThemeConfig,
};

export default config;
