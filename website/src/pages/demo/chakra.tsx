/* eslint-disable @typescript-eslint/consistent-type-imports */
import { ChakraProvider, defaultSystem, Theme } from '@chakra-ui/react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { QueryBuilderChakra } from '@react-querybuilder/chakra';
import Layout from '@theme/Layout';
import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider } from 'next-themes';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Loading } from '../_utils';
import './_styles/demo.css';
import './_styles/rqb-chakra.css';

const ColorModeProvider = (props: ThemeProviderProps) => (
  <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
);

const Provider = (props: React.PropsWithChildren): React.JSX.Element => {
  const { colorMode } = useColorMode();
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider forcedTheme={colorMode}>{props.children}</ColorModeProvider>
    </ChakraProvider>
  );
};

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

  return (
    <Provider>
      <Theme colorPalette="teal">
        <QueryBuilderChakra>
          <Demo variant="chakra" />
        </QueryBuilderChakra>
      </Theme>
    </Provider>
  );
}

export default function ReactQueryBuilderDemo_Chakra() {
  return (
    <Layout description="React Query Builder Demo">
      <BrowserOnly fallback={<Loading />}>
        {() => <ReactQueryBuilderDemo_ChakraBrowser />}
      </BrowserOnly>
    </Layout>
  );
}
