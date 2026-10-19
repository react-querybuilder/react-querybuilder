// Docusaurus API shims for Rspress (first-pass migration). Replace call sites incrementally.
import { NoSSR, useDark, useLocation as useRspressLocation, useSite } from '@rspress/core/runtime';
import {
  CodeBlockRuntime,
  Link as RspressLink,
  Tab,
  Tabs as RspressTabs,
} from '@rspress/core/theme';
import * as React from 'react';

/** `@docusaurus/BrowserOnly` */
export const BrowserOnly = ({
  children,
  fallback,
}: {
  children: () => React.ReactNode;
  fallback?: React.ReactNode;
}) => <NoSSR>{typeof window === 'undefined' ? fallback : children()}</NoSSR>;

/** `@docusaurus/theme-common` `useColorMode` (read-only) */
export const useColorMode = () => ({ colorMode: useDark() ? 'dark' : 'light' }) as const;

/** `@theme/Layout` — Rspress provides layout (`pageType: custom`) */
export const Layout = ({ children }: { children?: React.ReactNode; [k: string]: unknown }) => (
  <>{children}</>
);

/** `@docusaurus/Link` */
export const Link = ({
  to,
  href,
  ...rest
}: { to?: string; href?: string } & Omit<React.ComponentProps<typeof RspressLink>, 'href'>) => (
  <RspressLink href={to ?? href ?? ''} {...rest} />
);

/** `@docusaurus/router` */
export const useLocation = useRspressLocation;

/** `@docusaurus/useDocusaurusContext` */
export const useDocusaurusContext = () => {
  const { site } = useSite();
  return { siteConfig: { title: site.title, tagline: site.description } };
};

/** `@theme/CodeBlock` */
export const CodeBlock = ({
  children,
  language,
  title,
}: {
  children: string;
  language?: string;
  title?: string;
  [k: string]: unknown;
}) => <CodeBlockRuntime lang={language ?? 'text'} title={title} code={children} />;

/** `@theme/Tabs` + `@theme/TabItem` */
export const Tabs = RspressTabs;
export const TabItem = ({
  label,
  value,
  children,
}: {
  label?: string;
  value?: string;
  children?: React.ReactNode;
  [k: string]: unknown;
}) => <Tab label={label ?? value}>{children}</Tab>;

/** `@theme/Details` */
export const Details = ({
  summary,
  children,
  ...rest
}: React.DetailsHTMLAttributes<HTMLDetailsElement> & { summary?: React.ReactNode }) => (
  <details {...rest}>
    {summary && <summary>{summary}</summary>}
    {children}
  </details>
);
