/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
  ChakraProvider,
  ColorModeProvider,
  ColorModeScript,
  extendTheme,
  useColorMode as useChakraColorMode,
} from '@chakra-ui/react';
import { withDefaultVariant } from '@chakra-ui/theme-utils';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { QueryBuilderChakra } from '@react-querybuilder/chakra';
import Layout from '@theme/Layout';
import { useEffect, useRef, useState } from 'react';
import { Loading } from '../_utils';
import './_styles/demo.scss';
import './_styles/rqb-chakra.scss';

const chakraTheme = extendTheme(
  { config: { initialColorMode: 'light', useSystemColorMode: false } },
  withDefaultVariant({ variant: 'solid' })
);

function ReactQueryBuilderDemo_ChakraBrowser() {
  const { colorMode } = useColorMode();
  const { colorMode: chakraColorMode, setColorMode } = useChakraColorMode();
  const firstRender = useRef(true);
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

  useEffect(() => {
    const doReload = !firstRender.current && colorMode !== chakraColorMode;
    setColorMode(colorMode);
    if (doReload)
      setTimeout(() => {
        window.location.reload();
      });
    firstRender.current = false;
  }, [chakraColorMode, colorMode, setColorMode]);

  if (!Demo) return <Loading />;

  return (
    <ChakraProvider theme={chakraTheme} resetCSS={false}>
      <QueryBuilderChakra>
        <Demo variant="chakra" />
      </QueryBuilderChakra>
    </ChakraProvider>
  );
}

export default function ReactQueryBuilderDemo_Chakra() {
  return (
    <Layout description="React Query Builder Demo">
      <ColorModeScript />
      <BrowserOnly fallback={<Loading />}>
        {() => (
          <ColorModeProvider>
            <ReactQueryBuilderDemo_ChakraBrowser />
          </ColorModeProvider>
        )}
      </BrowserOnly>
    </Layout>
  );
}
