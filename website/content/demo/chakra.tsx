/* oxlint-disable typescript/consistent-type-imports */
export const frontmatter = { pageType: 'custom' };

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
  EnvironmentProvider,
  Theme,
} from '@chakra-ui/react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { QueryBuilderChakra } from '@react-querybuilder/chakra';
import rqbStyles from '@react-querybuilder/core/dist/query-builder.css?raw';
import { BrowserOnly } from '@site/src/compat';
import { useColorMode } from '@site/src/compat';
import { Layout } from '@site/src/compat';
import demoStyles from '@site/src/demo/styles/demo.css?raw';
import rqbChakraStyles from '@site/src/demo/styles/rqb-chakra.css?raw';
import { loading } from '@site/src/demo/utils';
import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider } from 'next-themes';
import * as React from 'react';
import { useEffect, useState } from 'react';
import root from 'react-shadow/emotion';
import '@site/src/demo/styles/demo.css';
import '@site/src/demo/styles/rqb-chakra.css';

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
    // One-time init: cache must bind to the shadow root, which react-shadow attaches
    // post-commit (unavailable during render/ref), so it can't be derived in render.
    // oxlint-disable-next-line react/set-state-in-effect
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
    Demo?: typeof import('@site/src/demo/components/Demo').default;
  }>({});

  useEffect(() => {
    let active = true;

    (async () => {
      const { default: ImportedDemo } = await import('@site/src/demo/components/Demo');
      if (active && !Demo) {
        setComponents({ Demo: ImportedDemo });
      }
    })();

    return () => {
      active = false;
    };
  }, [Demo]);

  if (!Demo) return loading;

  return <Demo variant="chakra" queryWrapper={QueryWrapper} />;
}

export default function ReactQueryBuilderDemo_Chakra() {
  return (
    <Layout description="React Query Builder Demo">
      <BrowserOnly fallback={loading}>{() => <ReactQueryBuilderDemo_ChakraBrowser />}</BrowserOnly>
    </Layout>
  );
}
