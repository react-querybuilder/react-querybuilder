import fs from 'node:fs';
import path from 'node:path';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rspress/core';
import { pluginAlgolia } from '@rspress/plugin-algolia';
import { pluginClientRedirects } from '@rspress/plugin-client-redirects';
import { pluginPlayground } from '@rspress/plugin-playground';
import { pluginSitemap } from '@rspress/plugin-sitemap';
import { pluginTypeDoc } from '@rspress/plugin-typedoc';
import { docRedirects } from './redirects';
import sidebar3 from './sidebars/3';
import sidebar4 from './sidebars/4';
import sidebar5 from './sidebars/5';
import sidebar6 from './sidebars/6';
import sidebar7 from './sidebars/7';
import sidebarNext from './sidebars/next';
import { discordLink } from './src/constants';
import { llmsApiPlugin } from './src/plugins/llms-api';
import { remarkPluginImport } from './src/plugins/remark-plugin-import';

const siteUrl = 'https://react-querybuilder.js.org';
const repo = 'https://github.com/react-querybuilder/react-querybuilder';
const pkgRoot = path.resolve(import.meta.dirname, '../packages');
// TypeDoc JSON (emitted w/ API markdown) → `llms-api.txt`
const typedocJsonPath = path.resolve(import.meta.dirname, 'content/api/.typedoc.json');

const llmsEnabled = !!process.env.CI || !!process.env.RQB_LLMS;
const typedocEnabled = !process.env.RQB_TYPEDOC_DONE;

// All `packages/*` except MCP server (CLI, no public API)
const apiPackages = fs
  .readdirSync(pkgRoot, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'mcp')
  .map(d => d.name);

