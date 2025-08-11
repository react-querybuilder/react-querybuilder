/* oxlint-disable typescript/consistent-type-imports */
import demoStyles from '!!raw-loader!./_styles/demo.css';
import rqbChakraStyles from '!!raw-loader!./_styles/rqb-chakra.css';
import rqbStyles from '!!raw-loader!react-querybuilder/dist/query-builder.css';
import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
  EnvironmentProvider,
  Theme,
} from '@chakra-ui/react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { QueryBuilderChakra } from '@react-querybuilder/chakra';
import Layout from '@theme/Layout';
import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider } from 'next-themes';
import * as React from 'react';
import { useEffect, useState } from 'react';
import root from 'react-shadow/emotion';
import { Loading } from '../_utils';
import './_styles/demo.css';
import './_styles/rqb-chakra.css';

const loading = <Loading />;

const varRoot = ':host';
const config = defineConfig({
  cssVarsRoot: varRoot,
  conditions: {
    // light: `${varRoot} &, .light &`,
  },
  preflight: { scope: varRoot },
  globalCss: {
    [varRoot]: defaultConfig.globalCss?.html ?? {},
  },
});
const system = createSystem(defaultConfig, config);

const ColorModeProvider = (props: ThemeProviderProps) => (
  <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
);

export function Provider(props: ThemeProviderProps) {
  const [shadow, setShadow] = useState<HTMLElement | null>(null);
  const [cache, setCache] = useState<ReturnType<typeof createCache> | null>(null);
  const { colorMode } = useColorMode();

  useEffect(() => {
    if (!shadow?.shadowRoot || cache) return;
    const emotionCache = createCache({
      key: 'root',
      container: shadow.shadowRoot,
    });
    setCache(emotionCache);
  }, [shadow, cache]);

  return (
    <root.div ref={setShadow}>
      <style type="text/css">{rqbStyles}</style>
      <style type="text/css">{demoStyles}</style>
      <style type="text/css">{rqbChakraStyles}</style>
      {shadow && cache && (
        <EnvironmentProvider value={() => shadow.shadowRoot ?? document}>
          <CacheProvider value={cache}>
            <ChakraProvider value={system}>
              <ColorModeProvider forcedTheme={colorMode} {...props} />
            </ChakraProvider>
          </CacheProvider>
        </EnvironmentProvider>
      )}
    </root.div>
  );
}

// TODO: Figure out why `<Theme colorPalette="teal">` is not applied
const QueryWrapper = (props: React.PropsWithChildren) => (
  <Provider>
    <Theme colorPalette="teal">
      <QueryBuilderChakra>{props.children}</QueryBuilderChakra>
    </Theme>
  </Provider>
);

function ReactQueryBuilderDemo_ChakraBrowser() {
  const [{ Demo }, setComponents] = useState<{
    Demo?: typeof import('./_components/Demo').default;
  }>({});

  useEffect(() => {
    let active = true;

    (async () => {
      const { default: ImportedDemo } = await import('./_components/Demo');
      if (active && !Demo) {
        setComponents({ Demo: ImportedDemo });
      }
    })();

    return () => {
      active = false;
    };
  }, [Demo]);

  if (!Demo) return <Loading />;

  return <Demo variant="chakra" queryWrapper={QueryWrapper} />;
}

export default function ReactQueryBuilderDemo_Chakra() {
  return (
    <Layout description="React Query Builder Demo">
      <BrowserOnly fallback={loading}>{() => <ReactQueryBuilderDemo_ChakraBrowser />}</BrowserOnly>
    </Layout>
  );
}
