import type { Options as PluginContentDocsOptions } from '@docusaurus/plugin-content-docs';
import type { Options as PresetClassicOptions, ThemeConfig } from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes } from 'prism-react-renderer/dist/index.mjs';
import { remarkPluginImport } from './src/plugins/remark-plugin-import';

const config: Config = {
  title: 'React Query Builder',
  tagline: 'The Query Builder Component for React',
  url: 'https://react-querybuilder.js.org',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/react-querybuilder.png',
  organizationName: 'react-querybuilder',
  projectName: 'react-querybuilder.github.io',
  trailingSlash: false,
  deploymentBranch: 'gh-pages',
  clientModules: ['/js/loadRqbUtils.js'],
  scripts: [{ src: '/js/console.js', async: false }],
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
      configurePostCss(postcssOptions) {
        postcssOptions.plugins.push(require.resolve('tailwindcss'));
        postcssOptions.plugins.push(require.resolve('autoprefixer'));
        return postcssOptions;
      },
    }),
    () => ({
      // This is not actually used, only here just in case
      name: 'rqb-wp5-raw-loader',
      configureWebpack: () => ({
        module: { rules: [{ resourceQuery: /raw/, type: 'asset/source' }] },
      }),
    }),
    ...(process.env.RQB_TYPEDOC_DONE
      ? []
      : [
          [
            'docusaurus-plugin-typedoc',
            {
              entryPoints: [
                '../packages/react-querybuilder',
                '../packages/antd',
                '../packages/bootstrap',
                '../packages/bulma',
                '../packages/chakra',
                '../packages/dnd',
                '../packages/fluent',
                '../packages/mantine',
                '../packages/material',
                '../packages/native',
                '../packages/tremor',
              ],
              out: '../api',
              entryPointStrategy: 'packages',
              includeVersion: true,
              name: 'React Query Builder API',
              readme: '_API_INDEX.md',
              indexTitle: 'React Query Builder API',
              includeExtension: false,
              hideMembersSymbol: true,
              sidebar: {
                readmeLabel: 'API Index',
                fullNames: false,
              },
            },
          ],
        ]),
    [
      'content-docs',
      {
        id: 'api',
        path: 'api',
        routeBasePath: 'api',
        editUrl: 'https://github.com/react-querybuilder/react-querybuilder/edit/main/website/',
        sidebarPath: require.resolve('./sidebarAPI.js'),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        versions: { current: { label: 'Latest' } },
        breadcrumbs: false,
      } satisfies PluginContentDocsOptions,
    ],
  ],
  webpack: {
    jsLoader: isServer => ({
      loader: require.resolve('swc-loader'),
      options: {
        jsc: {
          parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } },
          target: 'es2017',
        },
        module: { type: isServer ? 'commonjs' : 'es6' },
      },
    }),
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          beforeDefaultRemarkPlugins: [remarkPluginImport],
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/react-querybuilder/react-querybuilder/edit/main/website/',
          versions: {
            3: {
              label: 'v3.x',
            },
            4: {
              label: 'v4.x',
            },
            5: {
              label: 'v5.x',
            },
            6: {
              label: 'v6.x',
            },
            current: {
              label: 'Next',
            },
          },
        },
        // blog: {
        //   showReadingTime: true,
        //   editUrl:
        //     'https://github.com/react-querybuilder/react-querybuilder/edit/main/website/',
        // },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.scss'),
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
              to: '/discord',
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
      additionalLanguages: ['scss'],
    },
  } satisfies ThemeConfig,
};

export default config;