export default defineConfig({
  root: path.join(import.meta.dirname, 'content'),
  outDir: 'build',
  title: 'React Query Builder',
  description: 'A minimally opinionated, fully customizable query builder solution',
  icon: '/img/react-querybuilder.png',
  logo: '/img/react-querybuilder.svg',
  logoText: 'React Query Builder',
  globalStyles: path.join(import.meta.dirname, 'src/css/custom.css'),
  route: { cleanUrls: true },
  markdown: { remarkPlugins: [remarkPluginImport] },
  llms: llmsEnabled
    ? {
        // TODO(rspress): `llmsTxt` callback for section order/exclusions + optional links
      }
    : false,
  themeConfig: {
    darkMode: true,
    lastUpdated: true,
    editLink: { docRepoBaseUrl: `${repo}/edit/main/website/content`, text: 'Edit this page' },
    socialLinks: [
      { icon: 'github', mode: 'link', content: repo },
      { icon: 'discord', mode: 'link', content: discordLink },
    ],
    nav: [
      { text: 'Docs', link: '/docs/components/querybuilder', activeMatch: '^/docs/' },
      { text: 'Demo', link: '/demo' },
      { text: 'API', link: '/api', activeMatch: '^/api/' },
      // version dropdown rendered by `theme/VersionDropdown` via `Layout` `beforeNavMenu` slot
    ],
    // Longest-prefix match wins
    sidebar: {
      '/docs/next/': sidebarNext,
      '/docs/6/': sidebar6,
      '/docs/5/': sidebar5,
      '/docs/4/': sidebar4,
      '/docs/3/': sidebar3,
      '/docs/': sidebar7,
      // '/api/': TODO(rspress): generated from typedoc output (port `sidebar-api.ts` ordering)
    },
  },
  builderConfig: {
    plugins: [pluginSass(), pluginNodePolyfill()],
    resolve: {
      alias: {
        '@site': import.meta.dirname,
        // TODO(rspress): mirror tsconfig `paths` so workspace `src` is used (confirm vs `dist`)
      },
    },
    html: {
      tags: [
        {
          tag: 'script',
          attrs: { async: true, src: 'https://www.googletagmanager.com/gtag/js?id=G-7VHBQ0YBTJ' },
        },
        {
          tag: 'script',
          children:
            "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-7VHBQ0YBTJ');",
        },
      ],
    },
    tools: {
      // Rspress widens fast-refresh `include` to all JS/MDX; Rsbuild 2.2 JS rule has no `exclude`,
      // so node_modules (incl. react-refresh runtime) got instrumented → runtime errors in dev
      bundlerChain: (chain, { CHAIN_ID }) => {
        if (!chain.plugins.has(CHAIN_ID.PLUGIN.REACT_FAST_REFRESH)) return;
        chain
          .plugin(CHAIN_ID.PLUGIN.REACT_FAST_REFRESH)
          .tap(([opts = {}]) => [{ ...opts, exclude: [/[\\/]node_modules[\\/]/] }]);
      },
      postcss: (_, { addPlugins }) => {
        addPlugins([
          require('@tailwindcss/postcss'),
          require('postcss-prefix-selector')({
            prefix: '.rqb-tremor',
            includeFiles: [/rqb-tremor.css/],
          }),
          require('postcss-prefix-selector')({
            prefix: '.rqb-prime',
            includeFiles: [/rqb-prime.css/],
          }),
          require('../utils/devapp/postcss-scoped-donut'),
        ]);
      },
    },
  },
  plugins: [
    pluginAlgolia(),
    pluginSitemap({ siteUrl }),
    pluginClientRedirects({
      redirects: [{ from: '^/react-querybuilder$', to: '/demo' }].concat(
        docRedirects.map(r => ({ from: `^${r.from}$`, to: r.to }))
      ),
    }),
    pluginPlayground({
      defaultRenderMode: 'pure',
      include: ['react-querybuilder', '@react-querybuilder/core', '@react-querybuilder/dnd'],
    }),
    typedocEnabled
      ? pluginTypeDoc({
          entryPoints: apiPackages.map(p => path.join(pkgRoot, p)),
          outDir: 'api',
          setup: app => {
            // Plugin forces flat `kind` router; `member` = Docusaurus layout (`/api/<pkg>/<kind>/<name>`)
            app.options.setValue('router', 'member');
            app.options.setValue('entryPointStrategy', 'packages');
            // Plugin only writes markdown output; emit JSON too (for `llms-api.txt`)
            const convert = app.convert.bind(app);
            app.convert = async () => {
              const project = await convert();
              if (project) await app.generateJson(project, typedocJsonPath);
              return project;
            };
            app.options.setValue('readme', 'none');
            app.options.setValue('includeVersion', true);
            app.options.setValue('name', 'React Query Builder API');
            app.options.setValue('enumMembersFormat', 'table');
            app.options.setValue('parametersFormat', 'table');
            app.options.setValue('propertiesFormat', 'list');
            app.options.setValue('indexFormat', 'table');
            app.options.setValue('sortEntryPoints', true);
            app.options.setValue('hideGroupHeadings', true);
            app.options.setValue('expandObjects', true);
            app.options.setValue('expandParameters', true);
            app.options.setValue('strikeDeprecatedPageTitles', true);
            app.options.setValue('textContentMappings', {
              'title.indexPage': 'React Query Builder API',
              'title.memberPage': '{name}',
              'footer.text': `:::warning\n\nAPI documentation is generated from the latest commit on the [\`main\` branch](${repo}/tree/main). It may be somewhat inconsistent with official releases of React Query Builder.\n\n:::`,
            });
            app.options.setValue('packageOptions', {
              excludeExternals: true,
              externalPattern: [
                '**/@types/react/**',
                '**/styled-system/generated/system.gen.d.ts',
                '**/styled-system/generated/conditions.gen.d.ts',
                '**/@mui/material/ButtonBase/ButtonBase.d.mts',
                '**/@mantine/core/lib/core/Box/**',
                '**/@mantine/core/lib/core/styles-api/styles-api.types.d.ts',
                '**/primereact/tooltip/tooltipoptions.d.ts',
              ],
            });
          },
        })
      : null,
    llmsEnabled ? llmsApiPlugin({ jsonPath: typedocJsonPath, siteUrl }) : null,
  ].filter(p => p !== null),
});
