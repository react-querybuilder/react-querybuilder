import { useLocation, useNavigate, usePageData, useSidebar } from '@rspress/core/runtime';
import {
  Layout as BaseLayout,
  Overview as BaseOverview,
} from '@rspress/core/theme-original';
import { Search as AlgoliaSearch } from '@rspress/plugin-algolia/runtime';
import * as React from 'react';
import { discordLink } from '../src/constants';
import { versions } from '../versions';
import '../src/client/console.js';
import '../src/client/debug.js';
import '../src/client/loadRqbUtils.js';

const versionOf = (pathname: string) =>
  versions.find(v => v.path !== '/docs' && pathname.startsWith(`${v.path}/`)) ??
  (pathname.startsWith('/docs/') ? versions.find(v => v.id === '7') : undefined);

/** Docusaurus-style version dropdown: maps current page → same page in other version */
const VersionDropdown = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = versionOf(pathname);
  if (!current) return null;
  const rest = pathname.slice(current.path.length);
  return (
    <select
      aria-label="Docs version"
      className="rqb-version-dropdown"
      value={current.id}
      onChange={e => {
        const v = versions.find(x => x.id === e.target.value)!;
        // TODO(rspress): fall back to version root when page missing in target version
        navigate(`${v.path}${rest}`);
      }}>
      {versions.map(v => (
        <option key={v.id} value={v.id}>
          {v.label}
        </option>
      ))}
    </select>
  );
};

/** "Next"/archived version notice */
const VersionBanner = () => {
  const { pathname } = useLocation();
  const v = versionOf(pathname);
  if (!v || v.id === '7') return null;
  return (
    <div className="rspress-directive warning rqb-version-banner">
      <div className="rspress-directive-content">
        {v.id === 'next' ? (
          <>This is unreleased documentation for the next version of React Query Builder.</>
        ) : (
          <>
            This is documentation for React Query Builder {v.label}, which is no longer actively
            maintained.
          </>
        )}{' '}
        For up-to-date documentation, see the{' '}
        <a href={`/docs${pathname.slice(v.path.length)}`}>latest version</a>.
      </div>
    </div>
  );
};

/** Multi-column footer (Rspress `footer` is single message) */
const Footer = () => (
  <footer className="rqb-footer">
    <div className="rqb-footer-columns">
      <div>
        <h4>Docs</h4>
        <ul>
          <li>
            <a href="/docs/intro">Getting started</a>
          </li>
          <li>
            <a href="/docs/components/querybuilder">Components</a>
          </li>
          <li>
            <a href="/docs/category/tips--tricks">Tips & Tricks</a>
          </li>
          <li>
            <a href="/demo">Showcase</a>
          </li>
          <li>
            <a href="/docs/changelog">Changelog</a>
          </li>
        </ul>
      </div>
      <div>
        <h4>External</h4>
        <ul>
          <li>
            <a href="https://github.com/react-querybuilder/react-querybuilder">GitHub</a>
          </li>
          <li>
            <a href={discordLink}>Discord</a>
          </li>
          <li>
            <a href="https://www.npmjs.com/package/react-querybuilder">npm</a>
          </li>
          <li>
            <a href="https://github.com/sponsors/jakeboone02">Support ♥</a>
          </li>
        </ul>
      </div>
    </div>
    <p>Copyright © {new Date().getFullYear()} React Query Builder authors. Built with Rspress.</p>
    <a href="https://www.netlify.com">
      <img
        src="https://www.netlify.com/assets/badges/netlify-badge-dark.svg"
        alt="Deploys by Netlify"
      />
    </a>
  </footer>
);

const Layout = () => (
  <BaseLayout
    beforeNavMenu={<VersionDropdown />}
    beforeDocContent={<VersionBanner />}
    bottom={<Footer />}
  />
);

type SbItem = { text?: string; link?: string; items?: SbItem[] };
const stripHtml = (p: string) => p.replace(/(\.html|\/index)$/, '').replace(/\/$/, '');
const findGroup = (items: SbItem[], route: string): SbItem | undefined => {
  for (const it of items) {
    if (it.items && it.link && stripHtml(it.link) === route) return it;
    const found = it.items && findGroup(it.items, route);
    if (found) return found;
  }
};

/**
 * Built-in overview only lists children under the overview page's own URL prefix; category pages
 * (`/docs/category/x`) link elsewhere (`/docs/utils/*`) → empty. Build groups from the sidebar
 * group linking to this page instead (≈ Docusaurus generated-index).
 */
const Overview = (props: React.ComponentProps<typeof BaseOverview>) => {
  const sidebar = useSidebar() as SbItem[];
  const { page, siteData } = usePageData();
  const groups = React.useMemo(() => {
    const group = findGroup(sidebar, stripHtml(page.routePath));
    if (!group?.items) return;
    const toc = (link = '') =>
      siteData.pages.find(p => stripHtml(p.routePath) === stripHtml(link))?.toc ?? [];
    const item = (it: SbItem) => ({
      text: it.text ?? '',
      link: it.link ?? it.items?.[0]?.link ?? '',
      headers: it.items ? [] : toc(it.link).filter(h => h.depth === 2),
      items: it.items?.map(c => ({ text: c.text ?? '', link: c.link ?? '' })),
    });
    return [{ name: '', items: group.items.map(item) }];
  }, [sidebar, page.routePath, siteData.pages]);
  return <BaseOverview {...props} groups={props.groups ?? groups} />;
};

const Search = () => (
  <AlgoliaSearch
    docSearchProps={{
      appId: '1ECMJ15RQA',
      apiKey: '359cf32327b9778459b13f4631f71027',
      indexName: 'react-querybuilder',
    }}
  />
);

export * from '@rspress/core/theme-original';
export { Layout, Overview, Search };
