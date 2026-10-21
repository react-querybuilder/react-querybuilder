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
  // oxlint-disable-next-line unicorn/prefer-global-this
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
  children: string | string[];
  language?: string;
  title?: string;
  [k: string]: unknown;
}) => (
  <CodeBlockRuntime
    lang={language ?? 'text'}
    title={title}
    code={Array.isArray(children) ? children.join('') : children}
  />
);

const noopSubscribe = () => () => {};

interface DocusaurusTabValue {
  value: string;
  label?: React.ReactNode;
  /** Docusaurus tab `<li>` attrs; only event handlers used (fired on tab change) */
  attributes?: Record<string, unknown>;
}

/** `@theme/Tabs` + `@theme/TabItem` (`queryString` → URL param sync; `values[].attributes`) */
export const Tabs = ({
  queryString,
  values,
  defaultValue,
  onChange,
  children,
  ...rest
}: Omit<React.ComponentProps<typeof RspressTabs>, 'values'> & {
  queryString?: string;
  values?: DocusaurusTabValue[];
}) => {
  const tabValues = React.useMemo(
    () =>
      values ??
      React.Children.toArray(children)
        .filter(React.isValidElement<{ value?: string; label?: React.ReactNode }>)
        .map(c => ({ value: String(c.props.value), label: c.props.label ?? c.props.value })),
    [children, values]
  );
  // URL param at first client render (null during SSR/hydration); `key` remounts uncontrolled
  // Rspress `Tabs` w/ new default
  const urlRef = React.useRef<string | null>(undefined);
  const urlValue = React.useSyncExternalStore(
    noopSubscribe,
    () => {
      if (urlRef.current === undefined) {
        urlRef.current = queryString ? new URLSearchParams(location.search).get(queryString) : null;
      }
      return urlRef.current;
    },
    () => null
  );

  const handleChange = (i: number) => {
    const onSelect = values?.[i]?.attributes?.onMouseUp;
    if (typeof onSelect === 'function') onSelect();
    if (queryString && tabValues[i]) {
      const url = new URL(location.href);
      url.searchParams.set(queryString, tabValues[i].value);
      history.replaceState(history.state, '', url);
    }
    onChange?.(i);
  };

  return (
    <RspressTabs
      key={urlValue ?? ''}
      {...rest}
      values={tabValues.map(({ value, label }) => ({ value, label: label ?? value }))}
      defaultValue={urlValue ?? defaultValue}
      onChange={handleChange}>
      {children}
    </RspressTabs>
  );
};
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
